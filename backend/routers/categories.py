from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.category import Category
from schemas.category import CategoryCreate, CategoryResponse
from redis_client import cache_get, cache_set, cache_delete

router = APIRouter()


@router.get("", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    cached = await cache_get("categories:all")
    if cached:
        return cached

    result = await db.execute(select(Category).order_by(Category.name))
    categories = result.scalars().all()
    data = [CategoryResponse.model_validate(c).model_dump() for c in categories]
    await cache_set("categories:all", data, ttl=300)
    return data


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: str, db: AsyncSession = Depends(get_db)):
    import uuid
    try:
        cid = uuid.UUID(category_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    result = await db.execute(select(Category).where(Category.id == cid))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return CategoryResponse.model_validate(category)


@router.post("", response_model=CategoryResponse, status_code=201)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.slug == data.slug))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Category slug already exists")

    category = Category(**data.model_dump())
    db.add(category)
    await db.flush()
    await cache_delete("categories:all")
    return CategoryResponse.model_validate(category).model_dump()


@router.delete("/{category_id}")
async def delete_category(category_id: str, db: AsyncSession = Depends(get_db)):
    import uuid
    try:
        cid = uuid.UUID(category_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid category ID")

    result = await db.execute(select(Category).where(Category.id == cid))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    await db.delete(category)
    await db.flush()
    await cache_delete("categories:all")
    return {"message": "Category deleted"}
