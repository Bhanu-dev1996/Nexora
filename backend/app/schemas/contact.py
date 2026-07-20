from typing import Any, List, Optional

from pydantic import BaseModel


class CreateContactRequest(BaseModel):
    firstName: str
    lastName: str
    email: Optional[str] = None
    phone: Optional[str] = None
    mobile: Optional[str] = None
    jobTitle: Optional[str] = None
    department: Optional[str] = None
    companyId: Optional[str] = None
    ownerUserId: Optional[str] = None
    language: Optional[str] = None
    addressLine1: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postalCode: Optional[str] = None
    country: Optional[str] = None
    linkedinUrl: Optional[str] = None
    tags: Optional[List[str]] = None
    customFields: Optional[dict] = None


class UpdateContactRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    companyId: Optional[str] = None
    tags: Optional[List[str]] = None
    customFields: Optional[dict] = None


class ContactResponse(BaseModel):
    id: str
    firstName: str
    lastName: str
    email: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    companyId: Optional[str] = None
    companyName: Optional[str] = None
    owner: Optional[dict] = None
    tags: Optional[list] = []
    dealCount: Optional[int] = 0
    createdAt: Any
