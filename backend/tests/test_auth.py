import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_user(client: AsyncClient):
    response = await client.post("/api/auth/register", json={
        "email": "test@example.com",
        "full_name": "Test User",
        "password": "password123",
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "dup@example.com",
        "full_name": "User 1",
        "password": "password123",
    })
    response = await client.post("/api/auth/register", json={
        "email": "dup@example.com",
        "full_name": "User 2",
        "password": "password123",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "login@example.com",
        "full_name": "Login User",
        "password": "secret123",
    })
    response = await client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "secret123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient):
    await client.post("/api/auth/register", json={
        "email": "wrong@example.com",
        "full_name": "Wrong User",
        "password": "correct",
    })
    response = await client.post("/api/auth/login", json={
        "email": "wrong@example.com",
        "password": "incorrect",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient):
    reg = await client.post("/api/auth/register", json={
        "email": "me@example.com",
        "full_name": "Me User",
        "password": "password123",
    })
    token = reg.json()["access_token"]
    response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient):
    reg = await client.post("/api/auth/register", json={
        "email": "refresh@example.com",
        "full_name": "Refresh User",
        "password": "password123",
    })
    refresh = reg.json()["refresh_token"]
    response = await client.post("/api/auth/refresh", json={"refresh_token": refresh})
    assert response.status_code == 200
    assert "access_token" in response.json()
