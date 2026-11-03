"""
SOFA-CLOUD — Catalog Provider Factory
Retourne le provider selon CATALOG_PROVIDER.
"""

from core.config import get_settings
from providers.local import LocalCatalogProvider
from providers.shopify import ShopifyCatalogProvider


def get_catalog_provider():
    """
    Retourne le provider de catalogue selon CATALOG_PROVIDER.
    - local : DB + mock fallback
    - shopify : Storefront API
    """
    settings = get_settings()
    provider_name = (settings.catalog_provider or "local").strip().lower()

    if provider_name == "shopify":
        return ShopifyCatalogProvider()
    return LocalCatalogProvider()
