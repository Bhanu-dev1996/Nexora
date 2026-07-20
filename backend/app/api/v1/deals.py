from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission
from app.core.errors import AppError
from app.database import get_db
from app.models.contact import Contact
from app.models.company import Company
from app.models.deal import Deal
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.deal import CreateDealRequest, MoveStageRequest, UpdateDealRequest
from app.utils.helpers import parse_pagination

router = APIRouter(prefix="/deals", tags=["deals"])


@router.get("/")
async def list_deals(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("deals.read"))):
    q = dict(request.query_params)
    pg = parse_pagination(q)
    org_id = request.state.organization_id

    where = [Deal.organization_id == org_id, Deal.deleted_at == None]
    if q.get("stage"):
        where.append(Deal.stage == q["stage"])
    if q.get("status"):
        where.append(Deal.status == q["status"])
    if q.get("assignedTo"):
        where.append(Deal.owner_user_id == q["assignedTo"])

    stmt = select(Deal).where(*where).offset(pg["skip"]).limit(pg["limit"]).order_by(Deal.created_at.desc())
    result = await db.execute(stmt)
    deals = result.scalars().all()

    count_stmt = select(func.count()).select_from(Deal).where(*where)
    total = (await db.execute(count_stmt)).scalar() or 0

    mapped = []
    for d in deals:
        owner = None
        if d.owner_user_id:
            ur = await db.execute(select(User).where(User.id == d.owner_user_id))
            u = ur.scalars().first()
            if u:
                owner = {"id": u.id, "name": f"{u.first_name} {u.last_name}"}
        contact = None
        if d.contact_id:
            cr = await db.execute(select(Contact).where(Contact.id == d.contact_id))
            co = cr.scalars().first()
            if co:
                contact = {"id": co.id, "name": f"{co.first_name} {co.last_name}"}
        company = None
        if d.company_id:
            comr = await db.execute(select(Company).where(Company.id == d.company_id))
            com = comr.scalars().first()
            if com:
                company = {"id": com.id, "name": com.name}
        mapped.append({
            "id": d.id, "title": d.title, "amount": float(d.amount) if d.amount else None,
            "currency": d.currency, "stage": d.stage, "status": d.status,
            "probability": d.probability, "expectedCloseDate": d.expected_close_date.isoformat() if d.expected_close_date else None,
            "contact": contact, "company": company, "owner": owner,
            "createdAt": d.created_at.isoformat(), "updatedAt": d.updated_at.isoformat() if d.updated_at else None,
        })

    return APIResponse(data=mapped, meta={"page": pg["page"], "limit": pg["limit"], "total": total, "totalPages": (total + pg["limit"] - 1) // pg["limit"]})


@router.get("/{deal_id}")
async def get_deal(deal_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("deals.read"))):
    result = await db.execute(select(Deal).where(Deal.id == deal_id, Deal.organization_id == request.state.organization_id, Deal.deleted_at == None))
    deal = result.scalars().first()
    if not deal:
        raise AppError.not_found("Deal not found")

    owner = None
    if deal.owner_user_id:
        ur = await db.execute(select(User).where(User.id == deal.owner_user_id))
        u = ur.scalars().first()
        if u:
            owner = {"id": u.id, "name": f"{u.first_name} {u.last_name}", "email": u.email}
    contact = None
    if deal.contact_id:
        cr = await db.execute(select(Contact).where(Contact.id == deal.contact_id))
        co = cr.scalars().first()
        if co:
            contact = {"id": co.id, "name": f"{co.first_name} {co.last_name}", "email": co.email}
    company = None
    if deal.company_id:
        comr = await db.execute(select(Company).where(Company.id == deal.company_id))
        com = comr.scalars().first()
        if com:
            company = {"id": com.id, "name": com.name}

    return APIResponse(data={
        "id": deal.id, "title": deal.title, "description": deal.description,
        "stage": deal.stage, "status": deal.status,
        "amount": float(deal.amount) if deal.amount else None, "currency": deal.currency,
        "probability": deal.probability,
        "expectedCloseDate": deal.expected_close_date.isoformat() if deal.expected_close_date else None,
        "actualCloseDate": deal.actual_close_date.isoformat() if deal.actual_close_date else None,
        "lostReason": deal.lost_reason, "contact": contact, "company": company, "owner": owner,
        "customFields": deal.custom_fields,
        "createdAt": deal.created_at.isoformat(), "updatedAt": deal.updated_at.isoformat() if deal.updated_at else None,
    })


@router.post("/")
async def create_deal(body: CreateDealRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("deals.create"))):
    deal = Deal(
        organization_id=request.state.organization_id,
        title=body.title, description=body.description, stage=body.stage or "qualification",
        status=body.status or "open", amount=body.amount, currency=body.currency or "USD",
        probability=body.probability or 0,
        expected_close_date=datetime.fromisoformat(body.expectedCloseDate) if body.expectedCloseDate else None,
        contact_id=body.contactId, company_id=body.companyId,
        owner_user_id=body.ownerUserId or request.state.user["sub"],
        lost_reason=body.lostReason, custom_fields=body.customFields or {},
        created_by=request.state.user["sub"],
    )
    db.add(deal)
    await db.commit()
    await db.refresh(deal)
    return APIResponse(data={"id": deal.id, "title": deal.title, "amount": float(deal.amount) if deal.amount else None, "stage": deal.stage, "status": deal.status, "createdAt": deal.created_at.isoformat()})


@router.put("/{deal_id}")
async def update_deal(deal_id: str, body: UpdateDealRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("deals.update"))):
    result = await db.execute(select(Deal).where(Deal.id == deal_id, Deal.organization_id == request.state.organization_id, Deal.deleted_at == None))
    deal = result.scalars().first()
    if not deal:
        raise AppError.not_found("Deal not found")

    updates = body.model_dump(exclude_unset=True)
    field_map = {"contactId": "contact_id", "companyId": "company_id", "ownerUserId": "owner_user_id", "lostReason": "lost_reason", "customFields": "custom_fields", "expectedCloseDate": "expected_close_date"}
    for key, val in updates.items():
        if key == "expectedCloseDate":
            deal.expected_close_date = datetime.fromisoformat(val) if val else None
        else:
            setattr(deal, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(deal)
    return APIResponse(data={"id": deal.id, "title": deal.title, "stage": deal.stage, "updatedAt": deal.updated_at.isoformat() if deal.updated_at else None})


@router.delete("/{deal_id}")
async def delete_deal(deal_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("deals.delete"))):
    result = await db.execute(select(Deal).where(Deal.id == deal_id, Deal.organization_id == request.state.organization_id, Deal.deleted_at == None))
    deal = result.scalars().first()
    if not deal:
        raise AppError.not_found("Deal not found")
    deal.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return APIResponse(data={"message": "Deal deleted successfully"})


@router.post("/{deal_id}/move-stage")
async def move_stage(deal_id: str, body: MoveStageRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("deals.move_stage"))):
    result = await db.execute(select(Deal).where(Deal.id == deal_id, Deal.organization_id == request.state.organization_id, Deal.deleted_at == None))
    deal = result.scalars().first()
    if not deal:
        raise AppError.not_found("Deal not found")
    deal.stage = body.stage
    await db.commit()
    await db.refresh(deal)
    return APIResponse(data={"id": deal.id, "stage": deal.stage, "updatedAt": deal.updated_at.isoformat() if deal.updated_at else None})
