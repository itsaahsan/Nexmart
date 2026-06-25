import pytest
from unittest.mock import patch, AsyncMock
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
@patch("routers.products.cache_get", new_callable=AsyncMock, return_value=None)
@patch("routers.products.cache_set", new_callable=AsyncMock)
async def test_get_products_empty(mock_set, mock_get, client: AsyncClient):
    response = await client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["products"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
@patch("routers.products.cache_get", new_callable=AsyncMock, return_value=None)
@patch("routers.products.cache_set", new_callable=AsyncMock)
async def test_get_products_with_params(mock_set, mock_get, client: AsyncClient):
    response = await client.get("/api/products?page=1&limit=5&sort=newest")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert "total" in data
    assert "page" in data
    assert "pages" in data


@pytest.mark.asyncio
@patch("routers.products.cache_get", new_callable=AsyncMock, return_value=None)
@patch("routers.products.cache_set", new_callable=AsyncMock)
async def test_featured_products_empty(mock_set, mock_get, client: AsyncClient):
    response = await client.get("/api/products/featured")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_search_suggestions_empty(client: AsyncClient):
    response = await client.get("/api/products/search-suggestions?q=test")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
async def test_search_suggestions_too_short(client: AsyncClient):
    response = await client.get("/api/products/search-suggestions?q=a")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.asyncio
@patch("routers.products.cache_get", new_callable=AsyncMock, return_value=None)
async def test_get_nonexistent_product(mock_get, client: AsyncClient):
    response = await client.get("/api/products/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


@pytest.mark.asyncio
@patch("routers.products.cache_get", new_callable=AsyncMock, return_value=None)
async def test_get_product_invalid_id(mock_get, client: AsyncClient):
    response = await client.get("/api/products/not-a-uuid")
    assert response.status_code == 400
