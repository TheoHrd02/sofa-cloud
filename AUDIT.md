# Sofa-Cloud — Audit Technique & Plan de Remédiation
> Tech Lead Audit · Feb 2026 · Stack : Remix/Vite + FastAPI + PostgreSQL + Docker

---

## 1. Audit Snapshot

| Dimension | État | Score |
|-----------|------|-------|
| Build / Runtime | ⚠ Partiellement opérationnel (formules prix cassées) | 4/10 |
| Sécurité baseline | 🔴 Critique (API publique sans auth, secret key faible) | 3/10 |
| Qualité code | 🟡 Fragile (logique métier dupliquée, 0 tests) | 5/10 |
| Domain e-commerce | 🟡 Partiel (panier OK, checkout absent, stock mock global) | 5/10 |
| Performance | 🟡 Acceptable pour le MVP (pas de srcset, bundle OK) | 6/10 |
| Observabilité | 🔴 Absente (0 logging structuré, 0 tracing, 0 Sentry) | 2/10 |
| Préparation Shopify | 🟢 Bonne base (schemas Shopify existent, adapters prévus) | 7/10 |

**Résumé exécutif :** La codebase est bien architecturée conceptuellement (séparation frontend/middleware, schemas Shopify prévus, moteur de pricing). Mais elle contient **2 bugs P0 bloquants** (formule de prix incorrecte dans 2 routes) qui afficheraient des prix à 100× la réalité en production, une **API totalement non authentifiée**, et **zéro tests**. Les données de catalogue sont **dupliquées 4-5 fois** à travers les fichiers, ce qui crée des dérives silencieuses.

---

## 2. Cartographie Repo

```
FurnituresMarketplace/
├── .env                        ← ⚠ Identique au .env.example (secrets placeholder)
├── .env.example
├── .gitignore                  ← .env ignoré ✓
├── docker-compose.yml          ← 3 services: frontend | middleware | db
├── README.md
├── shared/
│   └── config/theme.config.json ← Config thème (utilisé nulle part dans le code actuel)
└── apps/
    ├── frontend/               ← Remix + Vite + Tailwind, Node 20
    │   ├── Dockerfile           (dev + prod multi-stage)
    │   ├── package.json         Remix 2.9, React 18, TypeScript 5.4
    │   └── app/
    │       ├── root.tsx         Layout racine, CartProvider, Google Fonts
    │       ├── routes/
    │       │   ├── _index.tsx              Homepage avec FEATURED_PRODUCTS hardcodés
    │       │   ├── products._index.tsx     PLP — filtres URL-synced, calcPrice() BUGUÉ
    │       │   ├── products.$handle.tsx    PDP — loader SSR, prix related BUGUÉS
    │       │   ├── about / cgu / mentions-legales / confidentialite / cookies
    │       ├── components/
    │       │   ├── Header.tsx              MegaMenu + Search + Cart icon
    │       │   ├── SideCart.tsx            Drawer panier — CTA checkout MORT (no onClick)
    │       │   ├── ProductCard.tsx
    │       │   ├── pdp/                    MediaGallery | ProductInfo | VariantSelector
    │       │   │                           CrossSell | Reassurance
    │       │   └── plp/                    ProductFilters | QuickView
    │       ├── context/
    │       │   └── CartContext.tsx         Reducer + localStorage persist — addItem stale closure
    │       ├── hooks/
    │       │   ├── useVariant.ts           Moteur de prix côté client (dupliqué vs Python)
    │       │   ├── useSearch.ts            Catalogue local hardcodé — prix manuels incorrects
    │       │   ├── useInView.ts
    │       │   └── useMounted.ts
    │       └── lib/
    │           ├── utils.ts                cn (clsx sans tailwind-merge), formatPrice, slugify
    │           └── theme.ts
    └── middleware/             ← FastAPI, Python 3.11, SQLAlchemy async
        ├── Dockerfile
        ├── requirements.txt    FastAPI 0.111, SQLAlchemy 2.0, pydantic 2.7, httpx, apscheduler
        ├── main.py             App entry, CORS, lifespan (⚠ pas de create_all)
        ├── core/
        │   ├── config.py       Pydantic Settings — SECRET_KEY faible par défaut
        │   └── database.py     Engine async — get_db() type hint incorrect, commit auto
        ├── models/
        │   └── product.py      Product | Variant | SupplierProduct — datetime.utcnow() déprécié
        ├── schemas/
        │   ├── product.py      ProductOut / VariantOut / ProductListOut
        │   ├── shopify.py      ShopifyProductInput — bonne abstraction
        │   └── supplier.py     SupplierProductIn — validation pydantic ✓
        ├── services/
        │   ├── pricing.py      ⭐ PricingEngine (source de vérité) — Decimal correct
        │   └── supplier.py     SupplierService — process_sync_request ne persiste PAS en DB
        ├── data/
        │   └── mock_products.py  10 canapés mock — VARIANT_SIZES global (même stock pour tous)
        └── api/v1/
            ├── router.py
            ├── products.py     List + detail + pricing-simulator (mock seulement)
            ├── sync.py         POST /sync/supplier — AUCUNE AUTH, dry_run jamais sauvé
            └── delivery.py     zip_code reçu mais ignoré dans la logique
```

