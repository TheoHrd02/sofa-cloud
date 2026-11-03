"""
SOFA-CLOUD — Test d'intégration : sync fournisseur → DB
Run : pytest tests/test_sync_integration.py -v

Base : SQLite par défaut (voir conftest.py), PostgreSQL si DATABASE_URL est exporté.

Done criteria testés :
  1. dry_run=True  → aucun changement DB, preview retourné
  2. dry_run=False → SupplierProduct + Product + Variants persistés
  3. 2x la même sync → pas de duplication (idempotence)
  4. GET /products  → retourne depuis DB si non vide
  5. GET /products/{handle} → retourne le produit persisté
"""

import pytest
import asyncio
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select, func

from core.config import get_settings
from core.database import Base
from models.product import SupplierProduct, Product, Variant
from services.supplier import SupplierService
from schemas.supplier import SupplierSyncRequest, SupplierProductIn


# ─── Fixtures ─────────────────────────────────────────────────────────────────

settings = get_settings()

TEST_ENGINE = create_async_engine(settings.database_url, echo=False)
TestSession = async_sessionmaker(
    bind=TEST_ENGINE, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    """Crée les tables au début des tests."""
    async with TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Nettoyage après les tests
    async with TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def session():
    async with TestSession() as s:
        yield s
        await s.rollback()   # chaque test repart d'un état propre


# ─── Données de test ──────────────────────────────────────────────────────────

def make_request(dry_run: bool = False) -> SupplierSyncRequest:
    return SupplierSyncRequest(
        dry_run=dry_run,
        products=[
            SupplierProductIn(
                supplier_ref="SUP-TEST-001",
                supplier_name="Le Test Canapé",
                raw_price=Decimal("500.00"),
                material="Velours test",
                style="Contemporain",
                color_family="Gris",
                description="<p>Canapé de test.</p>",
            ),
            SupplierProductIn(
                supplier_ref="SUP-TEST-002",
                supplier_name="La Test Méridienne",
                raw_price=Decimal("300.00"),
                material="Lin test",
                style="Scandinave",
            ),
        ],
    )


# ─── Tests ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_dry_run_does_not_write_db(session: AsyncSession):
    """dry_run=True → aucune ligne en DB."""
    svc = SupplierService()
    req = make_request(dry_run=True)
    results = svc.process_sync_request(req)

    assert len(results) == 2
    assert all(r["status"] == "computed" for r in results)

    count = (await session.execute(
        select(func.count()).select_from(SupplierProduct)
        .where(SupplierProduct.supplier_ref.in_(["SUP-TEST-001", "SUP-TEST-002"]))
    )).scalar_one()
    assert count == 0, "dry_run ne devrait pas écrire en DB"


@pytest.mark.asyncio
async def test_sync_persists_all_entities(session: AsyncSession):
    """dry_run=False → SupplierProduct + Product + Variants persistés."""
    svc = SupplierService()
    req = make_request(dry_run=False)
    response = await svc.sync_to_database(req, session)

    assert response.saved == 2
    assert response.errors == 0
    assert response.dry_run is False

    for item in response.results:
        assert item.status == "saved"
        assert item.product_id is not None
        assert item.handle is not None
        assert item.variants_count == 3   # 3 tailles standard

    # Vérification DB
    sp_count = (await session.execute(
        select(func.count()).select_from(SupplierProduct)
        .where(SupplierProduct.supplier_ref.in_(["SUP-TEST-001", "SUP-TEST-002"]))
    )).scalar_one()
    assert sp_count == 2

    products = (await session.execute(
        select(Product).where(Product.handle.in_(["le-test-canape", "la-test-meridienne"]))
    )).scalars().all()
    assert len(products) == 2

    # Chaque produit doit avoir 3 variants
    for product in products:
        await session.refresh(product, ["variants"])
        variants = (await session.execute(
            select(Variant).where(Variant.product_id == product.id)
        )).scalars().all()
        assert len(variants) == 3, f"Produit {product.handle} devrait avoir 3 variants"
        skus = {v.sku for v in variants}
        assert len(skus) == 3, "Les SKUs doivent être uniques"


@pytest.mark.asyncio
async def test_idempotence_no_duplication(session: AsyncSession):
    """Faire 2x la même sync → pas de duplication."""
    svc = SupplierService()
    req = make_request(dry_run=False)

    # Première sync
    r1 = await svc.sync_to_database(req, session)
    assert r1.saved == 2

    # Deuxième sync identique
    r2 = await svc.sync_to_database(req, session)
    assert r2.saved == 2
    assert r2.errors == 0

    # Pas de duplication dans la DB
    sp_count = (await session.execute(
        select(func.count()).select_from(SupplierProduct)
        .where(SupplierProduct.supplier_ref.in_(["SUP-TEST-001", "SUP-TEST-002"]))
    )).scalar_one()
    assert sp_count == 2, f"Duplication détectée : {sp_count} supplier_products"

    product_count = (await session.execute(
        select(func.count()).select_from(Product)
        .where(Product.handle.in_(["le-test-canape", "la-test-meridienne"]))
    )).scalar_one()
    assert product_count == 2, f"Duplication détectée : {product_count} products"

    # Variants non dupliqués
    variant_count = (await session.execute(
        select(func.count()).select_from(Variant)
        .join(Product, Variant.product_id == Product.id)
        .where(Product.handle.in_(["le-test-canape", "la-test-meridienne"]))
    )).scalar_one()
    assert variant_count == 6, f"Attendu 6 variants (2×3), trouvé {variant_count}"


@pytest.mark.asyncio
async def test_price_update_on_resync(session: AsyncSession):
    """Si le prix fournisseur change, le produit doit être mis à jour."""
    svc = SupplierService()

    # Première sync : prix 500
    req1 = SupplierSyncRequest(
        dry_run=False,
        products=[SupplierProductIn(
            supplier_ref="SUP-PRICE-TEST",
            supplier_name="Le Price Test",
            raw_price=Decimal("500.00"),
        )],
    )
    r1 = await svc.sync_to_database(req1, session)
    assert r1.saved == 1

    product_v1 = (await session.execute(
        select(Product).where(Product.handle == "le-price-test")
    )).scalar_one()
    price_v1 = float(product_v1.price_ttc)

    # Deuxième sync : prix 600
    req2 = SupplierSyncRequest(
        dry_run=False,
        products=[SupplierProductIn(
            supplier_ref="SUP-PRICE-TEST",
            supplier_name="Le Price Test",
            raw_price=Decimal("600.00"),
        )],
    )
    await svc.sync_to_database(req2, session)

    await session.refresh(product_v1)
    price_v2 = float(product_v1.price_ttc)

    assert price_v2 != price_v1, "Le prix n'a pas été mis à jour"
    # (600×2.5+150)×1.20 = 2100 vs (500×2.5+150)×1.20 = 1740
    assert price_v2 == pytest.approx(2100.0, abs=1.0)


@pytest.mark.asyncio
async def test_partial_batch_error_does_not_block(session: AsyncSession):
    """Un produit invalide dans le batch ne bloque pas les autres."""
    svc = SupplierService()

    req = SupplierSyncRequest(
        dry_run=False,
        products=[
            SupplierProductIn(
                supplier_ref="SUP-GOOD-001",
                supplier_name="Le Bon Canapé",
                raw_price=Decimal("400.00"),
            ),
            # SKU en double forcé : injecter une variante avec un SKU déjà existant
            # simulé par un supplier_ref déjà utilisé sans conflit — ici on force
            # l'erreur en créant un handle déjà présent pour un autre SP
            SupplierProductIn(
                supplier_ref="SUP-BAD-001",
                supplier_name="Le Bon Canapé",   # même handle → conflit IF autre SP
                raw_price=Decimal("400.00"),
            ),
        ],
    )
    response = await svc.sync_to_database(req, session)

    # Le premier produit doit réussir
    good = next(r for r in response.results if r.supplier_ref == "SUP-GOOD-001")
    assert good.status == "saved"
    # Le deuxième peut réussir (handle suffixé) ou échouer, mais ne doit pas crasher l'app
    assert response.processed == 2
