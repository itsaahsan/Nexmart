from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    description: str | None = None
    image_url: str | None = None
    parent_id: UUID | None = None


class CategoryCreate(CategoryBase):
    slug: str


class CategoryResponse(CategoryBase):
    id: UUID
    slug: str
    created_at: datetime

    class Config:
        from_attributes = True