---

## 3. Findings (par catégorie)

### 🔴 A — Bugs P0 : Prix incorrects (BLOQUANT PROD)

#### BUG-01 — `products._index.tsx` : facteur `120` au lieu de `1.20`

**Fichier :** `apps/frontend/app/routes/products._index.tsx`, ligne 33

```typescript
// BUGUÉ — affiche des prix × 100
function calcPrice(supplierPrice: number, sizeMult = 1.0) {
    return Math.round(supplierPrice * sizeMult * 2.5 * 120 + 150 * 1.2);
    //                                               ^^^  devrait être 1.20
}
```

**Impact :** "Le Montaigne" (620€ fournisseur) afficherait **186 180 € TTC** au lieu de 2 040 €.
La homepage et la barre de recherche cachent ce bug en ayant des prix hardcodés corrects. Le bug n'est visible que sur la page PLP (`/products`) avec les filtres actifs.

**Correction :**
```typescript
function calcPrice(supplierPrice: number, sizeMult = 1.0) {
    return Math.round((supplierPrice * sizeMult * 2.5 + 150) * 1.20);
}
```

---

#### BUG-02 — `products.$handle.tsx` : formule `* 1.2 * 120` dans les related products

**Fichier :** `apps/frontend/app/routes/products.$handle.tsx`, lignes 230-232

```typescript
// BUGUÉ — produits similaires (CrossSell) afficheraient ~360× le prix réel
price_ttc: Math.round(p.supplier_price * 2.5 * 1.2 * 120 + 150 * 1.2),
compare_at_price_ttc: Math.round(p.supplier_price * 3.2 * 1.2 * 120 + 150 * 1.2),
```

Pour "Le Montaigne" : `620 * 2.5 * 1.2 * 120 + 150 * 1.2 = 223 380 €`

**Correction :**
```typescript
price_ttc: Math.round((p.supplier_price * 2.5 + 150) * 1.20),
compare_at_price_ttc: Math.round((p.supplier_price * 3.2 + 150) * 1.20),
```

---

#### BUG-03 — `SideCart.tsx` : bouton "Procéder au paiement" mort

**Fichier :** `apps/frontend/app/components/SideCart.tsx`, ligne 150

```tsx
<button className="btn-primary w-full justify-center text-base py-4">
    Procéder au paiement →
    {/* ⚠ AUCUN onClick / href / disabled */}
</button>
```

Un utilisateur qui clique sur ce bouton n'a aucun retour. Doit être désactivé visuellement ou redirigé.

---

#### BUG-04 — Base de données jamais initialisée

**Fichier :** `apps/middleware/main.py` — lifespan function

