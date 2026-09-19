import math
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models.cart import CartItem
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from redis_client import cache_delete
from schemas.order import OrderListResponse, OrderResponse, OrderStatusUpdate
from settings import settings
from utils.auth import get_current_user, get_current_admin
from utils.stripe_utils import (
    amount_to_cents,
    construct_webhook_event,
    create_payment_intent,
    is_stripe_configured,
    retrieve_payment_intent,
)

router = APIRouter()


@router.get("/config")
async def stripe_config():
    return {
        "publishable_key": settings.STRIPE_PUBLISHABLE_KEY,
        "currency": (settings.STRIPE_CURRENCY or "usd").lower(),
        "demo_mode": not is_stripe_configured(),
    }


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
                stripe_payment_status=order.stripe_payment_status,
                shipping_address=order.shipping_address,
                items=items,
                created_at=order.created_at,
            )
        )

    return OrderListResponse(orders=order_responses, total=total, page=page, pages=pages)


def _order_to_response(order: Order, items: list) -> OrderResponse:
    return OrderResponse(
        id=order.id,
        total_amount=order.total_amount,
        subtotal=order.subtotal,
        shipping=order.shipping,
        tax=order.tax,
        status=order.status,
        stripe_payment_id=order.stripe_payment_id,
        stripe_payment_status=order.stripe_payment_status,
        shipping_address=order.shipping_address,
        items=items,
        created_at=order.created_at,
    )


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
        stripe_payment_status=order.stripe_payment_status,
        shipping_address=order.shipping_address,
        items=items,
        created_at=order.created_at,
    )


async def _compute_totals(items: list, db: AsyncSession):
    """Validate against DB prices (never trust client totals)."""
    if not items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    try:
        product_ids = [uuid.UUID(item.product_id) for item in items]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    existing = {str(p.id): p for p in result.scalars().all()}
    missing = [str(pid) for pid in product_ids if str(pid) not in existing]
    if missing:
        raise HTTPException(status_code=400, detail=f"Products not found: {', '.join(missing)}. Please refresh your cart.")
    subtotal = 0.0
    for item in items:
        product = existing[str(uuid.UUID(item.product_id))]
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        subtotal += float(product.price) * item.quantity
    subtotal = round(subtotal, 2)
    shipping = 0.0
    tax = round(subtotal * 0.08, 2)
    total = round(subtotal + shipping + tax, 2)
    return subtotal, shipping, tax, total, existing


class CartItemIn(BaseModel):
    product_id: str
    name: str
    price: float
    image_url: str
    quantity: int


class CreateOrderRequest(BaseModel):
    shipping_address: dict
    items: list[CartItemIn]
    payment_intent_id: str | None = None


@router.post("/create-payment-intent")
async def create_payment(
    data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    subtotal, _shipping, _tax, total, _products = await _compute_totals(data.items, db)
    amount_cents = amount_to_cents(total)

    if is_stripe_configured():
        try:
            intent = create_payment_intent(
                amount=amount_cents,
                metadata={"user_id": str(current_user.id), "item_count": str(len(data.items))},
                receipt_email=current_user.email,
                idempotency_key=f"{current_user.id}:{amount_cents}:{len(data.items)}",
            )
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "amount": total,
                "demo_mode": False,
            }
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Stripe error: {str(e)}")

    # Demo fallback (no Stripe keys): webhook still drives status updates.
    demo_pi = f"pi_demo_{uuid.uuid4()}"
    return {
        "client_secret": f"demo_secret_{uuid.uuid4()}",
        "payment_intent_id": demo_pi,
        "amount": total,
        "demo_mode": True,
    }


@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Stripe webhook: drives order status from payment events.

    Configure in Stripe Dashboard as:
      {FRONTEND_URL}/api/orders/webhook  (or backend URL + /api/orders/webhook)
    Events to send: payment_intent.succeeded, payment_intent.payment_failed,
    charge.refunded, checkout.session.completed
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    try:
        event = construct_webhook_event(payload, sig_header)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook signature: {str(e)}")

    if isinstance(event, dict):
        event_type = event.get("type", "")
        obj = (event.get("data") or {}).get("object", {}) if isinstance(event.get("data"), dict) else {}
    else:
        event_type = getattr(event, "type", "")
        obj = getattr(getattr(event, "data", None), "object", {}) or {}
        if not isinstance(obj, dict):
            obj = {"id": getattr(obj, "id", None), "metadata": getattr(obj, "metadata", {})}

    payment_intent_id = obj.get("id") if isinstance(obj, dict) else None
    if not payment_intent_id:
        return {"received": True, "ignored": "no payment id"}

    result = await db.execute(select(Order).where(Order.stripe_payment_id == payment_intent_id))
    order = result.scalars().one_or_none()
    if not order:
        return {"received": True, "ignored": f"unknown payment {payment_intent_id}"}

    if event_type in ("payment_intent.succeeded", "checkout.session.completed", "charge.succeeded"):
        order.status = "processing"
        order.stripe_payment_status = "succeeded"
    elif event_type in ("payment_intent.payment_failed", "charge.failed"):
        order.status = "cancelled"
        order.stripe_payment_status = "failed"
    elif event_type in ("charge.refunded", "refund.created", "refund.updated"):
        order.status = "cancelled"
        order.stripe_payment_status = "refunded"
    elif event_type == "payment_intent.canceled":
        order.status = "cancelled"
        order.stripe_payment_status = "canceled"
    else:
        return {"received": True, "ignored": f"unhandled {event_type}"}

    await db.flush()
    await cache_delete("admin:dashboard")
    return {"received": True, "order_id": str(order.id), "status": order.status}


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    subtotal, shipping, tax, total, existing_products = await _compute_totals(data.items, db)

    payment_intent_id = data.payment_intent_id or f"pi_demo_{uuid.uuid4()}"
    stripe_status = "requires_payment_method"
    order_status = "pending"

    if is_stripe_configured() and payment_intent_id.startswith("pi_") and not payment_intent_id.startswith("pi_demo_"):
        try:
            intent = retrieve_payment_intent(payment_intent_id)
            stripe_status = getattr(intent, "status", "requires_payment_method")
            expected = amount_to_cents(total)
            if getattr(intent, "amount", expected) != expected:
                raise HTTPException(status_code=400, detail="Payment amount mismatch. Please retry checkout.")
            if stripe_status == "succeeded":
                order_status = "processing"
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Stripe verification failed: {str(e)}")
    else:
        # Demo mode: mark paid; webhook can still transition pending -> processing.
        stripe_status = "succeeded"
        order_status = "processing"

    order = Order(
        user_id=current_user.id,
        total_amount=total,
        subtotal=subtotal,
        shipping=shipping,
        tax=tax,
        status=order_status,
        stripe_payment_id=payment_intent_id,
        stripe_payment_status=stripe_status,
        shipping_address=data.shipping_address,
    )
    db.add(order)
    await db.flush()

    for item in data.items:
        product = existing_products[str(uuid.UUID(item.product_id))]
        order_item = OrderItem(
            order_id=order.id,
            product_id=uuid.UUID(item.product_id),
            quantity=item.quantity,
            price_at_purchase=float(product.price),
        )
        db.add(order_item)

    # Clear cart from database
    cart_result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    for cart_item in cart_result.scalars().all():
        await db.delete(cart_item)
    await db.flush()

    return _order_to_response(order, [])
