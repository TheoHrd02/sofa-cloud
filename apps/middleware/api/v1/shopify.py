"""
SOFA-CLOUD — Route Shopify (read-only)
GET /api/v1/shopify/products → liste 10 produits depuis Storefront API.
Preuve de concept : même si checkout pas branché, on peut lire le catalogue.
"""

from fastapi import APIRouter, HTTPException
from providers.shopify import ShopifyCatalogProvider

router = APIRouter()


@router.get("/products", summary="Liste 10 produits Shopify (read-only)")
async def list_shopify_products():
    """
    Lit les 10 premiers produits depuis la Storefront API Shopify.
    Utilisé pour valider la connexion Shopify (même sans checkout).
    """
    provider = ShopifyCatalogProvider()
    total, products, source = await provider.list_products(limit=10, offset=0)

    if source == "shopify_unconfigured":
        raise HTTPException(
            status_code=503,
            detail="Shopify non configuré : SHOPIFY_STORE_DOMAIN et SHOPIFY_STOREFRONT_API_TOKEN requis",
        )
    if source == "shopify_error":
        raise HTTPException(
            status_code=502,
            detail="Erreur lors de l'appel à la Storefront API Shopify",
        )

    return {
        "total": total,
        "limit": 10,
        "offset": 0,
        "source": source,
        "products": products,
    }
