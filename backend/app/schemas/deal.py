from typing import Any, Optional

from pydantic import BaseModel


class CreateDealRequest(BaseModel):
    title: str
    description: Optional[str] = None
    stage: Optional[str] = "qualification"
    status: Optional[str] = "open"
    amount: Optional[float] = None
    currency: Optional[str] = "USD"
    probability: Optional[int] = 0
    expectedCloseDate: Optional[str] = None
    contactId: Optional[str] = None
    companyId: Optional[str] = None
    ownerUserId: Optional[str] = None
    lostReason: Optional[str] = None
    customFields: Optional[dict] = None


class UpdateDealRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    stage: Optional[str] = None
    status: Optional[str] = None
    amount: Optional[float] = None
    probability: Optional[int] = None
    expectedCloseDate: Optional[str] = None
    contactId: Optional[str] = None
    companyId: Optional[str] = None
    ownerUserId: Optional[str] = None
    lostReason: Optional[str] = None
    customFields: Optional[dict] = None


class MoveStageRequest(BaseModel):
    stage: str


class DealResponse(BaseModel):
    id: str
    title: str
    amount: Optional[float] = None
    currency: str = "USD"
    stage: str
    status: str
    probability: Optional[int] = 0
    expectedCloseDate: Optional[Any] = None
    contact: Optional[dict] = None
    company: Optional[dict] = None
    owner: Optional[dict] = None
    createdAt: Any
    updatedAt: Optional[Any] = None


class DealDetailResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    stage: str
    status: str
    amount: Optional[float] = None
    currency: str = "USD"
    probability: Optional[int] = 0
    expectedCloseDate: Optional[Any] = None
    actualCloseDate: Optional[Any] = None
    lostReason: Optional[str] = None
    contact: Optional[dict] = None
    company: Optional[dict] = None
    owner: Optional[dict] = None
    customFields: Optional[dict] = None
    createdAt: Any
    updatedAt: Optional[Any] = None
