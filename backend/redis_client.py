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


redis_client = None
try:
    redis_client = redis.from_url(_normalize_redis_url(settings.REDIS_URL), decode_responses=True)
except Exception:
    pass


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
