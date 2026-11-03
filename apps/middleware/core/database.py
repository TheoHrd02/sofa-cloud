"""
SOFA-CLOUD — Database Setup
SQLAlchemy async engine + session factory.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from .config import get_settings

settings = get_settings()

# ── Async Engine ──────────────────────────────────────────────────────────────
# SQLite (dev/tests sans infrastructure) ne connaît pas les options de pool.
_pool_options = (
    {} if settings.database_url.startswith("sqlite") else {"pool_size": 10, "max_overflow": 20}
)
engine = create_async_engine(
    settings.database_url,
    echo=settings.python_env == "development",
    **_pool_options,
)

# ── Session Factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base Declarative ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# ── Dependency Injection (FastAPI) ────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yields an async DB session, auto-closes on exit."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
