import math
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.order import Order, OrderItem
from models.product import Product
from models.user import User
from redis_client import cache_delete, cache_get, cache_set
from schemas.order import OrderListResponse, OrderResponse, OrderStatusUpdate
from schemas.product import ProductListResponse, ProductResponse
from schemas.user import AdminUserUpdate, UserResponse
from utils.auth import get_current_admin

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text


@router.get("/dashboard")
async def dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    cached = await cache_get("admin:dashboard")
    if cached:
        return cached

    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_products = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    total_orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Order.total_amount), 0)))).scalar() or 0
    pending_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.status == "pending")
    )).scalar() or 0

    result = await db.execute(
        select(Order).order_by(Order.created_at.desc()).limit(5)
    )
    recent_orders = result.scalars().all()

    recent = []
    for order in recent_orders:
        user_result = await db.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one_or_none()
        recent.append({
            "id": str(order.id),
            "total": order.total_amount,
            "status": order.status,
            "user_name": user.full_name if user else "Unknown",
            "created_at": str(order.created_at),
        })

    top_products_result = await db.execute(
        select(Product).order_by(Product.review_count.desc()).limit(5)
    )
    top_products = top_products_result.scalars().all()

    top = [
        {
            "id": str(p.id),
            "name": p.name,
            "rating": p.rating,
            "review_count": p.review_count,
            "price": p.price,
        }
        for p in top_products
    ]

    # Extra analytics (SQLite + Postgres compatible: aggregate in Python/SQL basics)
    status_rows = (await db.execute(select(Order.status, func.count(Order.id)).group_by(Order.status))).all()
    orders_by_status = {status: count for status, count in status_rows}

    low_stock_rows = (await db.execute(
        select(Product).where(Product.stock <= 10).order_by(Product.stock.asc()).limit(10)
    )).scalars().all()
    low_stock = [{"id": str(p.id), "name": p.name, "stock": p.stock, "sku": p.sku} for p in low_stock_rows]
    out_of_stock = (await db.execute(select(func.count(Product.id)).where(Product.stock <= 0))).scalar() or 0

    category_rows = (await db.execute(select(Product.category, func.count(Product.id)).group_by(Product.category))).all()
    products_by_category = {cat: count for cat, count in category_rows}

    avg_order_value = round(float(total_revenue) / total_orders, 2) if total_orders else 0.0

    payload = {
        "total_users": total_users,
        "total_products": total_products,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": avg_order_value,
        "pending_orders": pending_orders,
        "orders_by_status": orders_by_status,
        "products_by_category": products_by_category,
        "low_stock_products": low_stock,
        "out_of_stock_count": out_of_stock,
        "recent_orders": recent,
        "top_products": top,
    }
    await cache_set("admin:dashboard", payload, ttl=60)
    return payload


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).order_by(User.created_at.desc(), User.id.asc()).offset((page - 1) * limit).limit(limit)
    )
    users = result.scalars().all()
    return [UserResponse.model_validate(u) for u in users]


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    data: AdminUserUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    from utils.auth import normalize_role

    try:
        uid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.role is not None:
        user.role = normalize_role(data.role)
        # Keep legacy flag in sync
        user.is_admin = (user.role == "admin")
    if data.is_admin is not None:
        user.is_admin = data.is_admin
        if data.role is None:
            user.role = "admin" if data.is_admin else "customer"
    if data.is_verified is not None:
        user.is_verified = data.is_verified

    await db.flush()
    return UserResponse.model_validate(user)


@router.get("/orders", response_model=OrderListResponse)
async def admin_list_orders(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: str | None = None,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order)
    count_query = select(func.count(Order.id))

    if status_filter:
        query = query.where(Order.status == status_filter)
        count_query = count_query.where(Order.status == status_filter)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    pages = math.ceil(total / limit) if total > 0 else 1

    result = await db.execute(
        query.order_by(Order.created_at.desc(), Order.id.asc()).offset((page - 1) * limit).limit(limit)
    )
    orders = result.scalars().all()

    order_responses = []
    for order in orders:
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        item_list = []
        for item in items:
            product_result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = product_result.scalar_one_or_none()
            item_list.append({
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
                items=item_list,
                created_at=order.created_at,
            )
        )

    return OrderListResponse(orders=order_responses, total=total, page=page, pages=pages)


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str,
    data: OrderStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    valid_statuses = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    try:
        oid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID")

    result = await db.execute(select(Order).where(Order.id == oid))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    await db.flush()
    await cache_delete("admin:dashboard")
    return {"message": f"Order status updated to {data.status}"}


@router.get("/products", response_model=ProductListResponse)
async def admin_list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total_result = await db.execute(select(func.count(Product.id)))
    total = total_result.scalar() or 0
    pages = math.ceil(total / limit) if total > 0 else 1

    result = await db.execute(
        select(Product).order_by(Product.created_at.desc(), Product.id.asc()).offset((page - 1) * limit).limit(limit)
    )
    products = result.scalars().all()

    return ProductListResponse(
        products=[ProductResponse.model_validate(p).model_dump() for p in products],
        total=total,
        page=page,
        pages=pages,
    )
