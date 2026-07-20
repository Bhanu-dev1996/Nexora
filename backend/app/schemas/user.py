from typing import Any, List, Optional

from pydantic import BaseModel


class UserListResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    avatar: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    isActive: bool = True
    lastLoginAt: Optional[Any] = None
    createdAt: Any


class UserDetailResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    avatar: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    role: Optional[str] = None
    isActive: bool
    mfaEnabled: Optional[bool] = None
    lastLoginAt: Optional[Any] = None
    createdAt: Any
    updatedAt: Optional[Any] = None


class UpdateUserRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    jobTitle: Optional[str] = None
    avatarUrl: Optional[str] = None
    settings: Optional[dict] = None
