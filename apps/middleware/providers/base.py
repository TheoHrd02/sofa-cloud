"""
SOFA-CLOUD — Catalog Provider Interface
Contrat unifié pour les sources de catalogue (local ou Shopify).
Le front ne sait pas quelle source est utilisée.
"""

from typing import Protocol


class CatalogProvider(Protocol):
    """
    Interface pour les providers de catalogue.
    Retourne toujours des dicts au format API unifié (handle, title, price_ttc, variants, etc.).
    """

    async def list_products(
        self,
        limit: int = 10,
        offset: int = 0,
        q: str | None = None,
        **kwargs,
    ) -> tuple[int, list[dict], str]:
        """
        Liste les produits paginés.
        Returns: (total, products[], source_label)
        kwargs: session (LocalCatalogProvider), etc.
        """
        ...

    async def get_product(self, handle: str, **kwargs) -> dict | None:
        """
        Récupère un produit par handle.
        Returns: product dict ou None si introuvable.
        kwargs: session (LocalCatalogProvider), etc.
        """
        ...
