import json
from typing import Any

import redis.asyncio as redis

from settings import settings


def _normalize_redis_url(url: str) -> str:
    if url.startswith("http://"):
        url = "redis://" + url[len("http://"):]
    elif url.startswith("https://"):
        url = "rediss://" + url[len("https://"):]
    return url


def _build_client():
    """Create Redis client with pooling tuned for 1,000+ concurrent users."""
    try:
        return redis.from_url(
            _normalize_redis_url(settings.REDIS_URL),
            decode_responses=True,
            # Connection pool: share sockets across concurrent requests
            max_connections=100,
            socket_keepalive=True,
            socket_connect_timeout=5,
            socket_timeout=5,
            health_check_interval=30,
            retry_on_timeout=True,
        )
    except Exception:
        return None


redis_client = _build_client()


async def init_redis() -> None:
    """(Re)initialize Redis client at startup. Safe to call multiple times."""
    global redis_client
    if redis_client is not None:
        return
    redis_client = _build_client()


async def close_redis() -> None:
    global redis_client
    if redis_client is not None:
        try:
            await redis_client.aclose()
        except Exception:
            pass
        finally:
            redis_client = None


async def redis_health() -> dict:
    if not redis_client:
        return {"configured": False, "reachable": False}
    try:
        pong = await redis_client.ping()
        return {"configured": True, "reachable": bool(pong)}
    except Exception as e:
        return {"configured": True, "reachable": False, "error": str(e)}


async def check_rate_limit(key: str, limit: int = 100, window_seconds: int = 60) -> tuple[bool, int]:
    """Fixed-window rate limiter backed by Redis.

    Returns (allowed, current_count). Fails open when Redis is unavailable
    so traffic is not blocked by cache outages.
    """
    if not redis_client:
        return True, 0
    try:
        pipe = redis_client.pipeline()
        pipe.incr(key)
        pipe.ttl(key)
        count, ttl = await pipe.execute()
        if ttl == -1:
            await redis_client.expire(key, window_seconds)
        return (count <= limit), int(count)
    except Exception:
        return True, 0


async def cache_get(key: str) -> Any | None:
    if not redis_client:
        return None
    try:
        data = await redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


async def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    if not redis_client:
        return
    try:
        await redis_client.set(key, json.dumps(value, default=str), ex=ttl)
    except Exception:
        pass


async def cache_delete(key: str) -> None:
    if not redis_client:
        return
    try:
        await redis_client.delete(key)
    except Exception:
        pass


async def cache_delete_pattern(pattern: str) -> None:
    if not redis_client:
        return
    try:
        keys = []
        async for key in redis_client.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            await redis_client.delete(*keys)
    except Exception:
        pass