Les modèles SQLAlchemy (`Product`, `Variant`, `SupplierProduct`) sont définis mais `Base.metadata.create_all()` n'est jamais appelé. Il n'existe ni fichier `alembic.ini` ni dossier `migrations/` bien qu'Alembic soit dans `requirements.txt`. Au démarrage du middleware, toute requête DB lèvera une erreur `relation "products" does not exist`.

---

### 🔴 B — Sécurité

#### SEC-01 — API middleware totalement publique (CRITIQUE)

Aucun endpoint n'a d'authentification. Le plus dangereux est :

```
POST /api/v1/sync/supplier   ← peut écrire en DB (dry_run=false)
GET  /api/v1/products/pricing-simulator ← expose la politique de prix interne
```

N'importe qui connaissant l'URL peut déclencher une sync fournisseur ou découvrir les marges.

**Solution P0 :** Ajouter une API key simple en attendant JWT complet.

---

#### SEC-02 — `SECRET_KEY` faible par défaut

**Fichier :** `apps/middleware/core/config.py`, ligne 33

```python
secret_key: str = Field(default="dev-secret-key-change-in-prod", alias="SECRET_KEY")
```

Si `SECRET_KEY` n'est pas défini dans l'env, cette valeur connue sera utilisée pour signer les JWT.

---

#### SEC-03 — CORS trop permissif

**Fichier :** `apps/middleware/main.py`, lignes 50-56

```python
allow_methods=["*"],
allow_headers=["*"],
```

En production, seuls `GET`, `POST` et les headers nécessaires devraient être autorisés.

---

#### SEC-04 — Prix calculés côté client (architecture vulnérable future)

`useVariant.ts` et `calcPrice()` dans les routes calculent les prix côté client depuis `supplier_price`. En production, le prix mis dans le panier (`price_ttc` dans CartContext) doit toujours être **validé côté serveur** au moment du checkout. Si Shopify calcule les prix différemment, l'utilisateur pourrait forcer un prix bas via les DevTools.

---

#### SEC-05 — `SHOPIFY_ADMIN_API_TOKEN` dans l'env Docker

**Fichier :** `docker-compose.yml`, ligne 45

Le token Admin Shopify (accès total aux commandes, remboursements) est passé en variable d'environnement claire dans Docker. En production il faut utiliser Docker Secrets ou Vault.

---

### 🟡 C — Dette Technique

#### DEBT-01 — Logique de pricing dupliquée 4 fois

| Fichier | Formule | Résultat pour 620€ |
|---------|---------|-------------------|
| `services/pricing.py` (source de vérité) | `(620×2.5+150)×1.20` | 2 040 € ✓ |
| `useVariant.ts` | `620×1×2.5×1.20+150×1.20` | 2 040 € ✓ (correct mais fragile) |
| `useSearch.ts` | Hardcodé manuellement | 2 040 € ✓ (mais autres produits faux) |
| `products._index.tsx` `calcPrice()` | `620×1×2.5×120+150×1.2` | 186 180 € ❌ **BUG P0** |
| `products.$handle.tsx` related | `620×2.5×1.2×120+150×1.2` | 223 380 € ❌ **BUG P0** |

Le moteur de pricing Python est le seul fiable. Il faut une couche API unique qui serve les prix calculés.

---

#### DEBT-02 — Catalogue dupliqué 5 fois côté frontend

| Fichier | Produits | Type |
|---------|----------|------|
| `routes/_index.tsx` `FEATURED_PRODUCTS` | 4 produits, prix hardcodés | Array local |
| `routes/products._index.tsx` `CATALOG` | 10 produits, prix calculés | Array local |
| `routes/products.$handle.tsx` `PRODUCTS_DB` | 10 produits, prix wrong | Array local |
| `hooks/useSearch.ts` `CATALOG` | 10 produits, prix hardcodés mixtes | Array local |
| `middleware/data/mock_products.py` | 10 produits | Source Python |

Toute modification d'un produit (prix, image, description) doit être propagée dans 5 endroits.

---

#### DEBT-03 — `CartContext.addItem` : stale closure sur `state.items`

