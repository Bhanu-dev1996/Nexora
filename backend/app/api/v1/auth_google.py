from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.errors import AppError
from app.core.security import create_access_token, create_refresh_token
from app.database import get_db
from app.models.organization import Organization
from app.models.role import Role, RolePermission, Permission
from app.models.user import User
from app.models.user_organization import UserOrganization
from app.schemas.common import APIResponse
from app.utils.helpers import slugify

router = APIRouter(prefix="/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    accessToken: str


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


@router.post("/google")
async def google_login(body: GoogleLoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID:
        raise AppError.bad_request("Google login is not configured")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/tokeninfo",
            params={"access_token": body.accessToken},
        )

    if resp.status_code != 200:
        raise AppError.unauthorized("Invalid Google access token")

    token_info = resp.json()
    aud = token_info.get("aud")
    if aud != settings.GOOGLE_CLIENT_ID:
        raise AppError.unauthorized("Token audience mismatch")

    email = token_info.get("email", "").lower()
    google_id = token_info.get("sub", "")
    first_name = token_info.get("given_name", "")
    last_name = token_info.get("family_name", "")
    avatar = token_info.get("picture", "")

    if not email:
        raise AppError.unauthorized("Email not provided by Google")

    result = await db.execute(select(User).where(User.email == email, User.deleted_at == None))
    user = result.scalars().first()

    if user:
        if not user.google_id:
            user.google_id = google_id
        if avatar and not user.avatar_url:
            user.avatar_url = avatar
        user.last_login_at = datetime.now(timezone.utc)
        user.last_login_ip = request.client.host if request.client else None
        await db.commit()
        await db.refresh(user)
    else:
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            avatar_url=avatar,
            google_id=google_id,
            email_verified_at=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.flush()

        org_name = first_name + "'s Organization" if first_name else "My Organization"
        org = Organization(name=org_name, slug=slugify(org_name))
        db.add(org)
        await db.flush()

        user_org = UserOrganization(
            user_id=user.id,
            organization_id=org.id,
            role="organization_admin",
            is_default=True,
        )
        db.add(user_org)
        await db.commit()
        await db.refresh(user)
        await db.refresh(org)

    org_result = await db.execute(
        select(UserOrganization).where(
            UserOrganization.user_id == user.id,
            UserOrganization.status == "active",
        ).limit(1)
    )
    user_org = org_result.scalars().first()
    if not user_org:
        raise AppError.forbidden("No active organization found")

    permissions = await _get_role_permissions(user_org.role, user_org.organization_id, db)
    token = create_access_token(user.id, user_org.organization_id, user_org.role, permissions, user.email)
    refresh = create_refresh_token()

    return APIResponse(
        data={
            "user": {
                "id": user.id,
                "email": user.email,
                "firstName": user.first_name,
                "lastName": user.last_name,
                "avatar": user.avatar_url,
                "role": user_org.role,
                "organizationId": user_org.organization_id,
                "permissions": permissions,
            },
            "tokens": {
                "accessToken": token,
                "refreshToken": refresh,
                "accessTokenExpiresAt": datetime.now(timezone.utc).isoformat(),
            },
        }
    )
