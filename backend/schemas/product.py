from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    compare_price: float | None = None
    category: str
    brand: str
    stock: int = 0
    sku: str
    is_featured: bool = False
    is_active: bool = True


class ProductCreate(ProductBase):
    image_url: str = ""
    images: list[str] = []
    category_id: UUID | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    compare_price: float | None = None
    category: str | None = None
    brand: str | None = None
    stock: int | None = None
    sku: str | None = None
    image_url: str | None = None
    images: list[str] | None = None
    is_featured: bool | None = None
    is_active: bool | None = None
    category_id: UUID | None = None


class ProductResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: str
    price: float
    compare_price: float | None = None
    category: str
    brand: str
    image_url: str
    images: list[str] | None = None
    stock: int
    sku: str
    is_featured: bool
    is_active: bool
    rating: float
    review_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int
    page: int
    pages: int
