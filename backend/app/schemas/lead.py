from typing import Any, Optional

from pydantic import BaseModel


class CreateLeadRequest(BaseModel):
    firstName: str
    lastName: str
    email: Optional[str] = None
    phone: Optional[str] = None
    companyName: Optional[str] = None
    jobTitle: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = "new"
    ownerUserId: Optional[str] = None
    budget: Optional[float] = None
    expectedRevenue: Optional[float] = None
    addressLine1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    country: Optional[str] = None
    customFields: Optional[dict] = None


class UpdateLeadRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    companyName: Optional[str] = None
    jobTitle: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    ownerUserId: Optional[str] = None
    budget: Optional[float] = None
    expectedRevenue: Optional[float] = None
    customFields: Optional[dict] = None


class AssignLeadRequest(BaseModel):
    ownerUserId: str


class LeadResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: Optional[str] = None
    phone: Optional[str] = None
    companyName: Optional[str] = None
    jobTitle: Optional[str] = None
    source: Optional[str] = None
    status: str
    score: Optional[int] = 0
    owner: Optional[dict] = None
    createdAt: Any
    updatedAt: Optional[Any] = None
