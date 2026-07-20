from typing import Any, List, Optional

from pydantic import BaseModel


class CreateTaskRequest(BaseModel):
    title: str
    description: Optional[str] = None
    status: Optional[str] = "pending"
    priority: Optional[str] = "medium"
    type: Optional[str] = None
    dueDate: Optional[str] = None
    assignedTo: Optional[str] = None
    contactId: Optional[str] = None
    leadId: Optional[str] = None
    dealId: Optional[str] = None
    companyId: Optional[str] = None
    estimatedHours: Optional[float] = None
    tags: Optional[List[str]] = None
    customFields: Optional[dict] = None


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    dueDate: Optional[str] = None
    assignedTo: Optional[str] = None
    tags: Optional[List[str]] = None
    customFields: Optional[dict] = None


class TaskResponse(BaseModel):
    id: str
    title: str
    status: str
    priority: str
    type: Optional[str] = None
    dueDate: Optional[Any] = None
    completedAt: Optional[Any] = None
    assignee: Optional[dict] = None
    tags: Optional[list] = []
    createdAt: Any
