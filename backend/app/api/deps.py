from functools import wraps
from typing import Callable, List

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import AppError
from app.core.redis import Cache
from app.core.security import decode_access_token
from app.database import get_db


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise AppError.unauthorized("Missing authentication token")

    token = auth_header.split(" ", 1)[1]
    payload = decode_access_token(token)
    if not payload:
        raise AppError.unauthorized("Invalid or expired token")

    jti = payload.get("jti")
    if jti and await Cache.is_blacklisted(jti):
        raise AppError.unauthorized("Token has been revoked")

    request.state.user = payload
    request.state.organization_id = payload.get("org_id")
    return payload


def require_permission(*permissions: str):
    async def _check(request: Request, _user: dict = Depends(get_current_user)):
        if _user.get("role") == "super_admin":
            return

        user_perms = _user.get("permissions", [])
        missing = [p for p in permissions if p not in user_perms]
        if missing:
            raise AppError.forbidden(f"Missing required permissions: {', '.join(missing)}")

    return _check
