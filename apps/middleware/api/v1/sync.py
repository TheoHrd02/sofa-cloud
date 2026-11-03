"""
SOFA-CLOUD — Routeur sync fournisseur
POST /api/v1/sync/supplier     → ingestion + calcul de prix (dry-run ou save en DB)
GET  /api/v1/sync/mock-pricing → preview pricing des 10 canapés mock
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.supplier import SupplierSyncRequest
from services.supplier import SupplierService
from services.pricing import PricingEngine
from data.mock_products import MOCK_PRODUCTS, VARIANT_SIZES
from core.database import get_db
from core.security import require_api_key

router = APIRouter()


@router.post(
    "/supplier",
    summary="Synchronisation fournisseur (dry-run ou save)",
)
async def sync_supplier(
    request: SupplierSyncRequest,
    session: AsyncSession = Depends(get_db),
    _: str = Depends(require_api_key),
):
    """
    Reçoit un batch de produits fournisseurs bruts.

    - **dry_run=true**  : calcule les prix, retourne un preview, n'écrit rien en DB.
    - **dry_run=false** : persiste SupplierProduct + Product + Variants (idempotent).

    Idempotence garantie :
    - SupplierProduct : upsert par `supplier_ref` (unique)
    - Product : upsert par `supplier_product_id` (1-to-1)
    - Variant : upsert par `sku` (unique)

    En cas d'erreur sur un produit du batch, les autres continuent (best-effort).
    Les produits en erreur sont reportés dans `results[].status = "error"`.
    """
    service = SupplierService()

    if request.dry_run:
        results = service.process_sync_request(request)
        return {
            "dry_run": True,
            "processed": len(results),
            "saved": 0,
            "errors": 0,
            "results": results,
        }

    # dry_run=False → persistence
    response = await service.sync_to_database(request, session)
    return response


@router.get("/mock-pricing", summary="Preview pricing catalogue mock (10 canapés)")
async def mock_pricing_preview():
    """
    Retourne le tableau de pricing complet des 10 canapés mock.
    Démonstration du moteur PricingEngine.
    """
    engine = PricingEngine()
    rows = []

    for p in MOCK_PRODUCTS:
        pricing = engine.calculate(p["supplier_price"])
        variants_pricing = []
        for size in VARIANT_SIZES:
            vp = engine.calculate_variant(p["supplier_price"], size["size_multiplier"])
            variants_pricing.append({
                "size": size["option"],
                "price_ttc": float(vp.price_ttc),
                "compare_at_ttc": float(vp.compare_at_price_ttc),
            })

        rows.append({
            "title": p["title"],
            "style": p["style"],
            "material": p["material"],
            "supplier_price_eur": float(p["supplier_price"]),
            "price_ht": float(pricing.price_ht),
            "price_ttc": float(pricing.price_ttc),
            "compare_at_ttc": float(pricing.compare_at_price_ttc),
            "margin_euros": float(pricing.margin_euros),
            "margin_pct": f"{pricing.margin_pct:.1f}%",
            "formula": (
                f"({p['supplier_price']} × 2.5) + 150 = "
                f"{pricing.price_ht} HT → {pricing.price_ttc} TTC"
            ),
            "variants": variants_pricing,
        })

    return {
        "engine_config": {
            "multiplier": 2.5,
            "fees_eur": 150.0,
            "vat_rate": "20%",
            "compare_at_multiplier": 3.2,
        },
        "products_count": len(rows),
        "catalog": rows,
    }
