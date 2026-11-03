"""
SOFA-CLOUD — Shopify Catalog Provider
Source : Shopify Storefront API (read-only).
Shopify = source of truth pour catalogue + stock.
"""

import httpx
from core.config import get_settings

# GraphQL : liste produits (10 premiers)
PRODUCTS_QUERY = """
query getProducts($first: Int!, $query: String) {
  products(first: $first, query: $query) {
    edges {
      cursor
      node {
        id
        title
        handle
        productType
        tags
        priceRange {
          minVariantPrice { amount }
        }
        compareAtPriceRange {
          minVariantPrice { amount }
        }
        featuredImage { url }
        images(first: 5) {
          edges { node { url } }
        }
        variants(first: 20) {
          edges {
            node {
              id
              title
              price { amount }
              compareAtPrice { amount }
              availableForSale
              quantityAvailable
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
"""

# GraphQL : produit par handle (product query avec handle, productByHandle déprécié)
PRODUCT_BY_HANDLE_QUERY = """
query getProductByHandle($handle: String!) {
  product(handle: $handle) {
    id
    title
    handle
    productType
    tags
    descriptionHtml
    priceRange {
      minVariantPrice { amount }
    }
    compareAtPriceRange {
      minVariantPrice { amount }
    }
    featuredImage { url }
    images(first: 10) {
      edges { node { url } }
    }
    variants(first: 20) {
      edges {
        node {
          id
          title
          price { amount }
          compareAtPrice { amount }
          availableForSale
          quantityAvailable
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }
}
"""


def _shopify_node_to_api(node: dict) -> dict:
    """Mappe un nœud GraphQL Shopify vers le format API unifié."""
    tags = node.get("tags") or []
    badge = None
    if "bestseller" in tags:
        badge = "bestseller"
    elif "nouveau" in tags:
        badge = "nouveau"
    elif "exclusif" in tags:
        badge = "exclusif"

    price_range = node.get("priceRange") or {}
    min_price = price_range.get("minVariantPrice") or {}
    price_ttc = float(min_price.get("amount", 0))

    compare_range = node.get("compareAtPriceRange") or {}
    min_compare = compare_range.get("minVariantPrice") or {}
    compare_at_price_ttc = float(min_compare.get("amount", 0)) or price_ttc

    img_edges = (node.get("images") or {}).get("edges") or []
    images = [e.get("node", {}).get("url") for e in img_edges if e.get("node", {}).get("url")]
    featured = node.get("featuredImage") or {}
    image_url = featured.get("url") or (images[0] if images else None)

    variant_edges = (node.get("variants") or {}).get("edges") or []
    variants = []
    for ve in variant_edges:
        vn = ve.get("node") or {}
        opts = vn.get("selectedOptions") or []
        option = opts[0].get("value", vn.get("title", "")) if opts else vn.get("title", "")
        price = float((vn.get("price") or {}).get("amount", 0))
        compare = (vn.get("compareAtPrice") or {})
        compare_val = float(compare.get("amount", 0)) if compare else price
        variants.append({
            "option": option,
            "price_ttc": price,
            "compare_at_price_ttc": compare_val,
            "stock": vn.get("quantityAvailable") or (1 if vn.get("availableForSale") else 0),
        })

    # supplier_price : non dispo sur Storefront, on approxime (price_ht ≈ price_ttc/1.2)
    supplier_price = round(price_ttc / 1.20, 2) if price_ttc else 0

    return {
        "handle": node.get("handle", ""),
        "title": node.get("title", ""),
        "material": None,
        "style": node.get("productType"),
        "color_family": None,
        "tags": tags,
        "supplier_price": supplier_price,
        "price_ttc": price_ttc,
        "compare_at_price_ttc": compare_at_price_ttc,
        "margin_pct": 0,
        "variants": variants,
        "imageUrl": image_url,
        "images": images or ([image_url] if image_url else []),
        "badge": badge,
        "shopify_product_id": node.get("id", "").replace("gid://shopify/Product/", ""),
    }


class ShopifyCatalogProvider:
    """
    Provider Shopify : lit via Storefront API.
    Utilisé quand CATALOG_PROVIDER=shopify et que Shopify est configuré.
    """

    def __init__(self):
        self._settings = get_settings()

    def _graphql_url(self) -> str:
        domain = self._settings.shopify_store_domain.strip().rstrip("/")
        if not domain:
            raise ValueError("SHOPIFY_STORE_DOMAIN non configuré")
        if domain.startswith("http"):
            base = domain
        else:
            base = f"https://{domain}"
        return f"{base}/api/{self._settings.shopify_api_version}/graphql.json"

    def _headers(self) -> dict:
        token = self._settings.shopify_storefront_api_token
        if not token:
            raise ValueError("SHOPIFY_STOREFRONT_API_TOKEN non configuré")
        return {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": token,
        }

    async def list_products(
        self,
        limit: int = 10,
        offset: int = 0,
        q: str | None = None,
        **kwargs,
    ) -> tuple[int, list[dict], str]:
        try:
            url = self._graphql_url()
            headers = self._headers()
        except ValueError:
            return 0, [], "shopify_unconfigured"

        query_filter = f'title:*{q}*' if q and q.strip() else None

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={
                    "query": PRODUCTS_QUERY,
                    "variables": {
                        "first": min(limit + offset, 50),
                        "query": query_filter,
                    },
                },
            )
            resp.raise_for_status()
            data = resp.json()

        if data.get("errors"):
            return 0, [], "shopify_error"

        products_data = data.get("data", {}).get("products", {})
        edges = products_data.get("edges") or []
        nodes = [e.get("node") for e in edges if e.get("node")]

        rows = [_shopify_node_to_api(n) for n in nodes]

        if q and q.strip():
            lower = q.strip().lower()
            rows = [
                r
                for r in rows
                if lower in (r.get("title") or "").lower()
                or lower in (r.get("style") or "").lower()
            ]

        total = len(rows)
        paginated = rows[offset : offset + limit]

        return total, paginated, "shopify"

    async def get_product(self, handle: str, **kwargs) -> dict | None:
        try:
            url = self._graphql_url()
            headers = self._headers()
        except ValueError:
            return None

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                url,
                headers=headers,
                json={
                    "query": PRODUCT_BY_HANDLE_QUERY,
                    "variables": {"handle": handle},
                },
            )
            resp.raise_for_status()
            data = resp.json()

        if data.get("errors"):
            return None

        node = (data.get("data") or {}).get("product")
        if not node:
            return None

        out = _shopify_node_to_api(node)
        out["source"] = "shopify"
        out["body_html"] = node.get("descriptionHtml", "")
        return out
