from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission
from app.core.errors import AppError
from app.database import get_db
from app.models.company import Company
from app.models.contact import Contact
from app.models.deal import Deal
from app.schemas.common import APIResponse
from app.schemas.company import CreateCompanyRequest, UpdateCompanyRequest
from app.utils.helpers import parse_pagination

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/")
async def list_companies(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("companies.read"))):
    q = dict(request.query_params)
    pg = parse_pagination(q)
    org_id = request.state.organization_id

    where = [Company.organization_id == org_id, Company.deleted_at == None]
    if q.get("industry"):
        where.append(Company.industry == q["industry"])

    stmt = select(Company).where(*where).offset(pg["skip"]).limit(pg["limit"]).order_by(Company.created_at.desc())
    result = await db.execute(stmt)
    companies = result.scalars().all()

    count_stmt = select(func.count()).select_from(Company).where(*where)
    total = (await db.execute(count_stmt)).scalar() or 0

    mapped = []
    for c in companies:
        contact_count = (await db.execute(select(func.count()).select_from(Contact).where(Contact.company_id == c.id))).scalar() or 0
        deal_count = (await db.execute(select(func.count()).select_from(Deal).where(Deal.company_id == c.id))).scalar() or 0
        mapped.append({
            "id": c.id, "name": c.name, "domain": c.domain, "industry": c.industry,
            "size": c.size, "revenue": float(c.revenue) if c.revenue else None,
            "logoUrl": c.logo_url, "contactCount": contact_count, "dealCount": deal_count,
            "createdAt": c.created_at.isoformat(),
        })

    return APIResponse(data=mapped, meta={"page": pg["page"], "limit": pg["limit"], "total": total, "totalPages": (total + pg["limit"] - 1) // pg["limit"]})


@router.get("/{company_id}")
async def get_company(company_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("companies.read"))):
    result = await db.execute(select(Company).where(Company.id == company_id, Company.organization_id == request.state.organization_id, Company.deleted_at == None))
    company = result.scalars().first()
    if not company:
        raise AppError.not_found("Company not found")

    return APIResponse(data={
        "id": company.id, "name": company.name, "domain": company.domain,
        "industry": company.industry, "size": company.size,
        "revenue": float(company.revenue) if company.revenue else None,
        "foundedYear": company.founded_year, "phone": company.phone,
        "email": company.email, "website": company.website, "logoUrl": company.logo_url,
        "description": company.description,
        "billingAddress": {"line1": company.billing_address_line1, "city": company.billing_city, "state": company.billing_state, "postalCode": company.billing_postal_code, "country": company.billing_country},
        "shippingAddress": {"line1": company.shipping_address_line1, "city": company.shipping_city, "state": company.shipping_state, "postalCode": company.shipping_postal_code, "country": company.shipping_country},
        "contacts": [], "deals": [],
        "customFields": company.custom_fields,
        "createdAt": company.created_at.isoformat(), "updatedAt": company.updated_at.isoformat() if company.updated_at else None,
    })


@router.post("/")
async def create_company(body: CreateCompanyRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("companies.create"))):
    company = Company(
        organization_id=request.state.organization_id,
        name=body.name, domain=body.domain, industry=body.industry, size=body.size,
        revenue=body.revenue, founded_year=body.foundedYear, phone=body.phone,
        email=body.email, website=body.website, logo_url=body.logoUrl,
        description=body.description, owner_user_id=body.ownerUserId or request.state.user["sub"],
        custom_fields=body.customFields or {}, created_by=request.state.user["sub"],
    )
    db.add(company)
    await db.commit()
    await db.refresh(company)
    return APIResponse(data={"id": company.id, "name": company.name, "createdAt": company.created_at.isoformat()})


@router.put("/{company_id}")
async def update_company(company_id: str, body: UpdateCompanyRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("companies.update"))):
    result = await db.execute(select(Company).where(Company.id == company_id, Company.organization_id == request.state.organization_id, Company.deleted_at == None))
    company = result.scalars().first()
    if not company:
        raise AppError.not_found("Company not found")

    updates = body.model_dump(exclude_unset=True)
    field_map = {"customFields": "custom_fields"}
    for key, val in updates.items():
        setattr(company, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(company)
    return APIResponse(data={"id": company.id, "name": company.name, "updatedAt": company.updated_at.isoformat() if company.updated_at else None})


@router.delete("/{company_id}")
async def delete_company(company_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("companies.delete"))):
    result = await db.execute(select(Company).where(Company.id == company_id, Company.organization_id == request.state.organization_id, Company.deleted_at == None))
    company = result.scalars().first()
    if not company:
        raise AppError.not_found("Company not found")
    company.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return APIResponse(data={"message": "Company deleted successfully"})
