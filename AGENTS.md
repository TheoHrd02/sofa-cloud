# AGENTS.md

## Sofa-Cloud

Boutique de canapés en architecture headless : un frontend Remix (`apps/frontend`) qui ne parle qu'au
middleware FastAPI (`apps/middleware`), lequel sert le catalogue depuis un fournisseur local (mock + base)
ou depuis Shopify (`CATALOG_PROVIDER=local|shopify`). L'état technique et le plan de remédiation sont dans
`AUDIT.md` (février 2026) : une partie a été réalisée depuis, vérifier le code avant de s'y fier.

## Lancer et vérifier, sans infrastructure

- Sans `DATABASE_URL`, le middleware utilise SQLite. Ni PostgreSQL ni Docker ne sont nécessaires.
- `./check.sh` à la racine : pytest du middleware (SQLite), puis typecheck, tests Vitest et build du frontend.
  C'est la définition de « vert ».
- Middleware : `cd apps/middleware && pip install -r requirements.txt && python -m pytest -q`.
  Les tests fixent eux-mêmes une base SQLite jetable (`tests/conftest.py`).
- Frontend : `cd apps/frontend && npm ci && npm run typecheck && npm test`.
- Application : `uvicorn main:app --port 8000` dans `apps/middleware`, puis `npm run dev` dans `apps/frontend`.

## Conventions

- Le prix public se calcule dans `apps/middleware/services/pricing.py` (`PricingEngine`). Montants en
  `Decimal` côté Python, arrondis au centime avec `ROUND_HALF_UP`.
- Tout ce qui sort d'un fournisseur de catalogue passe par `apps/middleware/providers/` (interface
  `CatalogProvider`). Aucun appel réseau vers Shopify hors de `providers/shopify.py`.
- Les tests n'appellent jamais un service externe réel : réponses simulées (`httpx.MockTransport`, fixtures).
- Aucun secret dans le code ni dans les tests. Les valeurs de `.env.example` sont des exemples.
