"""
SOFA-CLOUD — Schémas Pydantic : Shopify Admin API
Mappe vers POST /admin/api/2025-01/products.json
"""

from pydantic import BaseModel
from decimal import Decimal


class ShopifyImageInput(BaseModel):
    src: str
    alt: str = ""


class ShopifyVariantInput(BaseModel):
    option1: str
    option2: str | None = None
    price: str                   # Shopify attend une string
    compare_at_price: str
    sku: str
    inventory_management: str = "shopify"
    inventory_quantity: int = 0
    weight: float = 0.0
    weight_unit: str = "kg"
    requires_shipping: bool = True
    taxable: bool = True

    @classmethod
    def from_decimals(
        cls,
        option1: str,
        price: Decimal,
        compare_at_price: Decimal,
        sku: str,
        inventory_qty: int = 0,
        weight_kg: float = 0.0,
        option2: str | None = None,
    ) -> "ShopifyVariantInput":
        return cls(
            option1=option1,
            option2=option2,
            price=f"{price:.2f}",
            compare_at_price=f"{compare_at_price:.2f}",
            sku=sku,
            inventory_quantity=inventory_qty,
            weight=weight_kg,
        )


class ShopifyOptionInput(BaseModel):
    name: str
    values: list[str]


class ShopifyProductInput(BaseModel):
    """
    Payload complet pour créer/mettre à jour un produit via Shopify Admin API.
    Wrappé dans {"product": ...} lors de l'envoi HTTP.
    """
    title: str
    body_html: str
    vendor: str = "Sofa-Cloud"
    product_type: str = "Canapé"
    tags: list[str] = []
    status: str = "active"
    variants: list[ShopifyVariantInput] = []
    options: list[ShopifyOptionInput] = []
    images: list[ShopifyImageInput] = []

    def to_shopify_payload(self) -> dict:
        """Construit le payload JSON final pour l'Admin API."""
        return {
            "product": {
                "title": self.title,
                "body_html": self.body_html,
                "vendor": self.vendor,
                "product_type": self.product_type,
                "tags": ", ".join(self.tags),
                "status": self.status,
                "variants": [v.model_dump(exclude_none=True) for v in self.variants],
                "options": [o.model_dump() for o in self.options],
                "images": [i.model_dump() for i in self.images],
            }
        }
