from sqlalchemy import JSON, Boolean, Column, DateTime, Index, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import gen_uuid, utcnow


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    avatar_url = Column(Text, nullable=True)
    phone = Column(String(20), nullable=True)
    job_title = Column(String(100), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    email_verified_at = Column(DateTime(timezone=True), nullable=True)
    mfa_enabled = Column(Boolean, nullable=False, default=False)
    mfa_secret = Column(String(255), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    last_login_ip = Column(String(45), nullable=True)
    password_changed_at = Column(DateTime(timezone=True), nullable=True)
    settings = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    organizations = relationship("UserOrganization", back_populates="user", cascade="all, delete-orphan")
    owned_leads = relationship("Lead", foreign_keys="Lead.owner_user_id", back_populates="owner")
    created_leads = relationship("Lead", foreign_keys="Lead.created_by", back_populates="creator")
    owned_contacts = relationship("Contact", foreign_keys="Contact.owner_user_id", back_populates="owner")
    created_contacts = relationship("Contact", foreign_keys="Contact.created_by", back_populates="creator")
    owned_companies = relationship("Company", foreign_keys="Company.owner_user_id", back_populates="owner")
    created_companies = relationship("Company", foreign_keys="Company.created_by", back_populates="creator")
    assigned_deals = relationship("Deal", foreign_keys="Deal.owner_user_id", back_populates="owner")
    created_deals = relationship("Deal", foreign_keys="Deal.created_by", back_populates="creator")
    assigned_tasks = relationship("Task", foreign_keys="Task.assigned_to", back_populates="assignee")
    created_tasks = relationship("Task", foreign_keys="Task.created_by", back_populates="creator")
    led_teams = relationship("Team", foreign_keys="Team.lead_user_id", back_populates="lead")
    team_memberships = relationship("TeamMember", back_populates="user")
    activities = relationship("Activity", back_populates="user")
    notifications = relationship("Notification", foreign_keys="Notification.user_id", back_populates="user")
    sent_notifications = relationship("Notification", foreign_keys="Notification.sender_id", back_populates="sender")
