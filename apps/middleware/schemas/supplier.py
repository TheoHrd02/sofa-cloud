"""
SOFA-CLOUD — Schémas Pydantic : Fournisseur (entrée)
Valide les données brutes reçues des fournisseurs avant traitement.
"""

from pydantic import BaseModel, Field, field_validator
from decimal import Decimal


class SupplierVariantIn(BaseModel):
    """Variante telle que reçue du fournisseur."""
    option_name: str = Field(..., examples=["3 Places"])
    option_value: str | None = None
    supplier_sku: str
    raw_price_delta: Decimal = Field(default=Decimal("0"), description="Surcoût vs prix de base")
    stock_qty: int = Field(default=0, ge=0)
    weight_kg: float = Field(default=0.0, ge=0)


class SupplierProductIn(BaseModel):
    """
    Données brutes d'un produit fournisseur.
    Sera transformé et enrichi par SupplierService avant stockage.
    """
    supplier_ref: str = Field(..., description="Référence unique fournisseur")
    supplier_name: str
    raw_price: Decimal = Field(..., gt=0, description="Prix HT fournisseur en euros")
    description: str | None = None
    material: str | None = None
    color_family: str | None = None
    style: str | None = None
    variants: list[SupplierVariantIn] = []
    image_urls: list[str] = []
    extra_data: dict = Field(default_factory=dict)

    @field_validator("raw_price")
    @classmethod
    def price_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Le prix fournisseur doit être positif.")
        return v


class SupplierSyncRequest(BaseModel):
    """Payload d'un appel de synchronisation manuelle."""
    products: list[SupplierProductIn]
    dry_run: bool = Field(default=False, description="Si True, calcule les prix sans sauvegarder.")
