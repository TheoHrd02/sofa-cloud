"""
SOFA-CLOUD — Middleware Entry Point (v2)
FastAPI app mise à jour avec routeurs v1.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from core.config import get_settings
from core.database import engine, Base
from api.v1.router import router as api_v1_router

settings = get_settings()


# ─── App Lifespan ────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Sofa-Cloud Middleware starting up...")
    print(f"   ENV       : {settings.python_env}")
    print(f"   Catalog   : {settings.catalog_provider or 'local'}")
    print(f"   Shopify   : {settings.shopify_store_domain or '⚠ non configuré'}")
    print(f"   Database  : {'✓ configuré' if 'sofa' in settings.database_url else '⚠ défaut'}")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("   Tables    : ✓ create_all terminé (idempotent)")

    yield
    print("🛑 Sofa-Cloud Middleware shutting down...")


# ─── FastAPI Instance ─────────────────────────────────────────────────────────
app = FastAPI(
    title="Sofa-Cloud Middleware API",
    description="""
**Système Nerveux** de la plateforme Sofa-Cloud.

Orchestration entre :
- 🛍️ **Shopify Admin** (produits, stocks, commandes)
- 🏭 **Fournisseurs** (synchro automatique stocks/prix)
- ⚛️ **Frontend Hydrogen** (données enrichies)

### Endpoints clés
- `GET /api/v1/products/` — Catalogue produits (CATALOG_PROVIDER=local|shopify)
- `GET /api/v1/shopify/products` — Liste 10 produits Shopify (read-only)
- `GET /api/v1/products/pricing-simulator` — Simulateur de prix
- `GET /api/v1/sync/mock-pricing` — Preview pricing 10 canapés
- `POST /api/v1/sync/supplier` — Sync fournisseur (dry-run ou save)
    """,
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(api_v1_router, prefix="/api/v1")


# ─── System Endpoints ─────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "ok",
        "service": "sofa-cloud-middleware",
        "version": "2.0.0",
        "environment": settings.python_env,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": "Sofa-Cloud Middleware API v2",
        "docs": "/docs",
        "endpoints": {
            "products": "/api/v1/products/",
            "pricing_simulator": "/api/v1/products/pricing-simulator",
            "mock_pricing": "/api/v1/sync/mock-pricing",
            "sync": "/api/v1/sync/supplier",
        },
    }
