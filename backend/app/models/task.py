from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import gen_uuid, utcnow


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("ix_tasks_organization_id", "organization_id"),
        Index("ix_tasks_organization_status", "organization_id", "status"),
        Index("ix_tasks_organization_assigned", "organization_id", "assigned_to"),
    )

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(30), nullable=False, default="pending")
    priority = Column(String(20), nullable=False, default="medium")
    type = Column(String(50), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_by = Column(String(36), nullable=True)
    team_id = Column(String(36), nullable=True)
    contact_id = Column(String(36), nullable=True)
    lead_id = Column(String(36), nullable=True)
    deal_id = Column(String(36), nullable=True)
    company_id = Column(String(36), nullable=True)
    parent_task_id = Column(String(36), nullable=True)
    is_recurring = Column(Boolean, nullable=False, default=False)
    recurrence_rule = Column(String(255), nullable=True)
    estimated_hours = Column(Numeric(6, 2), nullable=True)
    actual_hours = Column(Numeric(6, 2), nullable=True)
    tags = Column(JSON, nullable=False, default=list)
    custom_fields = Column(JSON, nullable=False, default=dict)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_tasks")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_tasks")
