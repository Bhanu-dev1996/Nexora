from sqlalchemy import JSON, Column, DateTime, ForeignKey, Index, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import gen_uuid, utcnow


class Deal(Base):
    __tablename__ = "deals"
    __table_args__ = (
        Index("ix_deals_organization_id", "organization_id"),
        Index("ix_deals_organization_stage", "organization_id", "stage"),
        Index("ix_deals_organization_status", "organization_id", "status"),
        Index("ix_deals_organization_owner", "organization_id", "owner_user_id"),
    )

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    stage = Column(String(50), nullable=False, default="qualification")
    status = Column(String(30), nullable=False, default="open")
    amount = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(3), nullable=False, default="USD")
    probability = Column(Integer, nullable=False, default=0)
    expected_close_date = Column(DateTime(timezone=True), nullable=True)
    actual_close_date = Column(DateTime(timezone=True), nullable=True)
    contact_id = Column(String(36), ForeignKey("contacts.id", ondelete="SET NULL"), nullable=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    owner_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    team_id = Column(String(36), nullable=True)
    lead_id = Column(String(36), nullable=True)
    lost_reason = Column(Text, nullable=True)
    competitor_notes = Column(Text, nullable=True)
    custom_fields = Column(JSON, nullable=False, default=dict)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="deals")
    contact = relationship("Contact", back_populates="deals")
    company = relationship("Company", back_populates="deals")
    owner = relationship("User", foreign_keys=[owner_user_id], back_populates="assigned_deals")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_deals")
