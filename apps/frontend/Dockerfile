# ─────────────────────────────────────────
#  SOFA-CLOUD — Frontend Dockerfile
#  Base : Node 20 Alpine
#  Stages : development | production
# ─────────────────────────────────────────

# ── Stage 1 : Base ───────────────────────
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for layer caching
COPY package.json package-lock.json* ./
# npm install (pas npm ci) car il n'y a pas encore de package-lock.json
RUN npm install

# ── Stage 2 : Development (hot-reload) ───
FROM base AS development
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Stage 3 : Builder ────────────────────
FROM base AS builder
COPY . .
RUN npm run build

# ── Stage 4 : Production (minimal) ───────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

RUN npm install --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start"]
