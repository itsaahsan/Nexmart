import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.product import Product
from models.user import User
from redis_client import redis_client
from schemas.wishlist import CartItemAdd, CartItemResponse, CartItemUpdate, CartResponse
from utils.auth import get_current_user

router = APIRouter()

CART_TTL = 86400


def _cart_key(user_id: str) -> str:
    return f"cart:{user_id}"


async def _get_cart(user_id: str) -> dict:
    data = await redis_client.get(_cart_key(user_id))
    if data:
        return json.loads(data)
    return {}


async def _save_cart(user_id: str, cart: dict) -> None:
    await redis_client.set(_cart_key(user_id), json.dumps(cart), ex=CART_TTL)


@router.get("", response_model=CartResponse)
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await _get_cart(str(current_user.id))
    items = []
    total = 0.0

    for product_id_str, item_data in cart.items():
        items.append(
            CartItemResponse(
                product_id=product_id_str,
                name=item_data["name"],
                price=item_data["price"],
                image_url=item_data["image_url"],
                quantity=item_data["quantity"],
                stock=item_data["stock"],
            )
        )
        total += item_data["price"] * item_data["quantity"]

    return CartResponse(items=items, total=round(total, 2), item_count=len(items))


@router.post("/add", response_model=CartResponse)
async def add_to_cart(
    data: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Product).where(Product.id == data.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.stock < data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    cart = await _get_cart(str(current_user.id))
    pid_str = str(data.product_id)

    if pid_str in cart:
        cart[pid_str]["quantity"] += data.quantity
    else:
        cart[pid_str] = {
            "name": product.name,
            "price": product.price,
            "image_url": product.image_url,
            "quantity": data.quantity,
            "stock": product.stock,
        }

    await _save_cart(str(current_user.id), cart)

    items = []
    total = 0.0
    for pid, item_data in cart.items():
        items.append(
            CartItemResponse(
                product_id=pid,
                name=item_data["name"],
                price=item_data["price"],
                image_url=item_data["image_url"],
                quantity=item_data["quantity"],
                stock=item_data["stock"],
            )
        )
        total += item_data["price"] * item_data["quantity"]

    return CartResponse(items=items, total=round(total, 2), item_count=len(items))


@router.put("/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: str,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
):
    cart = await _get_cart(str(current_user.id))

    if product_id not in cart:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if data.quantity <= 0:
        del cart[product_id]
    else:
        cart[product_id]["quantity"] = data.quantity

    await _save_cart(str(current_user.id), cart)

    items = []
    total = 0.0
    for pid, item_data in cart.items():
        items.append(
            CartItemResponse(
                product_id=pid,
                name=item_data["name"],
                price=item_data["price"],
                image_url=item_data["image_url"],
                quantity=item_data["quantity"],
                stock=item_data["stock"],
            )
        )
        total += item_data["price"] * item_data["quantity"]

    return CartResponse(items=items, total=round(total, 2), item_count=len(items))


@router.delete("/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user),
):
    cart = await _get_cart(str(current_user.id))
    if product_id in cart:
        del cart[product_id]
        await _save_cart(str(current_user.id), cart)
    return {"message": "Item removed"}


@router.delete("")
async def clear_cart(current_user: User = Depends(get_current_user)):
    await redis_client.delete(_cart_key(str(current_user.id)))
    return {"message": "Cart cleared"}


@router.post("/merge")
async def merge_guest_cart(
    guest_items: list[CartItemAdd],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await _get_cart(str(current_user.id))

    for item in guest_items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()
        if not product or product.stock < item.quantity:
            continue

        pid_str = str(item.product_id)
        if pid_str in cart:
            cart[pid_str]["quantity"] += item.quantity
        else:
            cart[pid_str] = {
                "name": product.name,
                "price": product.price,
                "image_url": product.image_url,
                "quantity": item.quantity,
                "stock": product.stock,
            }

    await _save_cart(str(current_user.id), cart)
    return {"message": "Cart merged"}
