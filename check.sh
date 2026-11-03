#!/usr/bin/env sh
# SOFA-CLOUD — vérification complète, sans infrastructure (SQLite, pas de Docker).
# Prérequis : dépendances installées (voir README, « Démarrage sans Docker »).
# Chaque partie tourne même si la précédente échoue ; le code de sortie est non nul si l'une échoue.
cd "$(dirname "$0")"
PY=$(command -v python || command -v python3)
status=0

echo "── middleware : pytest"
(cd apps/middleware && "$PY" -m pytest -q) || status=1

echo "── frontend : typecheck, tests, build"
(cd apps/frontend && npm run typecheck && npm test && npm run build) || status=1

[ "$status" -eq 0 ] && echo "── check : VERT" || echo "── check : ROUGE"
exit "$status"
