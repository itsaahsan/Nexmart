import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_categories(client: AsyncClient):
    response = await client.get("/api/categories")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_get_cart_empty(client: AsyncClient):
    response = await client.get("/api/cart")
    assert response.status_code in (200, 401)


@pytest.mark.asyncio
async def test_get_wishlist_empty(client: AsyncClient):
    response = await client.get("/api/wishlist")
    assert response.status_code in (200, 401)


@pytest.mark.asyncio
async def test_get_addresses_unauthenticated(client: AsyncClient):
    response = await client.get("/api/addresses")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_admin_dashboard_unauthenticated(client: AsyncClient):
    response = await client.get("/api/admin/dashboard")
    assert response.status_code == 401
