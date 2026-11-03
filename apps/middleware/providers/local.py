"""
SOFA-CLOUD — Local Catalog Provider
Source : DB (Product/Variant) ou fallback mock (dev/seed).
"""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.product import Product
from services.supplier import SupplierService


def _product_to_dict(p: Product) -> dict:
    """Sérialise un ORM Product en dict compatible avec la réponse API."""
    from schemas.product import ProductOut

    out = ProductOut.model_validate(p)
    d = out.model_dump()
    d["compare_at_price_ttc"] = float(d["compare_at_price"])
    d["price_ttc"] = float(d["price_ttc"])
    d["supplier_price"] = float(d["supplier_price"])
    d["price_ht"] = float(d["price_ht"])
    d["compare_at_price"] = float(d["compare_at_price"])
    urls = d.get("image_urls") or []
    d["imageUrl"] = urls[0] if urls else None
    d["images"] = urls
    return d


def _mock_product_to_api(p: dict) -> dict:
    """Enrichit un produit mock pour le frontend (imageUrl, badge)."""
    tags = p.get("tags") or []
    badge = None
    if "bestseller" in tags:
        badge = "bestseller"
    elif "nouveau" in tags:
        badge = "nouveau"
    elif "exclusif" in tags:
        badge = "exclusif"

    image_url = p.get("image_placeholder") or (
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"
    )

    return {
        "handle": p["handle"],
        "title": p["title"],
        "material": p["material"],
        "style": p["style"],
        "color_family": p.get("color_family"),
        "tags": tags,
        "supplier_price": p["supplier_price"],
        "price_ttc": p["pricing"]["price_ttc"],
        "compare_at_price_ttc": p["pricing"]["compare_at_price_ttc"],
        "margin_pct": p["pricing"]["margin_pct"],
        "variants": p["variants"],
        "imageUrl": image_url,
        "image_placeholder": image_url,
        "badge": badge,
    }


class LocalCatalogProvider:
    """
    Provider local : DB d'abord, puis mock si vide.
    Utilisé en dev, seed, ou quand CATALOG_PROVIDER=local.
    """

    async def list_products(
        self,
        limit: int = 10,
        offset: int = 0,
        q: str | None = None,
        *,
        session,
    ) -> tuple[int, list[dict], str]:
        total = await self._count_active_products(session)

        if total > 0:
            db_total, products = await self._fetch_products_from_db(
                session, limit=limit * 3, offset=0
            )
            rows = [_product_to_dict(p) for p in products]

            if q and q.strip():
                lower = q.strip().lower()
                rows = [
                    r
                    for r in rows
                    if lower in (r.get("title") or "").lower()
                    or lower in (r.get("material") or "").lower()
                    or lower in (r.get("style") or "").lower()
                ]

            total_filtered = len(rows)
            paginated = rows[offset : offset + limit]
            for r in paginated:
                r.setdefault("imageUrl", (r.get("image_urls") or [None])[0])
            return total_filtered, paginated, "database"

        # Fallback mock
        catalog = SupplierService.get_mock_catalog()
        if q and q.strip():
            lower = q.strip().lower()
            catalog = [
                p
                for p in catalog
                if lower in (p.get("title") or "").lower()
                or lower in (p.get("material") or "").lower()
                or lower in (p.get("style") or "").lower()
            ]

        paginated = catalog[offset : offset + limit]
        return len(catalog), [_mock_product_to_api(p) for p in paginated], "mock"

    async def get_product(self, handle: str, *, session) -> dict | None:

        result = await session.execute(
            select(Product)
            .where(Product.handle == handle, Product.is_active.is_(True))
            .options(selectinload(Product.variants))
        )
        product = result.scalar_one_or_none()

        if product is not None:
            d = _product_to_dict(product)
            d["source"] = "database"
            return d

        catalog = SupplierService.get_mock_catalog()
        mock_product = next((p for p in catalog if p["handle"] == handle), None)
        if mock_product:
            img = mock_product.get("image_placeholder") or (
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85"
            )
            return {
                **mock_product,
                "imageUrl": img,
                "images": [img],
                "source": "mock",
            }

        return None

    async def _count_active_products(self, session: AsyncSession) -> int:
        result = await session.execute(
            select(func.count()).select_from(Product).where(Product.is_active.is_(True))
        )
        return result.scalar_one()

    async def _fetch_products_from_db(
        self, session: AsyncSession, limit: int, offset: int
    ) -> tuple[int, list[Product]]:
        total = await self._count_active_products(session)
        result = await session.execute(
            select(Product)
            .where(Product.is_active.is_(True))
            .options(selectinload(Product.variants))
            .order_by(Product.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return total, list(result.scalars().all())
