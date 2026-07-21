from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.cart import CartItem
from models.product import Product
from models.user import User
from schemas.wishlist import CartItemAdd, CartItemResponse, CartItemUpdate, CartResponse
from utils.auth import get_current_user

router = APIRouter()


@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem, Product)
        .join(Product, CartItem.product_id == Product.id)
        .where(CartItem.user_id == current_user.id, Product.is_active == True)
    )
    rows = result.all()

    items = []
    total = 0.0
    changed = False

    for cart_row, product in rows:
        if product.stock <= 0:
            await db.delete(cart_row)
            changed = True
            continue
        quantity = min(cart_row.quantity, product.stock)
        if quantity != cart_row.quantity:
            cart_row.quantity = quantity
            changed = True
        items.append(
            CartItemResponse(
                product_id=str(product.id),
                name=product.name,
                price=product.price,
                image_url=product.image_url,
                quantity=quantity,
                stock=product.stock,
            )
        )
        total += product.price * quantity

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

    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == data.product_id,
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.quantity += data.quantity
    else:
        db.add(CartItem(user_id=current_user.id, product_id=data.product_id, quantity=data.quantity))

    await db.flush()
    return await _cart_response(current_user.id, db)


@router.put("/{product_id}", response_model=CartResponse)
async def update_cart_item(
    product_id: str,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == product_id,
        )
    )
    cart_row = result.scalar_one_or_none()
    if not cart_row:
        raise HTTPException(status_code=404, detail="Item not in cart")

    if data.quantity <= 0:
        await db.delete(cart_row)
    else:
        cart_row.quantity = data.quantity

    await db.flush()
    return await _cart_response(current_user.id, db)


@router.delete("/{product_id}")
async def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem).where(
            CartItem.user_id == current_user.id,
            CartItem.product_id == product_id,
        )
    )
    cart_row = result.scalar_one_or_none()
    if cart_row:
        await db.delete(cart_row)
        await db.flush()
    return {"message": "Item removed"}


@router.delete("")
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CartItem).where(CartItem.user_id == current_user.id)
    )
    for row in result.scalars().all():
        await db.delete(row)
    await db.flush()
    return {"message": "Cart cleared"}


@router.post("/merge")
async def merge_guest_cart(
    guest_items: list[CartItemAdd],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    for item in guest_items:
        result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = result.scalar_one_or_none()
        if not product or product.stock < item.quantity:
            continue

        result = await db.execute(
            select(CartItem).where(
                CartItem.user_id == current_user.id,
                CartItem.product_id == item.product_id,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.quantity += item.quantity
        else:
            db.add(CartItem(user_id=current_user.id, product_id=item.product_id, quantity=item.quantity))

    await db.flush()
    return {"message": "Cart merged"}


async def _cart_response(user_id, db: AsyncSession) -> CartResponse:
    result = await db.execute(
        select(CartItem, Product)
        .join(Product, CartItem.product_id == Product.id)
        .where(CartItem.user_id == user_id, Product.is_active == True)
    )
    rows = result.all()

    items = []
    total = 0.0
    for cart_row, product in rows:
        quantity = min(cart_row.quantity, product.stock)
        items.append(
            CartItemResponse(
                product_id=str(product.id),
                name=product.name,
                price=product.price,
                image_url=product.image_url,
                quantity=quantity,
                stock=product.stock,
            )
        )
        total += product.price * quantity

    return CartResponse(items=items, total=round(total, 2), item_count=len(items))
