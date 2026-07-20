from typing import Any, Optional

from pydantic import BaseModel


class CreateCompanyRequest(BaseModel):
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    revenue: Optional[float] = None
    foundedYear: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logoUrl: Optional[str] = None
    description: Optional[str] = None
    ownerUserId: Optional[str] = None
    customFields: Optional[dict] = None


class UpdateCompanyRequest(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    revenue: Optional[float] = None
    website: Optional[str] = None
    description: Optional[str] = None
    customFields: Optional[dict] = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    revenue: Optional[float] = None
    logoUrl: Optional[str] = None
    contactCount: Optional[int] = 0
    dealCount: Optional[int] = 0
    createdAt: Any


class CompanyDetailResponse(BaseModel):
    id: str
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    revenue: Optional[float] = None
    foundedYear: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    logoUrl: Optional[str] = None
    description: Optional[str] = None
    billingAddress: Optional[dict] = None
    shippingAddress: Optional[dict] = None
    contacts: Optional[list] = []
    deals: Optional[list] = []
    customFields: Optional[dict] = None
    createdAt: Any
    updatedAt: Optional[Any] = None
