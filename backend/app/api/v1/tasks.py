from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_permission
from app.core.errors import AppError
from app.database import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.task import CreateTaskRequest, UpdateTaskRequest
from app.utils.helpers import parse_pagination

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/")
async def list_tasks(request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("tasks.read"))):
    q = dict(request.query_params)
    pg = parse_pagination(q)
    org_id = request.state.organization_id

    where = [Task.organization_id == org_id, Task.deleted_at == None]
    if q.get("status"):
        where.append(Task.status == q["status"])
    if q.get("priority"):
        where.append(Task.priority == q["priority"])
    if q.get("assignedTo"):
        where.append(Task.assigned_to == q["assignedTo"])

    stmt = select(Task).where(*where).offset(pg["skip"]).limit(pg["limit"]).order_by(Task.due_date.asc().nullslast(), Task.created_at.desc())
    result = await db.execute(stmt)
    tasks = result.scalars().all()

    count_stmt = select(func.count()).select_from(Task).where(*where)
    total = (await db.execute(count_stmt)).scalar() or 0

    mapped = []
    for t in tasks:
        assignee = None
        if t.assigned_to:
            ur = await db.execute(select(User).where(User.id == t.assigned_to))
            u = ur.scalars().first()
            if u:
                assignee = {"id": u.id, "name": f"{u.first_name} {u.last_name}"}
        mapped.append({
            "id": t.id, "title": t.title, "status": t.status, "priority": t.priority,
            "type": t.type, "dueDate": t.due_date.isoformat() if t.due_date else None,
            "completedAt": t.completed_at.isoformat() if t.completed_at else None,
            "assignee": assignee, "tags": t.tags or [],
            "createdAt": t.created_at.isoformat(),
        })

    return APIResponse(data=mapped, meta={"page": pg["page"], "limit": pg["limit"], "total": total, "totalPages": (total + pg["limit"] - 1) // pg["limit"]})


@router.get("/{task_id}")
async def get_task(task_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("tasks.read"))):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.organization_id == request.state.organization_id, Task.deleted_at == None))
    task = result.scalars().first()
    if not task:
        raise AppError.not_found("Task not found")

    assignee = None
    if task.assigned_to:
        ur = await db.execute(select(User).where(User.id == task.assigned_to))
        u = ur.scalars().first()
        if u:
            assignee = {"id": u.id, "name": f"{u.first_name} {u.last_name}", "email": u.email}
    creator = None
    if task.created_by:
        cr = await db.execute(select(User).where(User.id == task.created_by))
        c = cr.scalars().first()
        if c:
            creator = {"id": c.id, "name": f"{c.first_name} {c.last_name}"}

    return APIResponse(data={
        "id": task.id, "title": task.title, "description": task.description,
        "status": task.status, "priority": task.priority, "type": task.type,
        "dueDate": task.due_date.isoformat() if task.due_date else None,
        "completedAt": task.completed_at.isoformat() if task.completed_at else None,
        "assignee": assignee, "creator": creator,
        "estimatedHours": float(task.estimated_hours) if task.estimated_hours else None,
        "actualHours": float(task.actual_hours) if task.actual_hours else None,
        "tags": task.tags or [], "customFields": task.custom_fields,
        "createdAt": task.created_at.isoformat(), "updatedAt": task.updated_at.isoformat() if task.updated_at else None,
    })


@router.post("/")
async def create_task(body: CreateTaskRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("tasks.create"))):
    task = Task(
        organization_id=request.state.organization_id,
        title=body.title, description=body.description, status=body.status or "pending",
        priority=body.priority or "medium", type=body.type,
        due_date=datetime.fromisoformat(body.dueDate) if body.dueDate else None,
        assigned_to=body.assignedTo, contact_id=body.contactId, lead_id=body.leadId,
        deal_id=body.dealId, company_id=body.companyId,
        estimated_hours=body.estimatedHours, tags=body.tags or [],
        custom_fields=body.customFields or {}, created_by=request.state.user["sub"],
        assigned_by=request.state.user["sub"],
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return APIResponse(data={"id": task.id, "title": task.title, "status": task.status, "priority": task.priority, "createdAt": task.created_at.isoformat()})


@router.put("/{task_id}")
async def update_task(task_id: str, body: UpdateTaskRequest, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("tasks.update"))):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.organization_id == request.state.organization_id, Task.deleted_at == None))
    task = result.scalars().first()
    if not task:
        raise AppError.not_found("Task not found")

    updates = body.model_dump(exclude_unset=True)
    field_map = {"assignedTo": "assigned_to", "customFields": "custom_fields", "dueDate": "due_date"}
    for key, val in updates.items():
        if key == "dueDate":
            task.due_date = datetime.fromisoformat(val) if val else None
        elif key == "status":
            task.status = val
            if val == "completed":
                task.completed_at = datetime.now(timezone.utc)
        else:
            setattr(task, field_map.get(key, key), val)

    await db.commit()
    await db.refresh(task)
    return APIResponse(data={"id": task.id, "title": task.title, "status": task.status, "priority": task.priority, "updatedAt": task.updated_at.isoformat() if task.updated_at else None})


@router.delete("/{task_id}")
async def remove_task(task_id: str, request: Request, db: AsyncSession = Depends(get_db), _perm=Depends(require_permission("tasks.delete"))):
    result = await db.execute(select(Task).where(Task.id == task_id, Task.organization_id == request.state.organization_id, Task.deleted_at == None))
    task = result.scalars().first()
    if not task:
        raise AppError.not_found("Task not found")
    task.deleted_at = datetime.now(timezone.utc)
    await db.commit()
    return APIResponse(data={"message": "Task deleted successfully"})
