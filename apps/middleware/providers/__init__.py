"""
SOFA-CLOUD — Catalog Providers
Abstraction pour sources de catalogue : local (DB/mock) ou Shopify (Storefront API).
"""

from providers.base import CatalogProvider
from providers.local import LocalCatalogProvider
from providers.shopify import ShopifyCatalogProvider

__all__ = [
    "CatalogProvider",
    "LocalCatalogProvider",
    "ShopifyCatalogProvider",
]
