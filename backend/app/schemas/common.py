from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel):
    success: bool = True
    data: Any = None
    meta: Optional[dict] = None


class PaginatedResponse(BaseModel):
    success: bool = True
    data: List[Any] = []
    meta: Optional[dict] = None


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    totalPages: int
