"""
SOFA-CLOUD — API v1 Router
Agrège tous les sous-routeurs v1.
"""

from fastapi import APIRouter
from api.v1 import products, sync, delivery, shopify

router = APIRouter()

router.include_router(products.router, prefix="/products", tags=["Products"])
router.include_router(shopify.router, prefix="/shopify", tags=["Shopify (read-only)"])
router.include_router(sync.router, prefix="/sync", tags=["Sync & Fournisseurs"])
router.include_router(delivery.router, prefix="/delivery", tags=["Livraison"])
