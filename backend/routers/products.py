import json
import math
import re
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.product import Product
from models.review import Review
from schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from utils.auth import get_current_admin
from utils.cloudinary_utils import upload_image
from redis_client import cache_get, cache_set, cache_delete, cache_delete_pattern

router = APIRouter()


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: str | None = None,
    brand: str | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    sort: str = "newest",
    in_stock: bool | None = None,
    featured: bool | None = None,
    db: AsyncSession = Depends(get_db),
):
    cache_key = f"products:{category}:{brand}:{search}:{min_price}:{max_price}:{sort}:{in_stock}:{featured}:{page}:{limit}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    query = select(Product).where(Product.is_active == True)
    count_query = select(func.count(Product.id)).where(Product.is_active == True)

    if category:
        query = query.where(Product.category == category)
        count_query = count_query.where(Product.category == category)
    if brand:
        query = query.where(Product.brand == brand)
        count_query = count_query.where(Product.brand == brand)
    if search:
        search_term = f"%{search}%"
        search_filter = or_(
            Product.name.ilike(search_term),
            Product.description.ilike(search_term),
            Product.brand.ilike(search_term),
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)
    if min_price is not None:
        query = query.where(Product.price >= min_price)
        count_query = count_query.where(Product.price >= min_price)
    if max_price is not None:
        query = query.where(Product.price <= max_price)
        count_query = count_query.where(Product.price <= max_price)
    if in_stock:
        query = query.where(Product.stock > 0)
        count_query = count_query.where(Product.stock > 0)
    if featured:
        query = query.where(Product.is_featured == True)
        count_query = count_query.where(Product.is_featured == True)

    sort_map = {
        "newest": Product.created_at.desc(),
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
        "rating": Product.rating.desc(),
        "popular": Product.review_count.desc(),
    }
    query = query.order_by(sort_map.get(sort, Product.created_at.desc()))

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    pages = math.ceil(total / limit) if total > 0 else 1

    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    response_data = {
        "products": [ProductResponse.model_validate(p).model_dump() for p in products],
        "total": total,
        "page": page,
        "pages": pages,
    }

    await cache_set(cache_key, response_data, ttl=300)
    return response_data


@router.get("/search-suggestions")
async def search_suggestions(q: str = "", db: AsyncSession = Depends(get_db)):
    if not q or len(q) < 2:
        return []
    result = await db.execute(
        select(Product.name)
        .where(Product.is_active == True, Product.name.ilike(f"%{q}%"))
        .limit(8)
    )
    return [r[0] for r in result.all()]


@router.get("/featured", response_model=list[ProductResponse])
async def featured_products(db: AsyncSession = Depends(get_db)):
    cache_key = "products:featured"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    result = await db.execute(
        select(Product)
        .where(Product.is_featured == True, Product.is_active == True)
        .order_by(Product.created_at.desc())
        .limit(8)
    )
    products = result.scalars().all()
    data = [ProductResponse.model_validate(p).model_dump() for p in products]
    await cache_set(cache_key, data, ttl=300)
    return data


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    cache_key = f"product:{product_id}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.execute(select(Product).where(Product.id == pid))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    response = ProductResponse.model_validate(product).model_dump()
    await cache_set(cache_key, response, ttl=600)
    return response


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db),
):
    slug = slugify(data.name)
    result = await db.execute(select(Product).where(Product.sku == data.sku))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="SKU already exists")

    product = Product(
        name=data.name,
        slug=slug,
        description=data.description,
        price=data.price,
        compare_price=data.compare_price,
        category=data.category,
        brand=data.brand,
        image_url=data.image_url,
        images=data.images,
        stock=data.stock,
        sku=data.sku,
        is_featured=data.is_featured,
        is_active=data.is_active,
        category_id=data.category_id,
    )
    db.add(product)
    await db.flush()
    await cache_delete_pattern("products:*")
    return ProductResponse.model_validate(product).model_dump()


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
):
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.execute(select(Product).where(Product.id == pid))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = data.model_dump(exclude_unset=True)
    if update_data.get("name"):
        update_data["slug"] = slugify(update_data["name"])

    for key, value in update_data.items():
        setattr(product, key, value)

    await db.flush()
    await cache_delete(f"product:{product_id}")
    await cache_delete_pattern("products:*")
    return ProductResponse.model_validate(product).model_dump()


@router.delete("/{product_id}")
async def delete_product(product_id: str, db: AsyncSession = Depends(get_db)):
    try:
        pid = uuid.UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = await db.execute(select(Product).where(Product.id == pid))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.flush()
    await cache_delete(f"product:{product_id}")
    await cache_delete_pattern("products:*")
    return {"message": "Product deleted"}


@router.post("/upload-image")
async def upload_product_image(
    file: UploadFile = File(...),
    admin=Depends(get_current_admin),
):
    contents = await file.read()
    url = await upload_image(contents)
    return {"url": url}
