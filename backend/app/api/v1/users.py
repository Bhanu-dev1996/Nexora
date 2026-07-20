from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission
from app.core.errors import AppError
from app.database import get_db
from app.models.user import User
from app.models.user_organization import UserOrganization
from app.schemas.common import APIResponse
from app.schemas.user import UpdateUserRequest
from app.utils.helpers import parse_pagination

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def list_users(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("users.read"))):
    q = dict(request.query_params)
    pg = parse_pagination(q)
    org_id = request.state.organization_id

    where = [
        UserOrganization.organization_id == org_id,
        UserOrganization.status == q.get("status", "active"),
        User.deleted_at == None,
    ]

    if q.get("role"):
        where.append(UserOrganization.role == q["role"])

    stmt = (
        select(User)
        .join(UserOrganization, UserOrganization.user_id == User.id)
        .where(*where)
        .offset(pg["skip"])
        .limit(pg["limit"])
        .order_by(User.created_at.desc())
    )
    result = await db.execute(stmt)
    users = result.scalars().all()

    count_stmt = select(func.count()).select_from(User).join(UserOrganization, UserOrganization.user_id == User.id).where(*where)
    total = (await db.execute(count_stmt)).scalar() or 0

    mapped = []
    for u in users:
        org_result = await db.execute(select(UserOrganization).where(UserOrganization.user_id == u.id, UserOrganization.organization_id == org_id).limit(1))
        uo = org_result.scalars().first()
        mapped.append({
            "id": u.id, "email": u.email, "firstName": u.first_name, "lastName": u.last_name,
            "avatar": u.avatar_url, "phone": u.phone, "jobTitle": u.job_title,
            "role": uo.role if uo else "viewer", "status": uo.status if uo else "active",
            "isActive": u.is_active, "lastLoginAt": u.last_login_at.isoformat() if u.last_login_at else None,
            "createdAt": u.created_at.isoformat(),
        })

    return APIResponse(data=mapped, meta={"page": pg["page"], "limit": pg["limit"], "total": total, "totalPages": (total + pg["limit"] - 1) // pg["limit"]})


@router.get("/{user_id}")
async def get_user(user_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("users.read"))):
    org_id = request.state.organization_id
    result = await db.execute(
        select(User).join(UserOrganization, UserOrganization.user_id == User.id)
        .where(User.id == user_id, UserOrganization.organization_id == org_id, User.deleted_at == None)
    )
    user = result.scalars().first()
    if not user:
        raise AppError.not_found("User not found")

    org_result = await db.execute(select(UserOrganization).where(UserOrganization.user_id == user_id, UserOrganization.organization_id == org_id).limit(1))
    uo = org_result.scalars().first()

    return APIResponse(data={
        "id": user.id, "email": user.email, "firstName": user.first_name, "lastName": user.last_name,
        "avatar": user.avatar_url, "phone": user.phone, "jobTitle": user.job_title,
        "role": uo.role if uo else "viewer", "isActive": user.is_active,
        "mfaEnabled": user.mfa_enabled,
        "lastLoginAt": user.last_login_at.isoformat() if user.last_login_at else None,
        "createdAt": user.created_at.isoformat(), "updatedAt": user.updated_at.isoformat() if user.updated_at else None,
    })


@router.put("/{user_id}")
async def update_user(user_id: str, body: UpdateUserRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("users.update"))):
    org_id = request.state.organization_id
    result = await db.execute(
        select(User).join(UserOrganization, UserOrganization.user_id == User.id)
        .where(User.id == user_id, UserOrganization.organization_id == org_id, User.deleted_at == None)
    )
    user = result.scalars().first()
    if not user:
        raise AppError.not_found("User not found")

    if body.firstName is not None:
        user.first_name = body.firstName
    if body.lastName is not None:
        user.last_name = body.lastName
    if body.phone is not None:
        user.phone = body.phone
    if body.jobTitle is not None:
        user.job_title = body.jobTitle
    if body.avatarUrl is not None:
        user.avatar_url = body.avatarUrl

    await db.commit()
    await db.refresh(user)
    return APIResponse(data={"id": user.id, "firstName": user.first_name, "lastName": user.last_name, "updatedAt": user.updated_at.isoformat() if user.updated_at else None})


@router.delete("/{user_id}")
async def delete_user(user_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("users.delete"))):
    org_id = request.state.organization_id
    result = await db.execute(
        select(User).join(UserOrganization, UserOrganization.user_id == User.id)
        .where(User.id == user_id, UserOrganization.organization_id == org_id, User.deleted_at == None)
    )
    user = result.scalars().first()
    if not user:
        raise AppError.not_found("User not found")

    user.deleted_at = func.now()
    user.is_active = False
    await db.commit()
    return APIResponse(data={"message": "User removed from organization"})
