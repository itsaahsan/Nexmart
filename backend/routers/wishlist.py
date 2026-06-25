from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.wishlist import Wishlist
from models.product import Product
from models.user import User
from utils.auth import get_current_user

router = APIRouter()


@router.get("")
async def list_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id)
    )
    wishlists = result.scalars().all()

    items = []
    for w in wishlists:
        product_result = await db.execute(
            select(Product).where(Product.id == w.product_id)
        )
        product = product_result.scalar_one_or_none()
        if product:
            items.append({
                "id": w.id,
                "product_id": w.product_id,
                "created_at": str(w.created_at),
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "image_url": product.image_url,
                    "slug": product.slug,
                },
            })
    return items


@router.post("/{product_id}")
async def add_to_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    existing = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id, Wishlist.product_id == pid
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already in wishlist")

    product = await db.execute(select(Product).where(Product.id == pid))
    if not product.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Product not found")

    wishlist = Wishlist(user_id=current_user.id, product_id=pid)
    db.add(wishlist)
    await db.flush()
    return {"message": "Added to wishlist"}


@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id, Wishlist.product_id == pid
        )
    )
    wishlist = result.scalar_one_or_none()
    if not wishlist:
        raise HTTPException(status_code=404, detail="Not in wishlist")

    await db.delete(wishlist)
    await db.flush()
    return {"message": "Removed from wishlist"}


@router.get("/check/{product_id}")
async def check_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.execute(
        select(Wishlist).where(
            Wishlist.user_id == current_user.id, Wishlist.product_id == pid
        )
    )
    exists = result.scalar_one_or_none() is not None
    return {"is_in_wishlist": exists}
