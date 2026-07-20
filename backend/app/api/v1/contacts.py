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
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.contact import CreateContactRequest, UpdateContactRequest
from app.utils.helpers import parse_pagination

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.get("/")
async def list_contacts(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("contacts.read"))):
    q = dict(request.query_params)
    pg = parse_pagination(q)
    org_id = request.state.organization_id

    where = [Contact.organization_id == org_id, Contact.deleted_at == None]
    if q.get("company"):
        where.append(Contact.company_id == q["company"])

    stmt = select(Contact).where(*where).offset(pg["skip"]).limit(pg["limit"]).order_by(Contact.created_at.desc())
    result = await db.execute(stmt)
    contacts = result.scalars().all()

    count_stmt = select(func.count()).select_from(Contact).where(*where)
    total = (await db.execute(count_stmt)).scalar() or 0

    mapped = []
    for c in contacts:
        owner = None
        if c.owner_user_id:
            ur = await db.execute(select(User).where(User.id == c.owner_user_id))
            u = ur.scalars().first()
            if u:
                owner = {"id": u.id, "name": f"{u.first_name} {u.last_name}"}
        company_name = None
        if c.company_id:
            cr = await db.execute(select(Company.name).where(Company.id == c.company_id))
            company_name = cr.scalar()
        deal_count_stmt = select(func.count()).select_from(Deal).where(Deal.contact_id == c.id)
        deal_count = (await db.execute(deal_count_stmt)).scalar() or 0
        mapped.append({
            "id": c.id, "firstName": c.first_name, "lastName": c.last_name, "email": c.email,
            "phone": c.phone, "jobTitle": c.job_title, "companyId": c.company_id,
            "companyName": company_name, "owner": owner, "tags": c.tags or [],
            "dealCount": deal_count, "createdAt": c.created_at.isoformat(),
        })

    return APIResponse(data=mapped, meta={"page": pg["page"], "limit": pg["limit"], "total": total, "totalPages": (total + pg["limit"] - 1) // pg["limit"]})


@router.get("/{contact_id}")
async def get_contact(contact_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("contacts.read"))):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.organization_id == request.state.organization_id, Contact.deleted_at == None))
    contact = result.scalars().first()
    if not contact:
        raise AppError.not_found("Contact not found")

    owner = None
    if contact.owner_user_id:
        ur = await db.execute(select(User).where(User.id == contact.owner_user_id))
        u = ur.scalars().first()
        if u:
            owner = {"id": u.id, "name": f"{u.first_name} {u.last_name}", "email": u.email}

    company = None
    if contact.company_id:
        cr = await db.execute(select(Company).where(Company.id == contact.company_id))
        co = cr.scalars().first()
        if co:
            company = {"id": co.id, "name": co.name}

    return APIResponse(data={
        "id": contact.id, "firstName": contact.first_name, "lastName": contact.last_name,
        "email": contact.email, "phone": contact.phone, "mobile": contact.mobile,
        "jobTitle": contact.job_title, "department": contact.department,
        "company": company, "owner": owner, "birthday": contact.birthday.isoformat() if contact.birthday else None,
        "language": contact.language,
        "address": {"line1": contact.address_line1, "line2": contact.address_line2, "city": contact.city, "state": contact.state, "postalCode": contact.postal_code, "country": contact.country},
        "linkedinUrl": contact.linkedin_url, "tags": contact.tags or [],
        "customFields": contact.custom_fields,
        "createdAt": contact.created_at.isoformat(), "updatedAt": contact.updated_at.isoformat() if contact.updated_at else None,
    })


@router.post("/")
async def create_contact(body: CreateContactRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("contacts.create"))):
    contact = Contact(
        organization_id=request.state.organization_id,
        first_name=body.firstName, last_name=body.lastName, email=body.email, phone=body.phone,
        mobile=body.mobile, job_title=body.jobTitle, department=body.department,
        company_id=body.companyId, owner_user_id=body.ownerUserId or request.state.user["sub"],
        language=body.language, address_line1=body.addressLine1, city=body.city,
        state=body.state, postal_code=body.postalCode, country=body.country,
        linkedin_url=body.linkedinUrl, tags=body.tags or [],
        custom_fields=body.customFields or {}, created_by=request.state.user["sub"],
    )
    db.add(contact)
    await db.commit()
    await db.refresh(contact)
    return APIResponse(data={"id": contact.id, "firstName": contact.first_name, "lastName": contact.last_name, "createdAt": contact.created_at.isoformat()})


@router.put("/{contact_id}")
async def update_contact(contact_id: str, body: UpdateContactRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("contacts.update"))):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.organization_id == request.state.organization_id, Contact.deleted_at == None))
    contact = result.scalars().first()
    if not contact:
        raise AppError.not_found("Contact not found")

    updates = body.model_dump(exclude_unset=True)
    field_map = {"firstName": "first_name", "lastName": "last_name", "jobTitle": "job_title", "companyId": "company_id", "customFields": "custom_fields"}
    for key, val in updates.items():
        setattr(contact, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(contact)
    return APIResponse(data={"id": contact.id, "firstName": contact.first_name, "lastName": contact.last_name, "updatedAt": contact.updated_at.isoformat() if contact.updated_at else None})


@router.delete("/{contact_id}")
async def delete_contact(contact_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("contacts.delete"))):
    result = await db.execute(select(Contact).where(Contact.id == contact_id, Contact.organization_id == request.state.organization_id, Contact.deleted_at == None))
    contact = result.scalars().first()
    if not contact:
        raise AppError.not_found("Contact not found")
    contact.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return APIResponse(data={"message": "Contact deleted successfully"})
