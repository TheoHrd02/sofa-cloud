"""
SOFA-CLOUD — Supplier Service
Transforme les données brutes fournisseur en produits Sofa-Cloud.

Deux modes :
  - process_sync_request()  : synchrone, dry_run, aucune écriture DB
  - sync_to_database()      : async, persiste SupplierProduct + Product + Variant
"""

import re
import unicodedata
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.product import SupplierProduct as SupplierProductModel, Product, Variant
from schemas.supplier import SupplierProductIn, SupplierSyncRequest
from schemas.shopify import ShopifyProductInput, ShopifyVariantInput, ShopifyOptionInput
from schemas.product import SyncResultItem, SyncResponse
from services.pricing import PricingEngine
from data.mock_products import MOCK_PRODUCTS, VARIANT_SIZES


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _slugify(text: str) -> str:
    """
    Convertit un nom produit en handle URL-safe.
    "L'Édimbourg" → "l-edimbourg", "Le Montaigne" → "le-montaigne"
    """
    text = text.replace("'", "-").replace("'", "-")
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s-]+", "-", text.strip())
    return text


def _build_variant_rows(raw: SupplierProductIn, engine: PricingEngine) -> list[dict]:
    """
    Construit les lignes de variantes à persister.
    Si le fournisseur envoie ses propres variantes, on les utilise.
    Sinon on génère les 3 tailles standard (2/3/4 places).
    """
    ref_clean = raw.supplier_ref.replace("SUP-", "").replace("-", "")

    if raw.variants:
        rows = []
        for v in raw.variants:
            size_mult = {"2 Places": 0.85, "3 Places": 1.0, "4 Places": 1.18}.get(
                v.option_name, 1.0
            )
            pricing = engine.calculate_variant(
                raw.raw_price + v.raw_price_delta, size_mult
            )
            sku_suffix = v.option_name.replace(" ", "").upper()
            rows.append({
                "option1": v.option_name,
                "option2": v.option_value,
                "sku": v.supplier_sku or f"{ref_clean}-{sku_suffix}",
                "price": pricing.price_ttc,
                "compare_at_price": pricing.compare_at_price_ttc,
                "weight_kg": v.weight_kg,
                "inventory_qty": v.stock_qty,
            })
        return rows

    # Default: 3 tailles standard
    rows = []
    for size in VARIANT_SIZES:
        pricing = engine.calculate_variant(raw.raw_price, size["size_multiplier"])
        sku_suffix = size["option"].replace(" ", "").upper()
        rows.append({
            "option1": size["option"],
            "option2": None,
            "sku": f"{ref_clean}-{sku_suffix}",
            "price": pricing.price_ttc,
            "compare_at_price": pricing.compare_at_price_ttc,
            "weight_kg": size["weight_kg"],
            "inventory_qty": size["stock"],
        })
    return rows


# ─── Service ──────────────────────────────────────────────────────────────────

