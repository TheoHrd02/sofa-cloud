"""
SOFA-CLOUD — Routeur produits
GET /api/v1/products/              → catalogue (provider: local ou shopify)
GET /api/v1/products/pricing-simulator → simulateur de prix
GET /api/v1/products/{handle}      → détail produit
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from core.config import get_settings
from core.database import get_db
from services.pricing import PricingEngine
from providers.factory import get_catalog_provider

router = APIRouter()


# ─── Routes ───────────────────────────────────────────────────────────────────


@router.get("/", summary="Liste du catalogue produits")
async def list_products(
    limit: int = Query(default=10, le=50),
    offset: int = Query(default=0, ge=0),
    q: str | None = Query(default=None, description="Recherche full-text (titre, matière, style)"),
    session: AsyncSession = Depends(get_db),
):
    """
    Retourne le catalogue des canapés.

    Source selon CATALOG_PROVIDER :
    - local : DB + mock fallback
    - shopify : Storefront API
    Le front ne sait pas quelle source est utilisée.
    """
    provider = get_catalog_provider()
    provider_name = get_settings().catalog_provider.strip().lower()

    if provider_name == "shopify":
        total, products, source = await provider.list_products(limit=limit, offset=offset, q=q)
    else:
        total, products, source = await provider.list_products(
            limit=limit, offset=offset, q=q, session=session
        )

    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "source": source,
        "products": products,
    }


@router.get("/pricing-simulator", summary="Simulateur de prix")
async def pricing_simulator(
    supplier_price: float = Query(..., gt=0, description="Prix fournisseur HT en €"),
    multiplier: float = Query(default=2.5, gt=1),
    fees: float = Query(default=150.0, ge=0),
    vat_rate: float = Query(default=0.20, ge=0, le=1),
):
    """Calcule le prix Shopify et la marge à partir d'un prix fournisseur brut."""
    engine = PricingEngine(multiplier=multiplier, fees=fees, vat_rate=vat_rate)
    result = engine.calculate(supplier_price)
    return {
        "input": {
            "supplier_price": supplier_price,
            "multiplier": multiplier,
            "fees": fees,
            "vat_rate": f"{vat_rate*100:.0f}%",
        },
        "output": result.to_dict(),
        "formula": (
            f"({supplier_price} × {multiplier}) + {fees} = "
            f"{result.price_ht} HT → {result.price_ttc} TTC"
        ),
    }


@router.get("/{handle}", summary="Détail d'un produit par handle")
async def get_product(
    handle: str,
    session: AsyncSession = Depends(get_db),
):
    """
    Retourne le détail complet d'un produit par son handle.
    Source selon CATALOG_PROVIDER (local ou shopify).
    """
    provider = get_catalog_provider()
    provider_name = get_settings().catalog_provider.strip().lower()

    if provider_name == "shopify":
        product = await provider.get_product(handle)
    else:
        product = await provider.get_product(handle, session=session)

    if product is None:
        raise HTTPException(status_code=404, detail=f"Produit '{handle}' introuvable.")

    return product
