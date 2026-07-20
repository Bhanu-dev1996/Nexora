from sqlalchemy import JSON, Column, DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import relationship

from app.database import Base
from app.models.base import gen_uuid, utcnow


class Company(Base):
    __tablename__ = "companies"
    __table_args__ = (
        Index("ix_companies_organization_id", "organization_id"),
        Index("ix_companies_organization_name", "organization_id", "name"),
    )

    id = Column(String(36), primary_key=True, default=gen_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)
    sub_industry = Column(String(100), nullable=True)
    size = Column(String(50), nullable=True)
    revenue = Column(Numeric(15, 2), nullable=True)
    founded_year = Column(String(4), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    website = Column(Text, nullable=True)
    logo_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    ticker_symbol = Column(String(10), nullable=True)
    parent_company_id = Column(String(36), nullable=True)
    owner_user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    billing_address_line1 = Column(String(255), nullable=True)
    billing_city = Column(String(100), nullable=True)
    billing_state = Column(String(100), nullable=True)
    billing_postal_code = Column(String(20), nullable=True)
    billing_country = Column(String(100), nullable=True)
    shipping_address_line1 = Column(String(255), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_state = Column(String(100), nullable=True)
    shipping_postal_code = Column(String(20), nullable=True)
    shipping_country = Column(String(100), nullable=True)
    custom_fields = Column(JSON, nullable=False, default=dict)
    created_by = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="companies")
    owner = relationship("User", foreign_keys=[owner_user_id], back_populates="owned_companies")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_companies")
    contacts = relationship("Contact", back_populates="company")
    deals = relationship("Deal", back_populates="company")
