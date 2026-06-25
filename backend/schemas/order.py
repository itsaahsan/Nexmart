from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    price_at_purchase: float
    product_name: str = ""
    product_image: str = ""

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: UUID
    total_amount: float
    subtotal: float
    shipping: float
    tax: float
    status: str
    stripe_payment_id: str | None = None
    shipping_address: dict | None = None
    items: list[OrderItemResponse] = []
    created_at: datetime

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
    total: int
    page: int
    pages: int


class OrderStatusUpdate(BaseModel):
    status: str
