from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.config import settings
from app.core.errors import AppError
from app.core.redis import Cache
from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.database import get_db
from app.models.organization import Organization
from app.models.role import Role, RolePermission, Permission
from app.models.user import User
from app.models.user_organization import UserOrganization
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.schemas.common import APIResponse
from app.utils.helpers import slugify

router = APIRouter(prefix="/auth", tags=["auth"])


async def _get_role_permissions(role_slug: str, organization_id: str, db: AsyncSession) -> list[str]:
    stmt = (
        select(Role)
        .join(RolePermission, RolePermission.role_id == Role.id)
        .join(Permission, Permission.id == RolePermission.permission_id)
        .where(
            Role.slug == role_slug,
            ((Role.organization_id == None) & (Role.is_system == True)) | (Role.organization_id == organization_id),
            Role.deleted_at == None,
        )
    )
    result = await db.execute(stmt)
    role = result.scalars().first()
    if not role:
        return []

    stmt2 = (
        select(Permission.resource, Permission.action)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == role.id)
    )
    result2 = await db.execute(stmt2)
    return [f"{r.resource}.{r.action}" for r in result2.all()]


@router.post("/register")
async def register(body: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email.lower()))
    if existing.scalars().first():
        raise AppError.conflict("An account with this email already exists")

    password_hash = hash_password(body.password)
    user = User(email=body.email.lower(), password_hash=password_hash, first_name=body.firstName, last_name=body.lastName)
    db.add(user)
    await db.flush()

    org = Organization(name=body.organizationName, slug=slugify(body.organizationName))
    db.add(org)
    await db.flush()

    user_org = UserOrganization(user_id=user.id, organization_id=org.id, role="organization_admin", is_default=True)
    db.add(user_org)
    await db.commit()
    await db.refresh(user)
    await db.refresh(org)

    permissions = await _get_role_permissions("organization_admin", org.id, db)
    token = create_access_token(user.id, org.id, "organization_admin", permissions, user.email)
    refresh = create_refresh_token()

    return APIResponse(
        data={
            "user": {"id": user.id, "email": user.email, "firstName": user.first_name, "lastName": user.last_name, "role": "organization_admin", "organizationId": org.id, "createdAt": user.created_at.isoformat()},
            "tokens": {"accessToken": token, "refreshToken": refresh, "accessTokenExpiresAt": (datetime.now(timezone.utc).__class__.now(timezone.utc)).isoformat()},
        }
    )


@router.post("/login")
async def login(body: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(User.email == body.email.lower(), User.deleted_at == None)
    )
    user = result.scalars().first()
    if not user or not verify_password(body.password, user.password_hash):
        raise AppError.unauthorized("Invalid email or password", "INVALID_CREDENTIALS")

    if not user.is_active:
        raise AppError.unauthorized("Account has been deactivated", "ACCOUNT_DEACTIVATED")

    org_result = await db.execute(
        select(UserOrganization).where(UserOrganization.user_id == user.id, UserOrganization.status == "active").limit(1)
    )
    user_org = org_result.scalars().first()
    if not user_org:
        raise AppError.forbidden("No active organization found")

    permissions = await _get_role_permissions(user_org.role, user_org.organization_id, db)
    token = create_access_token(user.id, user_org.organization_id, user_org.role, permissions, user.email)
    refresh = create_refresh_token()

    user.last_login_at = datetime.now(timezone.utc)
    user.last_login_ip = request.client.host if request.client else None
    await db.commit()

    return APIResponse(
        data={
            "user": {"id": user.id, "email": user.email, "firstName": user.first_name, "lastName": user.last_name, "role": user_org.role, "avatar": user.avatar_url, "organizationId": user_org.organization_id, "permissions": permissions},
            "tokens": {"accessToken": token, "refreshToken": refresh, "accessTokenExpiresAt": datetime.now(timezone.utc).isoformat(), "refreshTokenExpiresAt": datetime.now(timezone.utc).isoformat()},
        }
    )


@router.post("/refresh-token")
async def refresh_token(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    if not body.refreshToken.startswith("rt_"):
        raise AppError.unauthorized("Invalid refresh token")

    if await Cache.is_blacklisted(body.refreshToken):
        raise AppError.unauthorized("Refresh token has been revoked")

    result = await db.execute(select(User).where(User.is_active == True, User.deleted_at == None).limit(1))
    user = result.scalars().first()
    if not user:
        raise AppError.unauthorized("Invalid refresh token")

    org_result = await db.execute(
        select(UserOrganization).where(UserOrganization.user_id == user.id, UserOrganization.status == "active").limit(1)
    )
    user_org = org_result.scalars().first()
    if not user_org:
        raise AppError.unauthorized("Invalid refresh token")

    permissions = await _get_role_permissions(user_org.role, user_org.organization_id, db)
    token = create_access_token(user.id, user_org.organization_id, user_org.role, permissions, user.email)
    new_refresh = create_refresh_token()

    return APIResponse(
        data={"accessToken": token, "refreshToken": new_refresh, "accessTokenExpiresAt": datetime.now(timezone.utc).isoformat(), "refreshTokenExpiresAt": datetime.now(timezone.utc).isoformat()}
    )


@router.post("/logout")
async def logout(request: Request, user_payload: dict = Depends(get_current_user)):
    body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    refresh_token = body.get("refreshToken")
    if refresh_token:
        await Cache.blacklist_token(refresh_token, ttl=settings.JWT_REFRESH_EXPIRY * 60)
    return APIResponse(data={"message": "Successfully logged out"})


@router.get("/me")
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    user_payload = await get_current_user(request, db)
    user_id = user_payload["sub"]
    org_id = user_payload["org_id"]

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise AppError.not_found("User not found")

    org_result = await db.execute(
        select(UserOrganization).where(UserOrganization.user_id == user_id, UserOrganization.organization_id == org_id).limit(1)
    )
    user_org = org_result.scalars().first()

    return APIResponse(
        data={
            "id": user.id,
            "email": user.email,
            "firstName": user.first_name,
            "lastName": user.last_name,
            "avatar": user.avatar_url,
            "phone": user.phone,
            "jobTitle": user.job_title,
            "role": user_org.role if user_org else "viewer",
            "organizationId": org_id,
            "permissions": user_payload.get("permissions", []),
            "mfaEnabled": user.mfa_enabled,
            "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
            "createdAt": user.created_at.isoformat(),
        }
    )
