# 🛋️ Sofa-Cloud — Plateforme E-commerce Headless Premium

> Architecture Headless : **Shopify Admin** (Cerveau) → **FastAPI** (Système Nerveux) → **Hydrogen/React** (Peau)

---

## 🏗️ Stack Technique

| Couche | Technologie | Port |
|---|---|---|
| Frontend | Hydrogen (React/Remix) + Node 20 | `3000` |
| Middleware | FastAPI + Python 3.11 | `8000` |
| Database | PostgreSQL 15 | `5432` |

---

## 🚀 Démarrage Rapide

### Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- [Git](https://git-scm.com/)

### 1. Cloner & Configurer
```bash
git clone https://github.com/your-org/sofa-cloud.git
cd sofa-cloud

# Configurer les variables d'environnement
cp .env.example .env
# ⚠️ Éditer .env avec vos clés Shopify, Cloudinary, etc.
```

### 2. Lancer les Services
```bash
# Construire et démarrer tous les services
docker compose up --build

# En arrière-plan
docker compose up --build -d
```

### 3. Vérifier
| Service | URL | Statut attendu |
|---|---|---|
| Frontend | http://localhost:3000 | Page d'accueil Hydrogen |
| Middleware API | http://localhost:8000/health | `{"status": "ok"}` |
| Middleware Docs | http://localhost:8000/docs | Swagger UI |

### Démarrage sans Docker (SQLite)

Sans `DATABASE_URL`, le middleware utilise SQLite (`apps/middleware/sofa_cloud.db`) : ni PostgreSQL ni
Docker ne sont nécessaires. Prérequis : Python 3.11 à 3.14, Node ≥ 20.

```bash
cd apps/middleware && pip install -r requirements.txt && uvicorn main:app --port 8000
```

```bash
cd apps/frontend && npm ci && npm run dev
```

Vérification complète (tests middleware sur SQLite, typecheck, tests et build frontend) : `./check.sh`.
Pour jouer les tests contre PostgreSQL, exporter `DATABASE_URL` avant `pytest`.

---

## 📁 Structure du Projet

```
FurnituresMarketplace/
├── apps/
│   ├── frontend/        # Hydrogen (React/Remix)
│   └── middleware/      # FastAPI (Python)
├── shared/
│   └── config/
│       └── theme.config.json   # Thématique multi-tenant
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🎨 Multi-Tenant

Pour adapter la plateforme à un nouveau client, modifier uniquement :
```
shared/config/theme.config.json
```
→ Couleurs, polices, fonctionnalités, intégrations — sans toucher au code.

---

## 🛠️ Commandes Utiles

```bash
# Voir les logs d'un service
docker compose logs -f middleware
docker compose logs -f frontend

# Accéder au shell d'un container
docker compose exec middleware bash
docker compose exec db psql -U sofa_user sofa_cloud

# Arrêter les services
docker compose down

# Arrêter et supprimer les volumes (reset DB)
docker compose down -v
```

---

## 📋 Missions

- [x] **Mission 1** — Infrastructure Dockerisée & Monorepo
- [ ] **Mission 2** — Middleware FastAPI : Shopify Storefront API
- [ ] **Mission 3** — Frontend Hydrogen : Pages Produit & Collection
- [ ] **Mission 4** — Automation Fournisseurs (Stocks/Prix)
- [ ] **Mission 5** — Cloudinary : Vidéo Hero & Optimisation Assets
