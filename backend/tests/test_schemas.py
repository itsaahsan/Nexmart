from datetime import datetime
from uuid import uuid4

from schemas.product import ProductCreate, ProductUpdate, ProductResponse


def test_product_create_schema():
    product = ProductCreate(
        name="Test Product",
        description="A test product",
        price=29.99,
        category="Electronics",
        brand="TestBrand",
        sku="TST-001",
        image_url="https://example.com/img.jpg",
        images=["https://example.com/img1.jpg"],
    )
    assert product.name == "Test Product"
    assert product.price == 29.99
    assert product.stock == 0
    assert product.is_featured is False
    assert product.is_active is True
    assert len(product.images) == 1


def test_product_create_defaults():
    product = ProductCreate(
        name="Minimal",
        description="Minimal product",
        price=10.0,
        category="Test",
        brand="Brand",
        sku="MIN-001",
    )
    assert product.image_url == ""
    assert product.images == []
    assert product.compare_price is None
    assert product.category_id is None


def test_product_update_partial():
    update = ProductUpdate(price=19.99)
    data = update.model_dump(exclude_unset=True)
    assert "price" in data
    assert "name" not in data
    assert "description" not in data


def test_product_update_all_fields():
    update = ProductUpdate(
        name="Updated",
        price=99.99,
        stock=50,
    )
    data = update.model_dump(exclude_unset=True)
    assert len(data) == 3


def test_product_response_schema():
    response = ProductResponse(
        id=uuid4(),
        name="Response Product",
        slug="response-product",
        description="Desc",
        price=49.99,
        category="Electronics",
        brand="Brand",
        image_url="https://example.com/img.jpg",
        images=["https://example.com/img.jpg"],
        stock=20,
        sku="RES-001",
        is_featured=True,
        is_active=True,
        rating=4.5,
        review_count=15,
        created_at=datetime.now(),
    )
    assert response.name == "Response Product"
    assert response.rating == 4.5
    assert response.images is not None
