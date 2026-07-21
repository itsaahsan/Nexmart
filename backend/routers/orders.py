import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.cart import CartItem
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from schemas.order import OrderListResponse, OrderResponse, OrderStatusUpdate
from utils.auth import get_current_user, get_current_admin
from utils.stripe_utils import create_payment_intent

router = APIRouter()


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    status_filter: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).where(Order.user_id == current_user.id)
    count_query = select(func.count(Order.id)).where(Order.user_id == current_user.id)

    if status_filter:
        query = query.where(Order.status == status_filter)
        count_query = count_query.where(Order.status == status_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    pages = math.ceil(total / limit) if total > 0 else 1

    query = query.options(selectinload(Order.items)).order_by(Order.created_at.desc())
    query = query.offset((page - 1) * limit).limit(limit)

    result = await db.execute(query)
    orders = result.scalars().unique().all()

    order_responses = []
    for order in orders:
        items = []
        for item in order.items:
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()
            items.append({
                "id": item.id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase,
                "product_name": product.name if product else "",
                "product_image": product.image_url if product else "",
            })
        order_responses.append(
            OrderResponse(
                id=order.id,
                total_amount=order.total_amount,
                subtotal=order.subtotal,
                shipping=order.shipping,
                tax=order.tax,
                status=order.status,
                stripe_payment_id=order.stripe_payment_id,
                shipping_address=order.shipping_address,
                items=items,
                created_at=order.created_at,
            )
        )

    return OrderListResponse(orders=order_responses, total=total, page=page, pages=pages)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        oid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID")

    result = await db.execute(
        select(Order)
        .where(Order.id == oid, Order.user_id == current_user.id)
        .options(selectinload(Order.items))
    )
    order = result.scalars().unique().one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = []
    for item in order.items:
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        items.append({
            "id": item.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "price_at_purchase": item.price_at_purchase,
            "product_name": product.name if product else "",
            "product_image": product.image_url if product else "",
        })

    return OrderResponse(
        id=order.id,
        total_amount=order.total_amount,
        subtotal=order.subtotal,
        shipping=order.shipping,
        tax=order.tax,
        status=order.status,
        stripe_payment_id=order.stripe_payment_id,
        shipping_address=order.shipping_address,
        items=items,
        created_at=order.created_at,
    )


class CartItemIn(BaseModel):
    product_id: str
    name: str
    price: float
    image_url: str
    quantity: int


class CreateOrderRequest(BaseModel):
    shipping_address: dict
    items: list[CartItemIn]


@router.post("/create-payment-intent")
async def create_payment(
    data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
):
    total = sum(item.price * item.quantity for item in data.items)
    return {"client_secret": "demo_secret_" + str(uuid.uuid4()), "amount": total}


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    product_ids = [uuid.UUID(item.product_id) for item in data.items]
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    existing_products = {str(p.id): p for p in result.scalars().all()}

    missing = [str(pid) for pid in product_ids if str(pid) not in existing_products]
    if missing:
        raise HTTPException(status_code=400, detail=f"Products not found: {', '.join(missing)}. Please refresh your cart.")

    subtotal = sum(item.price * item.quantity for item in data.items)
    shipping = 0.0
    tax = round(subtotal * 0.08, 2)
    total = round(subtotal + shipping + tax, 2)

    order = Order(
        user_id=current_user.id,
        total_amount=total,
        subtotal=subtotal,
        shipping=shipping,
        tax=tax,
        status="pending",
        stripe_payment_id="pi_demo_" + str(uuid.uuid4()),
        stripe_payment_status="succeeded",
        shipping_address=data.shipping_address,
    )
    db.add(order)
    await db.flush()

    for item in data.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=uuid.UUID(item.product_id),
            quantity=item.quantity,
            price_at_purchase=item.price,
        )
        db.add(order_item)

    # Clear cart from database
    cart_result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    for cart_item in cart_result.scalars().all():
        await db.delete(cart_item)
    await db.flush()

    return OrderResponse(
        id=order.id,
        total_amount=order.total_amount,
        subtotal=order.subtotal,
        shipping=order.shipping,
        tax=order.tax,
        status=order.status,
        stripe_payment_id=order.stripe_payment_id,
        shipping_address=order.shipping_address,
        items=[],
        created_at=order.created_at,
    )
