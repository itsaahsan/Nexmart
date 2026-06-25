from uuid import UUID

from pydantic import BaseModel


class CartItemAdd(BaseModel):
    product_id: UUID
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    product_id: str
    name: str
    price: float
    image_url: str
    quantity: int
    stock: int


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total: float
    item_count: int


class WishlistResponse(BaseModel):
    id: UUID
    product_id: UUID
    created_at: str = ""

    class Config:
        from_attributes = True
