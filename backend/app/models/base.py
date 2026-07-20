import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    organization_admin = "organization_admin"
    sales_manager = "sales_manager"
    sales_executive = "sales_executive"
    marketing_manager = "marketing_manager"
    support_agent = "support_agent"
    hr = "hr"
    finance = "finance"
    viewer = "viewer"


class LeadStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    unqualified = "unqualified"
    converted = "converted"
    lost = "lost"


class TaskStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class TaskPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"


class DealStatus(str, enum.Enum):
    open = "open"
    won = "won"
    lost = "lost"
    abandoned = "abandoned"


def utcnow():
    return datetime.now(timezone.utc)


def gen_uuid():
    return str(uuid.uuid4())
