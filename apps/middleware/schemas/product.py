"""
SOFA-CLOUD — Schémas Pydantic : Produit (sortie API)
"""

from pydantic import BaseModel, UUID4
from decimal import Decimal
from datetime import datetime


class VariantOut(BaseModel):
    id: UUID4
    shopify_variant_id: str | None
    option1: str
    option2: str | None
    sku: str
    price: Decimal
    compare_at_price: Decimal
    weight_kg: float
    inventory_qty: int

    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: UUID4
    shopify_product_id: str | None
    title: str
    handle: str
    body_html: str | None
    vendor: str
    product_type: str
    tags: list[str]
    # Enriched attributes (nullable for backward compat with older DB rows)
    material: str | None = None
    style: str | None = None
    color_family: str | None = None
    image_urls: list[str] = []
    # Pricing
    supplier_price: Decimal
    price_ht: Decimal
    price_ttc: Decimal
    compare_at_price: Decimal
    margin_pct: float
    is_active: bool
    created_at: datetime
    variants: list[VariantOut] = []

    model_config = {"from_attributes": True}


class ProductListOut(BaseModel):
    total: int
    limit: int
    offset: int
    source: str = "mock"
    products: list[ProductOut]


class SyncResultItem(BaseModel):
    """Résultat de sync pour un produit (dry_run ou saved)."""
    supplier_ref: str
    status: str                      # "computed" | "saved" | "error"
    product_id: str | None = None
    handle: str | None = None
    pricing: dict
    variants_count: int
    note: str | None = None
    error: str | None = None


class SyncResponse(BaseModel):
    dry_run: bool
    processed: int
    saved: int = 0
    errors: int = 0
    results: list[SyncResultItem]
