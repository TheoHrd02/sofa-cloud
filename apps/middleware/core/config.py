"""
SOFA-CLOUD — Core Configuration
Pydantic Settings : lit les variables depuis .env automatiquement.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache


class Settings(BaseSettings):
    # ── Environnement ─────────────────────────────────────────────
    python_env: str = Field(default="development", alias="PYTHON_ENV")

    # ── Shopify ───────────────────────────────────────────────────
    shopify_store_domain: str = Field(default="", alias="SHOPIFY_STORE_DOMAIN")
    shopify_storefront_api_token: str = Field(default="", alias="SHOPIFY_STOREFRONT_API_TOKEN")
    shopify_admin_api_token: str = Field(default="", alias="SHOPIFY_ADMIN_API_TOKEN")
    shopify_api_version: str = Field(default="2025-01", alias="SHOPIFY_API_VERSION")

    # ── Database ──────────────────────────────────────────────────
    # Sans DATABASE_URL : SQLite local, aucune infrastructure requise.
    # docker-compose passe l'URL PostgreSQL explicitement.
    database_url: str = Field(
        default="sqlite+aiosqlite:///./sofa_cloud.db",
        alias="DATABASE_URL",
    )

    # ── Cloudinary ────────────────────────────────────────────────
    cloudinary_cloud_name: str = Field(default="", alias="CLOUDINARY_CLOUD_NAME")
    cloudinary_api_key: str = Field(default="", alias="CLOUDINARY_API_KEY")
    cloudinary_api_secret: str = Field(default="", alias="CLOUDINARY_API_SECRET")

    # ── Security ──────────────────────────────────────────────────
    secret_key: str = Field(default="dev-secret-key-change-in-prod", alias="SECRET_KEY")
    internal_api_key: str = Field(default="", alias="INTERNAL_API_KEY")
    cors_origins: str = Field(default="http://localhost:3001", alias="CORS_ORIGINS")

    # ── Catalog Provider ──────────────────────────────────────────
    catalog_provider: str = Field(
        default="local",
        alias="CATALOG_PROVIDER",
        description="Source catalogue : local (DB/mock) ou shopify (Storefront API)",
    )

    # ── Fournisseurs ──────────────────────────────────────────────
    supplier_api_key: str = Field(default="", alias="SUPPLIER_API_KEY")
    supplier_api_url: str = Field(default="", alias="SUPPLIER_API_URL")
    supplier_sync_interval_hours: int = Field(default=6, alias="SUPPLIER_SYNC_INTERVAL_HOURS")

    # ── Pricing Defaults ──────────────────────────────────────────
    # Surchargeable par theme.config.json pour multi-tenant
    pricing_multiplier: float = 2.5
    pricing_fees: float = 150.0
    pricing_vat_rate: float = 0.20
    pricing_compare_at_multiplier: float = 3.2

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def shopify_admin_base_url(self) -> str:
        return f"https://{self.shopify_store_domain}/admin/api/{self.shopify_api_version}"

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    """Singleton — Settings chargé une seule fois, mis en cache."""
    return Settings()