**Fichier :** `apps/frontend/app/context/CartContext.tsx`, lignes 145-153

```typescript
const addItem = useCallback((item) => {
    dispatch({ type: "ADD_ITEM", item: { ...item, quantity: item.quantity ?? 1 } });
    // ⚠ state.items est une closure stale — lit l'état AVANT le dispatch
    const newItems = [...state.items];
    const existing = newItems.find((i) => i.id === item.id);
    if (existing) existing.quantity++;
    // ...
    console.log("[SOFA-CLOUD CART]", JSON.stringify(cartToJSON(newItems)));
}, [state.items]);  // ← recréé à chaque ajout au panier
```

Le log est toujours "avant" l'ajout réel. La dépendance `[state.items]` force la recréation du callback à chaque modification du panier, invalidant tous les composants qui reçoivent `addItem` en prop.

---

#### DEBT-04 — `SupplierService.process_sync_request` ne persiste rien

**Fichier :** `apps/middleware/services/supplier.py`, ligne 82

```python
def process_sync_request(self, request: SupplierSyncRequest) -> list[dict]:
    results = []
    for raw_product in request.products:
        processed = self.process_product(raw_product)
        results.append({
            ...
            "status": "computed" if request.dry_run else "ready_to_save",
            # ⚠ "ready_to_save" mais aucun save ne se produit jamais
        })
    return results
```

Le mode `dry_run=False` est identique à `dry_run=True` — aucune donnée n'est écrite en base.

---

#### DEBT-05 — `get_db` : type hint incorrect + commit auto systématique

**Fichier :** `apps/middleware/core/database.py`

```python
async def get_db() -> AsyncSession:  # ← devrait être AsyncGenerator[AsyncSession, None]
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # ← commit même si aucune écriture (GET requests)
```

---

#### DEBT-06 — `datetime.utcnow()` déprécié Python 3.11+

**Fichier :** `apps/middleware/models/product.py`, lignes 31, 67, 68

