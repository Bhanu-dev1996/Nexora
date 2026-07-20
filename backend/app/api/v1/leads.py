from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission
from app.core.errors import AppError
from app.database import get_db
from app.models.lead import Lead
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.lead import AssignLeadRequest, CreateLeadRequest, UpdateLeadRequest
from app.utils.helpers import parse_pagination

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/")
async def list_leads(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("leads.read"))):
    q = dict(request.query_params)
    pg = parse_pagination(q)
    org_id = request.state.organization_id

    where = [Lead.organization_id == org_id, Lead.deleted_at == None]
    if q.get("status"):
        where.append(Lead.status == q["status"])
    if q.get("source"):
        where.append(Lead.source == q["source"])
    if q.get("assignedTo"):
        where.append(Lead.owner_user_id == q["assignedTo"])

    stmt = select(Lead).where(*where).offset(pg["skip"]).limit(pg["limit"]).order_by(Lead.created_at.desc())
    result = await db.execute(stmt)
    leads = result.scalars().all()

    count_stmt = select(func.count()).select_from(Lead).where(*where)
    total = (await db.execute(count_stmt)).scalar() or 0

    mapped = []
    for l in leads:
        owner = None
        if l.owner_user_id:
            ur = await db.execute(select(User).where(User.id == l.owner_user_id))
            u = ur.scalars().first()
            if u:
                owner = {"id": u.id, "name": f"{u.first_name} {u.last_name}"}
        mapped.append({
            "id": l.id, "firstName": l.first_name, "lastName": l.last_name, "email": l.email,
            "phone": l.phone, "companyName": l.company_name, "jobTitle": l.job_title,
            "source": l.source, "status": l.status, "score": l.score, "owner": owner,
            "createdAt": l.created_at.isoformat(), "updatedAt": l.updated_at.isoformat() if l.updated_at else None,
        })

    return APIResponse(data=mapped, meta={"page": pg["page"], "limit": pg["limit"], "total": total, "totalPages": (total + pg["limit"] - 1) // pg["limit"]})


@router.get("/{lead_id}")
async def get_lead(lead_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("leads.read"))):
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.organization_id == request.state.organization_id, Lead.deleted_at == None))
    lead = result.scalars().first()
    if not lead:
        raise AppError.not_found("Lead not found")

    owner = None
    if lead.owner_user_id:
        ur = await db.execute(select(User).where(User.id == lead.owner_user_id))
        u = ur.scalars().first()
        if u:
            owner = {"id": u.id, "name": f"{u.first_name} {u.last_name}", "email": u.email}

    return APIResponse(data={
        "id": lead.id, "firstName": lead.first_name, "lastName": lead.last_name, "email": lead.email,
        "phone": lead.phone, "companyName": lead.company_name, "jobTitle": lead.job_title,
        "website": lead.website, "industry": lead.industry, "source": lead.source, "status": lead.status,
        "score": lead.score, "budget": float(lead.budget) if lead.budget else None,
        "expectedRevenue": float(lead.expected_revenue) if lead.expected_revenue else None,
        "owner": owner,
        "address": {"line1": lead.address_line1, "line2": lead.address_line2, "city": lead.city, "state": lead.state, "postalCode": lead.postal_code, "country": lead.country},
        "customFields": lead.custom_fields, "createdAt": lead.created_at.isoformat(),
        "updatedAt": lead.updated_at.isoformat() if lead.updated_at else None,
    })


@router.post("/")
async def create_lead(body: CreateLeadRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("leads.create"))):
    lead = Lead(
        organization_id=request.state.organization_id,
        first_name=body.firstName, last_name=body.lastName, email=body.email, phone=body.phone,
        company_name=body.companyName, job_title=body.jobTitle, website=body.website,
        industry=body.industry, source=body.source, status=body.status or "new",
        owner_user_id=body.ownerUserId, budget=body.budget, expected_revenue=body.expectedRevenue,
        address_line1=body.addressLine1, city=body.city, state=body.state, postal_code=body.postalCode,
        country=body.country, custom_fields=body.customFields or {},
        created_by=request.state.user["sub"],
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return APIResponse(data={"id": lead.id, "firstName": lead.first_name, "lastName": lead.last_name, "status": lead.status, "createdAt": lead.created_at.isoformat()})


@router.put("/{lead_id}")
async def update_lead(lead_id: str, body: UpdateLeadRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("leads.update"))):
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.organization_id == request.state.organization_id, Lead.deleted_at == None))
    lead = result.scalars().first()
    if not lead:
        raise AppError.not_found("Lead not found")

    updates = body.model_dump(exclude_unset=True)
    field_map = {"firstName": "first_name", "lastName": "last_name", "companyName": "company_name", "jobTitle": "job_title", "ownerUserId": "owner_user_id", "expectedRevenue": "expected_revenue", "customFields": "custom_fields"}
    for key, val in updates.items():
        setattr(lead, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(lead)
    return APIResponse(data={"id": lead.id, "firstName": lead.first_name, "lastName": lead.last_name, "status": lead.status, "updatedAt": lead.updated_at.isoformat() if lead.updated_at else None})


@router.delete("/{lead_id}")
async def delete_lead(lead_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("leads.delete"))):
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.organization_id == request.state.organization_id, Lead.deleted_at == None))
    lead = result.scalars().first()
    if not lead:
        raise AppError.not_found("Lead not found")
    lead.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return APIResponse(data={"message": "Lead deleted successfully"})


@router.post("/{lead_id}/assign")
async def assign_lead(lead_id: str, body: AssignLeadRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("leads.assign"))):
    result = await db.execute(select(Lead).where(Lead.id == lead_id, Lead.organization_id == request.state.organization_id, Lead.deleted_at == None))
    lead = result.scalars().first()
    if not lead:
        raise AppError.not_found("Lead not found")

    lead.owner_user_id = body.ownerUserId
    lead.assigned_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(lead)

    owner = None
    if lead.owner_user_id:
        ur = await db.execute(select(User).where(User.id == lead.owner_user_id))
        u = ur.scalars().first()
        if u:
            owner = {"id": u.id, "name": f"{u.first_name} {u.last_name}"}

    return APIResponse(data={"id": lead.id, "owner": owner})
