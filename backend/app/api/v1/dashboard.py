from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database import get_db
from app.core.redis import Cache
from app.models.lead import Lead
from app.models.contact import Contact
from app.models.company import Company
from app.models.deal import Deal
from app.models.task import Task
from app.schemas.common import APIResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _month_boundaries():
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)
    next_month_start = (month_start + timedelta(days=32)).replace(day=1)
    return now, month_start, prev_month_start, next_month_start


@router.get("/stats")
async def get_stats(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(get_current_user)):
    org_id = request.state.organization_id
    cache_key = f"dash:stats:{org_id}"

    cached = await Cache.get(cache_key)
    if cached:
        return APIResponse(data=cached)

    now, month_start, prev_month_start, next_month_start = _month_boundaries()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    fourteen_days_ago = now - timedelta(days=14)

    total_leads = (await db.execute(select(func.count()).select_from(Lead).where(Lead.organization_id == org_id, Lead.deleted_at == None))).scalar() or 0
    new_leads = (await db.execute(select(func.count()).select_from(Lead).where(Lead.organization_id == org_id, Lead.status == "new"))).scalar() or 0
    total_contacts = (await db.execute(select(func.count()).select_from(Contact).where(Contact.organization_id == org_id, Contact.deleted_at == None))).scalar() or 0
    total_companies = (await db.execute(select(func.count()).select_from(Company).where(Company.organization_id == org_id, Company.deleted_at == None))).scalar() or 0
    open_deals = (await db.execute(select(func.count()).select_from(Deal).where(Deal.organization_id == org_id, Deal.status == "open", Deal.deleted_at == None))).scalar() or 0
    won_deals = (await db.execute(select(func.count()).select_from(Deal).where(Deal.organization_id == org_id, Deal.status == "won", Deal.deleted_at == None))).scalar() or 0
    total_tasks = (await db.execute(select(func.count()).select_from(Task).where(Task.organization_id == org_id, Task.deleted_at == None))).scalar() or 0
    pending_tasks = (await db.execute(select(func.count()).select_from(Task).where(Task.organization_id == org_id, Task.status == "pending", Task.deleted_at == None))).scalar() or 0

    pipeline_value = (await db.execute(select(func.sum(Deal.amount)).where(Deal.organization_id == org_id, Deal.status == "open", Deal.deleted_at == None))).scalar() or 0
    revenue = (await db.execute(select(func.sum(Deal.amount)).where(Deal.organization_id == org_id, Deal.status == "won", Deal.deleted_at == None))).scalar() or 0

    revenue_this_month = (await db.execute(select(func.sum(Deal.amount)).where(Deal.organization_id == org_id, Deal.status == "won", Deal.deleted_at == None, Deal.actual_close_date >= month_start, Deal.actual_close_date < next_month_start))).scalar() or 0
    revenue_last_month = (await db.execute(select(func.sum(Deal.amount)).where(Deal.organization_id == org_id, Deal.status == "won", Deal.deleted_at == None, Deal.actual_close_date >= prev_month_start, Deal.actual_close_date < month_start))).scalar() or 0

    new_contacts_this_month = (await db.execute(select(func.count()).select_from(Contact).where(Contact.organization_id == org_id, Contact.deleted_at == None, Contact.created_at >= month_start))).scalar() or 0
    leads_today = (await db.execute(select(func.count()).select_from(Lead).where(Lead.organization_id == org_id, Lead.created_at >= today_start))).scalar() or 0
    open_leads_count = (await db.execute(select(func.count()).select_from(Lead).where(Lead.organization_id == org_id, Lead.deleted_at == None, ~Lead.status.in_(["lost", "converted"])))).scalar() or 0

    tasks_due_today = (await db.execute(select(func.count()).select_from(Task).where(Task.organization_id == org_id, Task.deleted_at == None, Task.status != "completed", Task.due_date >= today_start, Task.due_date < today_start + timedelta(days=1)))).scalar() or 0
    tasks_overdue = (await db.execute(select(func.count()).select_from(Task).where(Task.organization_id == org_id, Task.deleted_at == None, Task.status != "completed", Task.due_date < today_start))).scalar() or 0

    leads_by_status = await db.execute(select(Lead.status, func.count(Lead.id)).where(Lead.organization_id == org_id, Lead.deleted_at == None).group_by(Lead.status))
    leads_by_status_list = [{"status": r[0], "count": r[1]} for r in leads_by_status.all()]

    deals_by_stage = await db.execute(select(Deal.stage, func.count(Deal.id), func.sum(Deal.amount)).where(Deal.organization_id == org_id, Deal.status == "open", Deal.deleted_at == None).group_by(Deal.stage))
    deals_by_stage_list = [{"stage": r[0], "count": r[1], "totalAmount": float(r[2] or 0)} for r in deals_by_stage.all()]

    daily_leads_raw = await db.execute(
        select(func.date(Lead.created_at), func.count(Lead.id))
        .where(Lead.organization_id == org_id, Lead.deleted_at == None, Lead.created_at >= fourteen_days_ago)
        .group_by(func.date(Lead.created_at))
        .order_by(func.date(Lead.created_at))
    )
    daily_leads = [{"date": str(r[0]), "count": r[1]} for r in daily_leads_raw.all()]

    daily_revenue_raw = await db.execute(
        select(func.date(Deal.actual_close_date), func.sum(Deal.amount))
        .where(Deal.organization_id == org_id, Deal.status == "won", Deal.deleted_at == None, Deal.actual_close_date >= fourteen_days_ago)
        .group_by(func.date(Deal.actual_close_date))
        .order_by(func.date(Deal.actual_close_date))
    )
    daily_revenue = [{"date": str(r[0]), "amount": float(r[1])} for r in daily_revenue_raw.all()]

    recent_leads = await db.execute(select(Lead).where(Lead.organization_id == org_id, Lead.deleted_at == None).order_by(Lead.created_at.desc()).limit(5))
    recent_leads_list = [{"id": l.id, "firstName": l.first_name, "lastName": l.last_name, "status": l.status, "score": l.score, "createdAt": l.created_at.isoformat()} for l in recent_leads.scalars().all()]

    recent_deals = await db.execute(select(Deal).where(Deal.organization_id == org_id, Deal.deleted_at == None).order_by(Deal.created_at.desc()).limit(5))
    recent_deals_list = [{"id": d.id, "title": d.title, "amount": float(d.amount) if d.amount else None, "stage": d.stage, "status": d.status, "createdAt": d.created_at.isoformat()} for d in recent_deals.scalars().all()]

    recent_contacts = await db.execute(select(Contact).where(Contact.organization_id == org_id, Contact.deleted_at == None).order_by(Contact.created_at.desc()).limit(5))
    recent_contacts_list = [{"id": c.id, "firstName": c.first_name, "lastName": c.last_name, "email": c.email, "createdAt": c.created_at.isoformat()} for c in recent_contacts.scalars().all()]

    recent_tasks = await db.execute(select(Task).where(Task.organization_id == org_id, Task.deleted_at == None).order_by(Task.created_at.desc()).limit(5))
    recent_tasks_list = [{"id": t.id, "title": t.title, "status": t.status, "priority": t.priority, "createdAt": t.created_at.isoformat()} for t in recent_tasks.scalars().all()]

    response_data = {
        "overview": {
            "totalLeads": total_leads, "newLeads": new_leads, "totalContacts": total_contacts,
            "totalCompanies": total_companies, "openDeals": open_deals, "wonDeals": won_deals,
            "totalPipelineValue": float(pipeline_value), "averageDealValue": float(pipeline_value / open_deals) if open_deals else 0,
            "totalRevenue": float(revenue), "totalTasks": total_tasks, "pendingTasks": pending_tasks,
            "revenueThisMonth": float(revenue_this_month), "revenueLastMonth": float(revenue_last_month),
            "revenueGrowth": float(((revenue_this_month - revenue_last_month) / revenue_last_month * 100)) if revenue_last_month else 0,
            "newContactsThisMonth": new_contacts_this_month,
            "leadsToday": leads_today, "openLeadsCount": open_leads_count,
            "tasksDueToday": tasks_due_today, "tasksOverdue": tasks_overdue,
        },
        "leadsByStatus": leads_by_status_list,
        "dealsByStage": deals_by_stage_list,
        "dailyLeads": daily_leads,
        "dailyRevenue": daily_revenue,
        "recentLeads": recent_leads_list,
        "recentDeals": recent_deals_list,
        "recentContacts": recent_contacts_list,
        "recentTasks": recent_tasks_list,
    }

    await Cache.set(cache_key, response_data, ttl=120)

    return APIResponse(data=response_data)