```python
last_synced_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

`datetime.utcnow()` est déprécié depuis Python 3.12. Utiliser `datetime.now(timezone.utc)`.

---

#### DEBT-07 — `cn()` manque `tailwind-merge`

**Fichier :** `apps/frontend/app/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);  // ← sans tailwind-merge, classes en conflit ne sont pas dédupliquées
}
```

Ex : `cn("text-red-500", "text-blue-500")` → `"text-red-500 text-blue-500"` (les deux restent, CSS imprévisible).

---

#### DEBT-08 — `theme.config.json` référencé mais non utilisé

**Fichier :** `shared/config/theme.config.json`

Mentionné dans `config.py` (commentaire "surchargeable par theme.config.json") mais jamais chargé. Le `PricingEngine` utilise des constantes hardcodées.

---

### 🟡 D — Qualité Produit (e-commerce)

#### ECOM-01 — Stock global partagé entre tous les produits

**Fichier :** `apps/middleware/data/mock_products.py`

```python
VARIANT_SIZES = [
    {"option": "2 Places", "size_multiplier": 0.85, "weight_kg": 52.0, "stock": 8},
    {"option": "3 Places", "size_multiplier": 1.00, "weight_kg": 68.0, "stock": 12},
    {"option": "4 Places", "size_multiplier": 1.18, "weight_kg": 84.0, "stock": 5},
]
```

Chacun des 10 canapés a le même stock (8/12/5 unités). En prod, chaque variant doit avoir son propre stock.

---

#### ECOM-02 — Delivery endpoint ignore le code postal

**Fichier :** `apps/middleware/api/v1/delivery.py`, ligne 49

```python
zip_code: str = Query(default="75001", ...),
# ... zip_code n'est jamais utilisé dans la logique
```

Le `zip_code` est reçu dans le paramètre mais totalement ignoré dans le calcul. Paris 75001 et Bastia 20000 obtiendraient le même délai. Au minimum, une règle Corse/DOM-TOM devrait exister.

---

#### ECOM-03 — Prix de recherche (`useSearch.ts`) incorrects

Les prix hardcodés dans `useSearch.ts` ne correspondent pas à la formule PricingEngine :

| Produit | Prix useSearch | Prix attendu (PricingEngine) |
|---------|----------------|------------------------------|
| La Sérénité | 1 590 € | (450×2.5+150)×1.20 = **1 530 €** |
| Le Palermo | 1 380 € | (390×2.5+150)×1.20 = **1 350 €** |
| La Bastide | 1 449 € | (410×2.5+150)×1.20 = **1 407 €** |

Les prix affichés dans le dropdown de recherche sont incorrects.

---

#### ECOM-04 — `VARIANTS_BASE` sur la PDP : stock hardcodé (incorrectement)

**Fichier :** `apps/frontend/app/routes/products.$handle.tsx`, lignes 57-61

```typescript
const VARIANTS_BASE: ProductVariant[] = [
    { option: "2 Places", price_ttc: 0, compare_at_price_ttc: 0, stock: 12 },
    { option: "3 Places", price_ttc: 0, compare_at_price_ttc: 0, stock: 8 },
    { option: "4 Places", price_ttc: 0, compare_at_price_ttc: 0, stock: 4 },
];
```

Tous les produits ont le même stock affiché sur la PDP, inversion de 3P/2P vs mock_products.py (2P=8, 3P=12, 4P=5 vs ici 2P=12, 3P=8, 4P=4).

---

### 🟡 E — Performance & UX

#### PERF-01 — Pas de `srcset` / images responsives

Toutes les images utilisent Unsplash avec un paramètre `?w=` fixe. Pas d'attribut `srcset` ni `sizes`. Sur mobile, des images 600px sont chargées alors qu'un `srcset` permettrait 300px.

---

#### PERF-02 — Polices Google Fonts en preconnect uniquement

**Fichier :** `apps/frontend/app/root.tsx`

Cormorant Garamond + Inter sont chargées depuis Google Fonts (latence réseau). Pas de `font-display: swap` explicite dans le link. En cas de latence réseau, le texte est invisible (FOIT).

---

#### PERF-03 — Absence de caching côté middleware

Les endpoints produits recalculent le catalogue mock à chaque requête (crée un `PricingEngine`, itère, calcule). Pour de vraies données DB, il faudra du cache (Redis / in-memory).

---

### 🔴 F — Observabilité

Aucune des dimensions suivantes n'est implémentée :

| Item | État |
|------|------|
| Logging structuré (JSON) | ❌ uniquement `print()` |
| Correlation ID | ❌ |
| Error tracking (Sentry) | ❌ |
| Métriques (Prometheus) | ❌ |
| Healthcheck middleware DB | ❌ (seul `/health` basic existe) |
| Traces search/cart/checkout | ❌ |

---

### 🟢 G — Risques Shopify (Analyse Forward-Looking)

#### SHOPIFY-01 — Modèle produit : bonne base, gaps à combler

| Champ Shopify | Modèle actuel | Risque |
|---------------|---------------|--------|
| `gid://shopify/Product/123` | `shopify_product_id: String(50)` | ✓ existe — longueur OK |
| `gid://shopify/ProductVariant/456` | `shopify_variant_id: String(50)` | ✓ existe |
| `metafields` | Non modélisé | ⚠ nécessaire pour material/style |
| `collections` | Absent | ⚠ nécessaire pour navigation |
| `images[]` (multiples) | `image_placeholder: str` (1 seule URL) | ❌ restructuration nécessaire |
| `options[]` (jusqu'à 3) | `option1`, `option2` | ✓ aligné Shopify |
| `inventory_item_id` | Absent | ⚠ nécessaire pour ajustement stock |

---

#### SHOPIFY-02 — Stratégie checkout : deux options

**Option A (recommandée) — Shopify Checkout natif**
- Frontend crée un `CartLine` via Storefront API → redirige vers `checkout.shopify.com`
- Avantages : PCI-DSS géré, Shopify Payments, webhooks commandes inclus
- Inconvénients : moins de contrôle UX sur la page de paiement

**Option B — Checkout custom + Shopify catalogue seulement**
- Frontend gère le checkout, Shopify seulement pour catalogue/stock
- Avantages : UX totalement maîtrisée
- Inconvénients : responsabilité PCI, développement webhook paiement complex

**Recommandation :** Option A pour le MVP. Implémenter l'interface `CheckoutProvider` maintenant (voir Phase 3).

---

#### SHOPIFY-03 — Mapping IDs : prévoir dès maintenant

La table `Product` a `shopify_product_id` et `Variant` a `shopify_variant_id`. C'est bon. Il manque :
- Un index sur `shopify_product_id` (col nullable → potentiel full scan)
- Un mécanisme de mapping bidirectionnel `internal_uuid ↔ shopify_gid`

---

## 4. Root Causes

1. **Logique métier dans les routes** : `calcPrice()` défini localement dans chaque route au lieu d'un service partagé. Cause directe des BUG-01 et BUG-02.

2. **Catalogue mock non centralisé** : 5 versions du catalogue dans 5 fichiers. Le Python est source de vérité mais le frontend n'appelle jamais l'API middleware.

3. **Absence de tests** : Zéro test unitaire ou d'intégration. Les bugs de pricing auraient été détectés immédiatement avec un snapshot test.

4. **Phases de dev non formalisées** : Des `TODO "Mission 5 → Shopify"` sont dispersés dans le code mais sans tracking formalisé.

5. **API middleware jamais appelée par le frontend** : `MIDDLEWARE_API_URL` est défini mais aucun `fetch()` vers le middleware n'existe dans les routes Remix. Tout le frontend tourne en auto-suffisant avec des données hardcodées.

---

## 5. Backlog Priorisé

### P0 — Bloquants prod / data loss / sécurité

| ID | Titre | Fichier(s) | Effort |
|----|-------|------------|--------|
| P0-1 | Corriger `calcPrice()` PLP : `120` → `1.20` | `products._index.tsx:33` | 5 min |
| P0-2 | Corriger prix related products PDP | `products.$handle.tsx:230-232` | 5 min |
| P0-3 | Désactiver bouton checkout (ou redirect placeholder) | `SideCart.tsx:150` | 10 min |
| P0-4 | Initialiser les tables DB au démarrage (Alembic ou create_all) | `main.py`, nouveau `alembic.ini` | 30 min |
| P0-5 | Ajouter API key middleware (X-API-Key) | `main.py`, `core/security.py` | 45 min |
| P0-6 | Implémenter la vraie persistance dans `process_sync_request` | `services/supplier.py` | 2h |

### P1 — Stabilité, qualité, DX

| ID | Titre | Fichier(s) | Effort |
|----|-------|------------|--------|
| P1-1 | Extraire pricing frontend en `lib/pricing.ts` (source unique) | Nouveau + `useVariant.ts`, `products._index.tsx`, `products.$handle.tsx`, `useSearch.ts` | 1h |
| P1-2 | Corriger type hint `get_db` → `AsyncGenerator` | `core/database.py` | 5 min |
| P1-3 | Remplacer `datetime.utcnow` → `datetime.now(timezone.utc)` | `models/product.py` | 10 min |
| P1-4 | Ajouter `tailwind-merge` dans `cn()` | `lib/utils.ts`, `package.json` | 15 min |
| P1-5 | Fixer stale closure + supprimer console.log debug dans `addItem` | `CartContext.tsx` | 20 min |
| P1-6 | Centraliser catalogue produits (loader Remix appelle l'API middleware) | Routes + loader | 3h |
| P1-7 | Corriger prix hardcodés dans `useSearch.ts` | `useSearch.ts` | 20 min |
| P1-8 | Aligner stock PDP avec `mock_products.py` | `products.$handle.tsx` | 10 min |
| P1-9 | Ajouter index DB sur `shopify_product_id`, `handle` | `models/product.py` | 20 min |
| P1-10 | Logging structuré (uvicorn JSON + middleware logging) | `main.py`, `core/logging.py` | 1h |

### P2 — Polish, refactors non bloquants

| ID | Titre | Effort |
|----|-------|--------|
| P2-1 | `srcset` + attribut `sizes` sur toutes les `<img>` | 2h |
| P2-2 | Gérer le zip_code dans la livraison (DOM-TOM, Corse) | 1h |
| P2-3 | Supprimer la duplication `CATALOG` dans routes frontend | 2h |
| P2-4 | Ajouter `ErrorBoundary` dans `root.tsx` | 30 min |
| P2-5 | Intégrer `theme.config.json` dans `PricingEngine` | 1h |
| P2-6 | Rate limiting sur les endpoints publics (slowapi) | 1h |
| P2-7 | Sentry / OpenTelemetry baseline | 2h |
| P2-8 | Configurer CORS strict (méthodes/headers explicites) | 15 min |
| P2-9 | Écrire les 5 premiers tests unitaires (PricingEngine) | 1h |

---

## 6. Plan de Remédiation en Phases

### Phase 1 — Stabiliser (Sprint 1, ~3 jours)

**Objectif :** Zéro bug P0, sécurité baseline, build propre.

```
Day 1 AM  → P0-1, P0-2, P0-3       (bugs prix + checkout placeholder)
Day 1 PM  → P0-4                    (Alembic init ou create_all)
Day 2     → P0-5, P1-2, P1-3       (API key + fixes Python mineurs)
Day 3     → P1-4, P1-5, P1-7, P1-8 (cn, addItem, prix recherche, stock PDP)
```

**Critères de sortie Phase 1 :**
- [ ] `/products` affiche des prix corrects (ex: Le Montaigne = 2 040 €)
- [ ] La section CrossSell sur PDP affiche des prix corrects
- [ ] Le bouton "Procéder au paiement" est disabled ou redirige vers une page placeholder
- [ ] Le middleware démarre sans erreur DB (tables créées)
- [ ] `POST /api/v1/sync/supplier` requiert un header `X-API-Key`
- [ ] Build frontend et middleware passent sans erreur

---

### Phase 2 — Clean Architecture (Sprint 2, ~1 semaine)

**Objectif :** Source unique de vérité, catalogue piloté par l'API, tests P1.

```
Week 2    → P1-1  : lib/pricing.ts — source unique pricing frontend
          → P1-6  : Loader Remix appelle l'API middleware (farewell aux CATALOG hardcodés)
          → P1-10 : Logging structuré
          → P0-6  : Persistance sync supplier en DB
          → P2-4  : ErrorBoundary root
          → P2-9  : 5 tests unitaires PricingEngine
```

**Critères de sortie Phase 2 :**
- [ ] Modifier un prix fournisseur dans `mock_products.py` se propage sur toutes les pages sans autre modification
- [ ] `process_sync_request` avec `dry_run=False` persiste en base de données
- [ ] Logs JSON structurés visibles dans `docker-compose logs middleware`
- [ ] 5 tests unitaires verts pour PricingEngine

---

### Phase 3 — Préparer Shopify (Sprint 3+, ~2 semaines)

**Objectif :** Interfaces provider, mapping IDs, stratégie checkout.

```
Week 3-4  → Définir CatalogProvider interface
          → Implémenter LocalProvider (mock actuel)
          → ShopifyProvider (appelle Storefront API)
          → Définir CheckoutProvider (Option A ou B)
          → Mapping shopify_gid ↔ internal_uuid
          → Webhooks product/update, inventory/update
```

**Architecture provider suggérée (Python) :**

```python
# middleware/providers/base.py
from abc import ABC, abstractmethod

class CatalogProvider(ABC):
    @abstractmethod
    async def get_products(self, limit: int, offset: int) -> list[Product]: ...

    @abstractmethod
    async def get_product_by_handle(self, handle: str) -> Product | None: ...

class InventoryProvider(ABC):
    @abstractmethod
    async def get_stock(self, variant_id: str) -> int: ...

    @abstractmethod
    async def reserve_stock(self, variant_id: str, qty: int) -> bool: ...

class CheckoutProvider(ABC):
    @abstractmethod
    async def create_checkout(self, cart_lines: list[CartLine]) -> CheckoutSession: ...
```

```python
# middleware/providers/local_provider.py — actuel (mock + DB)
class LocalCatalogProvider(CatalogProvider):
    async def get_products(self, limit, offset): ...  # utilise mock_products.py

# middleware/providers/shopify_provider.py — futur
class ShopifyCatalogProvider(CatalogProvider):
    async def get_products(self, limit, offset): ...  # appelle Storefront API
```

---

## 7. Quick Wins (≤ 2h cumulé)

Ces 6 corrections peuvent être faites en moins de 2h et éliminent les risques P0/P1 les plus critiques :

| # | Action | Impact | Durée |
|---|--------|--------|-------|
| 1 | Corriger `calcPrice()` × 2 fichiers | Prix corrects en prod | 10 min |
| 2 | Désactiver bouton checkout avec tooltip | UX honnête | 10 min |
| 3 | Corriger type `get_db` + `datetime.utcnow` | Code propre Python 3.11+ | 10 min |
| 4 | Ajouter `tailwind-merge` dans `cn()` | Fin des bugs CSS classes | 15 min |
| 5 | Fixer stale closure `addItem` + supprimer console.log | Performance re-render + prod-ready | 20 min |
| 6 | Corriger les 3 prix incorrects dans `useSearch.ts` | Recherche fiable | 15 min |

---

## 8. Big Rocks (investissement > 1 jour)

| # | Action | Valeur | Effort |
|---|--------|--------|--------|
| A | Centraliser le catalogue (Remix loaders → API middleware) | Élimine toute la duplication | 3-5j |
| B | Alembic migrations + seed script | DB production-ready | 1-2j |
| C | Suite de tests (PricingEngine + routes API + CartContext) | Filet de sécurité pour refactors | 2-3j |
| D | Implémentation `CatalogProvider` + `LocalProvider` | Shopify-ready en 1 sprint | 3-4j |
| E | Logging structuré + Sentry | Observabilité de base | 2-3j |
| F | Checkout placeholder → Shopify Checkout (Option A) | Flow complet acheteur | 1-2 semaines |

---

## 9. How to Test (Critères d'acceptance)

### Test BUG-01 et BUG-02 (Prix)
```
1. Ouvrir /products
2. Observer le prix affiché pour "Le Montaigne"
   → Attendu : ~2 040 €
   → Avant fix : ~186 180 €
3. Ouvrir /products/le-montaigne
4. Scroller jusqu'à la section "Vous aimerez aussi"
   → Tous les prix doivent être entre 1 300 € et 3 200 €
```

### Test BUG-04 (DB init)
```bash
docker-compose up -d
curl http://localhost:8000/api/v1/products/
# → Avant fix : 500 "relation products does not exist"
# → Après fix : 200 avec catalogue mock
```

### Test SEC-01 (API Key)
```bash
# Sans clé → 401
curl -X POST http://localhost:8000/api/v1/sync/supplier -H "Content-Type: application/json" -d '{"products":[]}'
# Avec clé → 200
curl -X POST http://localhost:8000/api/v1/sync/supplier \
  -H "X-API-Key: $INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"products":[], "dry_run": true}'
```

### Test CartContext (Stale closure)
```
1. Ajouter un produit au panier
2. Ouvrir la console du navigateur
3. → Avant fix : le log montre l'état AVANT l'ajout
4. → Après fix : aucun console.log en production, ou log correct en dev
```

### Test PricingEngine (Python)
```bash
cd apps/middleware
python -c "
from services.pricing import PricingEngine
e = PricingEngine()
r = e.calculate(620)
assert float(r.price_ttc) == 2040.00, f'Expected 2040, got {r.price_ttc}'
print('PricingEngine OK:', r.price_ttc)
"
```

---

*Rapport généré le 22 février 2026 — Sofa-Cloud v2.0.0*
