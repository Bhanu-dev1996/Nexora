from sqlalchemy import JSON, Column, DateTime, ForeignKey, Index, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import gen_uuid, utcnow


class Contact(Base):
    __tablename__ = "contacts"
    __table_args__ = (
        Index("ix_contacts_organization_id", "organization_id"),
        Index("ix_contacts_organization_company", "organization_id", "company_id"),
        Index("ix_contacts_organization_owner", "organization_id", "owner_user_id"),
    )

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    mobile = Column(String(20), nullable=True)
    job_title = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    owner_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    lead_id = Column(String(36), nullable=True)
    birthday = Column(DateTime(timezone=True), nullable=True)
    gender = Column(String(20), nullable=True)
    language = Column(String(10), nullable=True, default="en")
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    linkedin_url = Column(Text, nullable=True)
    twitter_url = Column(Text, nullable=True)
    facebook_url = Column(Text, nullable=True)
    custom_fields = Column(JSON, nullable=False, default=dict)
    tags = Column(JSON, nullable=False, default=list)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="contacts")
    company = relationship("Company", back_populates="contacts")
    owner = relationship("User", foreign_keys=[owner_user_id], back_populates="owned_contacts")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_contacts")
    deals = relationship("Deal", back_populates="contact")