@router.get("/recent")
async def get_recent(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(get_current_user)):
    org_id = request.state.organization_id

    recent_leads = (await db.execute(select(Lead).where(Lead.organization_id == org_id, Lead.deleted_at == None).order_by(Lead.created_at.desc()).limit(5))).scalars().all()
    recent_deals = (await db.execute(select(Deal).where(Deal.organization_id == org_id, Deal.deleted_at == None).order_by(Deal.created_at.desc()).limit(5))).scalars().all()
    recent_contacts = (await db.execute(select(Contact).where(Contact.organization_id == org_id, Contact.deleted_at == None).order_by(Contact.created_at.desc()).limit(5))).scalars().all()
    recent_tasks = (await db.execute(select(Task).where(Task.organization_id == org_id, Task.deleted_at == None).order_by(Task.created_at.desc()).limit(5))).scalars().all()

    return APIResponse(data={
        "recentLeads": [{"id": l.id, "firstName": l.first_name, "lastName": l.last_name, "status": l.status, "score": l.score, "createdAt": l.created_at.isoformat()} for l in recent_leads],
        "recentDeals": [{"id": d.id, "title": d.title, "amount": float(d.amount) if d.amount else None, "stage": d.stage, "status": d.status, "createdAt": d.created_at.isoformat()} for d in recent_deals],
        "recentContacts": [{"id": c.id, "firstName": c.first_name, "lastName": c.last_name, "email": c.email, "createdAt": c.created_at.isoformat()} for c in recent_contacts],
        "recentTasks": [{"id": t.id, "title": t.title, "status": t.status, "priority": t.priority, "createdAt": t.created_at.isoformat()} for t in recent_tasks],
    })
