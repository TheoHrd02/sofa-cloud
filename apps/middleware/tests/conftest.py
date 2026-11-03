"""
SOFA-CLOUD — Configuration pytest
Les tests tournent sur SQLite, sans aucune infrastructure.
Pour les jouer contre PostgreSQL : exporter DATABASE_URL avant de lancer pytest.

Ce module est chargé avant les tests, donc avant le premier get_settings() (mis en cache) :
c'est le seul endroit où fixer l'URL de la base de test.
"""

import os
from pathlib import Path

_TEST_DB = Path(__file__).parent / ".test.db"
_TEST_DB.unlink(missing_ok=True)
os.environ.setdefault("DATABASE_URL", f"sqlite+aiosqlite:///{_TEST_DB.as_posix()}")
