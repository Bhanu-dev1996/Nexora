from sqlalchemy import JSON, Boolean, Column, DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import gen_uuid, utcnow


class Lead(Base):
    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_leads_organization_id", "organization_id"),
        Index("ix_leads_organization_status", "organization_id", "status"),
        Index("ix_leads_organization_owner", "organization_id", "owner_user_id"),
    )

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    company_name = Column(String(255), nullable=True)
    job_title = Column(String(100), nullable=True)
    website = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    source = Column(String(50), nullable=True)
    status = Column(String(30), nullable=False, default="new")
    stage = Column(String(50), nullable=True)
    score = Column(JSON, nullable=False, default=0)
    score_updated_at = Column(DateTime(timezone=True), nullable=True)
    owner_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    team_id = Column(String(36), nullable=True)
    budget = Column(Numeric(12, 2), nullable=True)
    expected_revenue = Column(Numeric(12, 2), nullable=True)
    conversion_date = Column(DateTime(timezone=True), nullable=True)
    converted_contact_id = Column(String(36), nullable=True)
    converted_deal_id = Column(String(36), nullable=True)
    assigned_at = Column(DateTime(timezone=True), nullable=True)
    last_contacted_at = Column(DateTime(timezone=True), nullable=True)
    next_follow_up_at = Column(DateTime(timezone=True), nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    custom_fields = Column(JSON, nullable=False, default=dict)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="leads")
    owner = relationship("User", foreign_keys=[owner_user_id], back_populates="owned_leads")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_leads")
