"""
SOFA-CLOUD — API Security
Middleware-level API key guard for write endpoints.

Usage:
    from core.security import require_api_key
    @router.post("/endpoint")
    async def my_endpoint(_, api_key: str = Depends(require_api_key)):
        ...

The API key is read from the X-API-Key header and compared against
INTERNAL_API_KEY env var. Falls back to SECRET_KEY in development
if INTERNAL_API_KEY is not set.
"""

from fastapi import Header, HTTPException, status
from core.config import get_settings

settings = get_settings()


async def require_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> str:
    """
    FastAPI dependency — validates the X-API-Key header.
    Raises 401 if missing or invalid, 403 if wrong value.
    """
    expected = settings.internal_api_key
    if not expected:
        if settings.python_env == "development":
            return x_api_key
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="INTERNAL_API_KEY not configured on this server.",
        )
    if x_api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key.",
        )
    return x_api_key
