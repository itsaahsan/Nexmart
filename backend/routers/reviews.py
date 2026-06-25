from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.product import Product
from models.review import Review
from models.user import User
from schemas.review import ReviewCreate, ReviewResponse
from utils.auth import get_current_user

router = APIRouter()


@router.get("/{product_id}", response_model=list[ReviewResponse])
async def list_reviews(product_id: str, db: AsyncSession = Depends(get_db)):
    import uuid
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.execute(
        select(Review).where(Review.product_id == pid).order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()

    responses = []
    for review in reviews:
        user_result = await db.execute(select(User).where(User.id == review.user_id))
        user = user_result.scalar_one_or_none()
        responses.append(
            ReviewResponse(
                id=review.id,
                product_id=review.product_id,
                user_id=review.user_id,
                rating=review.rating,
                title=review.title,
                body=review.body,
                user_name=user.full_name if user else "Anonymous",
                created_at=review.created_at,
            )
        )
    return responses


@router.post("", response_model=ReviewResponse, status_code=201)
async def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(
        select(Review).where(
            Review.product_id == data.product_id, Review.user_id == current_user.id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already reviewed this product")

    review = Review(
        product_id=data.product_id,
        user_id=current_user.id,
        rating=data.rating,
        title=data.title,
        body=data.body,
    )
    db.add(review)

    result = await db.execute(
        select(Review).where(Review.product_id == data.product_id)
    )
    all_reviews = result.scalars().all()
    avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)

    product_result = await db.execute(
        select(Product).where(Product.id == data.product_id)
    )
    product = product_result.scalar_one_or_none()
    if product:
        product.rating = round(avg_rating, 1)
        product.review_count = len(all_reviews)

    await db.flush()

    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        user_id=review.user_id,
        rating=review.rating,
        title=review.title,
        body=review.body,
        user_name=current_user.full_name,
        created_at=review.created_at,
    )


@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        rid = uuid.UUID(review_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid review ID")

    result = await db.execute(select(Review).where(Review.id == rid))
    review = result.scalar_one_or_none()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(review)
    await db.flush()
    return {"message": "Review deleted"}