class SupplierService:
    """
    Orchestrateur principal.
    """

    def __init__(self, pricing_engine: PricingEngine | None = None):
        self.engine = pricing_engine or PricingEngine()

    # ── Sync methods (dry_run, synchronous) ───────────────────────────────────

    def process_product(self, raw: SupplierProductIn) -> dict:
        """Calcule les prix sans écrire en DB. Utilisé pour dry_run."""
        base_pricing = self.engine.calculate(raw.raw_price)
        computed_variants = []
        for row in _build_variant_rows(raw, self.engine):
            computed_variants.append({
                "option": row["option1"],
                "price_ttc": float(row["price"]),
                "compare_at_price_ttc": float(row["compare_at_price"]),
                "sku": row["sku"],
                "weight_kg": row["weight_kg"],
                "stock_qty": row["inventory_qty"],
            })
        return {
            "supplier_ref": raw.supplier_ref,
            "title": raw.supplier_name,
            "handle": _slugify(raw.supplier_name),
            "supplier_price": float(raw.raw_price),
            "base_pricing": base_pricing.to_dict(),
            "variants": computed_variants,
        }

    def process_sync_request(self, request: SupplierSyncRequest) -> list[dict]:
        """
        dry_run=True  → calcul sans sauvegarde, retourne le preview.
        dry_run=False → doit utiliser sync_to_database() (async).
        """
        results = []
        for raw in request.products:
            processed = self.process_product(raw)
            results.append({
                "supplier_ref": processed["supplier_ref"],
                "status": "computed",
                "handle": processed["handle"],
                "pricing": processed["base_pricing"],
                "variants_count": len(processed["variants"]),
            })
        return results

    # ── DB methods (async) ────────────────────────────────────────────────────

    async def _upsert_supplier_product(
        self, raw: SupplierProductIn, session: AsyncSession
    ) -> SupplierProductModel:
        """
        Upsert SupplierProduct par supplier_ref (clé unique).
        Retourne l'entité persistée avec son ID.
        """
        result = await session.execute(
            select(SupplierProductModel).where(
                SupplierProductModel.supplier_ref == raw.supplier_ref
            )
        )
        sp = result.scalar_one_or_none()

        total_stock = (
            sum(v.stock_qty for v in raw.variants)
            if raw.variants
            else sum(s["stock"] for s in VARIANT_SIZES)
        )

        if sp is None:
            sp = SupplierProductModel(
                supplier_ref=raw.supplier_ref,
                supplier_name=raw.supplier_name,
                raw_price=raw.raw_price,
                stock_qty=total_stock,
                raw_data=raw.model_dump(mode="json"),
                last_synced_at=datetime.now(timezone.utc),
            )
            session.add(sp)
            await session.flush()   # récupère sp.id avant la FK product
        else:
            sp.supplier_name = raw.supplier_name
            sp.raw_price = raw.raw_price
            sp.stock_qty = total_stock
            sp.raw_data = raw.model_dump(mode="json")
            sp.last_synced_at = datetime.now(timezone.utc)

        return sp

    async def _upsert_product(
        self,
        raw: SupplierProductIn,
        sp: SupplierProductModel,
        base_pricing,
        session: AsyncSession,
    ) -> Product:
        """
        Upsert Product par supplier_product_id.
        Si le handle génère un conflit avec un produit sans lien fournisseur,
        on suffixe le handle avec les 4 derniers chars du supplier_ref.
        """
        # Cherche par supplier_product_id (lien canonique 1-to-1)
        result = await session.execute(
            select(Product).where(Product.supplier_product_id == sp.id)
        )
        product = result.scalar_one_or_none()

        handle = _slugify(raw.supplier_name)
        tags = [t for t in [raw.material, raw.style, raw.color_family] if t]

        if product is None:
            # Vérifie conflit sur handle (produit sans fournisseur portant le même handle)
            handle_conflict = await session.execute(
                select(Product).where(Product.handle == handle)
            )
            if handle_conflict.scalar_one_or_none() is not None:
                handle = f"{handle}-{raw.supplier_ref[-4:].lower().replace('-', '')}"

            product = Product(
                supplier_product_id=sp.id,
                title=raw.supplier_name,
                handle=handle,
                body_html=raw.description or "",
                vendor="Sofa-Cloud",
                product_type="Canapé",
                tags=tags,
                material=raw.material,
                style=raw.style,
                color_family=raw.color_family,
                image_urls=raw.image_urls,
                supplier_price=raw.raw_price,
                price_ht=base_pricing.price_ht,
                price_ttc=base_pricing.price_ttc,
                compare_at_price=base_pricing.compare_at_price_ttc,
                margin_pct=base_pricing.margin_pct,
                is_active=True,
            )
            session.add(product)
            await session.flush()   # récupère product.id avant les variants
        else:
            # UPDATE — re-calcul du prix et mise à jour des infos fournisseur
            product.title = raw.supplier_name
            product.body_html = raw.description or product.body_html
            product.tags = tags
            product.material = raw.material
            product.style = raw.style
            product.color_family = raw.color_family
            product.image_urls = raw.image_urls or product.image_urls
            product.supplier_price = raw.raw_price
            product.price_ht = base_pricing.price_ht
            product.price_ttc = base_pricing.price_ttc
            product.compare_at_price = base_pricing.compare_at_price_ttc
            product.margin_pct = base_pricing.margin_pct
            product.updated_at = datetime.now(timezone.utc)

        return product

    async def _upsert_variants(
        self,
        raw: SupplierProductIn,
        product: Product,
        session: AsyncSession,
    ) -> int:
        """
        Upsert variants par SKU.
        - SKU existant → UPDATE stock + prix
        - Nouveau SKU → INSERT
        Retourne le nombre de variants traités.
        """
        variant_rows = _build_variant_rows(raw, self.engine)

        # Charge les variants existants pour ce produit
        existing_result = await session.execute(
            select(Variant).where(Variant.product_id == product.id)
        )
        existing_by_sku: dict[str, Variant] = {
            v.sku: v for v in existing_result.scalars().all()
        }

        for row in variant_rows:
            sku = row["sku"]
            if sku in existing_by_sku:
                v = existing_by_sku[sku]
                v.price = row["price"]
                v.compare_at_price = row["compare_at_price"]
                v.inventory_qty = row["inventory_qty"]
                v.weight_kg = row["weight_kg"]
                v.option2 = row.get("option2")
            else:
                v = Variant(
                    product_id=product.id,
                    option1=row["option1"],
                    option2=row.get("option2"),
                    sku=sku,
                    price=row["price"],
                    compare_at_price=row["compare_at_price"],
                    weight_kg=row["weight_kg"],
                    inventory_qty=row["inventory_qty"],
                )
                session.add(v)

        return len(variant_rows)

    async def _sync_one(
        self, raw: SupplierProductIn, session: AsyncSession
    ) -> SyncResultItem:
        """
        Persiste un seul produit fournisseur (SupplierProduct + Product + Variants).
        Utilisé dans une savepoint pour l'isolation par produit.
        """
        base_pricing = self.engine.calculate(raw.raw_price)

        sp = await self._upsert_supplier_product(raw, session)
        product = await self._upsert_product(raw, sp, base_pricing, session)
        variants_count = await self._upsert_variants(raw, product, session)

        return SyncResultItem(
            supplier_ref=raw.supplier_ref,
            status="saved",
            product_id=str(product.id),
            handle=product.handle,
            pricing=base_pricing.to_dict(),
            variants_count=variants_count,
        )

    async def sync_to_database(
        self, request: SupplierSyncRequest, session: AsyncSession
    ) -> SyncResponse:
        """
        Persiste tous les produits du batch.
        Stratégie : best-effort per-product via savepoints.
        Un produit en erreur ne bloque pas les suivants.
        """
        results: list[SyncResultItem] = []
        saved = 0
        errors = 0

        for raw in request.products:
            sp = await session.begin_nested()   # SAVEPOINT
            try:
                item = await self._sync_one(raw, session)
                await sp.commit()               # RELEASE SAVEPOINT
                results.append(item)
                saved += 1
            except Exception as exc:
                await sp.rollback()             # ROLLBACK TO SAVEPOINT
                results.append(SyncResultItem(
                    supplier_ref=raw.supplier_ref,
                    status="error",
                    pricing={},
                    variants_count=0,
                    error=str(exc),
                ))
                errors += 1

        return SyncResponse(
            dry_run=False,
            processed=len(request.products),
            saved=saved,
            errors=errors,
            results=results,
        )

    # ── Shopify payload builder ───────────────────────────────────────────────

    def build_shopify_payload(
        self, product_data: dict, body_html: str, tags: list[str]
    ) -> ShopifyProductInput:
        """Construit le payload Shopify prêt à envoyer à l'Admin API."""
        variants = [
            ShopifyVariantInput.from_decimals(
                option1=v["option"],
                price=v["price_ttc"],
                compare_at_price=v["compare_at_price_ttc"],
                sku=v["sku"],
                inventory_qty=v["stock_qty"],
                weight_kg=v["weight_kg"],
            )
            for v in product_data["variants"]
        ]
        return ShopifyProductInput(
            title=product_data["title"],
            body_html=body_html,
            tags=tags,
            variants=variants,
            options=[ShopifyOptionInput(
                name="Taille",
                values=[v["option"] for v in product_data["variants"]],
            )],
        )

    # ── Mock catalog (fallback when DB is empty) ──────────────────────────────

    @staticmethod
    def get_mock_catalog() -> list[dict]:
        """Retourne les 10 canapés mock avec pricing calculé."""
        engine = PricingEngine()
        catalog = []
        for product in MOCK_PRODUCTS:
            pricing = engine.calculate(product["supplier_price"])
            variants = []
            for size in VARIANT_SIZES:
                v_pricing = engine.calculate_variant(
                    product["supplier_price"], size["size_multiplier"]
                )
                variants.append({
                    "option": size["option"],
                    "price_ttc": float(v_pricing.price_ttc),
                    "compare_at_price_ttc": float(v_pricing.compare_at_price_ttc),
                    "stock": size["stock"],
                })
            catalog.append({
                **product,
                "supplier_price": float(product["supplier_price"]),
                "pricing": pricing.to_dict(),
                "variants": variants,
            })
        return catalog
