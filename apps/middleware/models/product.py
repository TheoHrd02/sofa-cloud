"""
SOFA-CLOUD — ORM Models
SQLAlchemy async models : Product, Variant, SupplierProduct.
"""

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import (
    String, Text, Numeric, Float, Integer,
    Boolean, DateTime, ForeignKey, JSON, UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base


class SupplierProduct(Base):
    """Données brutes reçues du fournisseur (avant transformation)."""

    __tablename__ = "supplier_products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    supplier_ref: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    supplier_name: Mapped[str] = mapped_column(String(200))
    raw_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    stock_qty: Mapped[int] = mapped_column(Integer, default=0)
    raw_data: Mapped[dict] = mapped_column(JSON, nullable=True)
    last_synced_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    product: Mapped["Product"] = relationship(back_populates="supplier_product", uselist=False)


class Product(Base):
    """Produit Sofa-Cloud après calcul de prix et enrichissement."""

    __tablename__ = "products"
    __table_args__ = (
        # One SupplierProduct → at most one Product (NULL allowed for manually created products)
        UniqueConstraint("supplier_product_id", name="uq_products_supplier_product_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    shopify_product_id: Mapped[str | None] = mapped_column(String(50), unique=True, nullable=True)
    supplier_product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("supplier_products.id"), nullable=True
    )

    # ── Informations produit ──────────────────────────────────────
    title: Mapped[str] = mapped_column(String(300))
    handle: Mapped[str] = mapped_column(String(300), unique=True, index=True)
    body_html: Mapped[str] = mapped_column(Text, nullable=True)
    vendor: Mapped[str] = mapped_column(String(100), default="Sofa-Cloud")
    product_type: Mapped[str] = mapped_column(String(100), default="Canapé")
    tags: Mapped[list] = mapped_column(JSON, default=list)

    # ── Attributs enrichis (fournis par le fournisseur) ───────────
    material: Mapped[str | None] = mapped_column(String(200), nullable=True)
    style: Mapped[str | None] = mapped_column(String(100), nullable=True)
    color_family: Mapped[str | None] = mapped_column(String(100), nullable=True)
    image_urls: Mapped[list] = mapped_column(JSON, default=list)

    # ── Pricing calculé ───────────────────────────────────────────
    supplier_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    price_ht: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    price_ttc: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    compare_at_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    margin_pct: Mapped[float] = mapped_column(Float)

    # ── Meta ──────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relations ─────────────────────────────────────────────────
    supplier_product: Mapped["SupplierProduct"] = relationship(back_populates="product")
    variants: Mapped[list["Variant"]] = relationship(
        back_populates="product", cascade="all, delete-orphan"
    )


class Variant(Base):
    """Variante produit (2/3/4 places, coloris...)."""

    __tablename__ = "variants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("products.id"))
    shopify_variant_id: Mapped[str | None] = mapped_column(String(50), nullable=True)

    option1: Mapped[str] = mapped_column(String(100))            # ex: "3 Places"
    option2: Mapped[str | None] = mapped_column(String(100), nullable=True)  # ex: "Velours Charbon"
    sku: Mapped[str] = mapped_column(String(100), unique=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    compare_at_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    weight_kg: Mapped[float] = mapped_column(Float, default=0.0)
    inventory_qty: Mapped[int] = mapped_column(Integer, default=0)

    product: Mapped["Product"] = relationship(back_populates="variants")
