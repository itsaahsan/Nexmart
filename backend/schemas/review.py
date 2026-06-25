from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    product_id: UUID
    rating: int = Field(..., ge=1, le=5)
    title: str
    body: str


class ReviewResponse(BaseModel):
    id: UUID
    product_id: UUID
    user_id: UUID
    rating: int
    title: str
    body: str
    user_name: str = ""
    created_at: datetime

    class Config:
        from_attributes = True
