import json
from typing import Any, Optional

import redis.asyncio as redis

from app.config import settings

redis_client: Optional[redis.Redis] = None


async def connect_redis():
    global redis_client
    try:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_client.ping()
        print("✅ Redis connected")
    except Exception as e:
        redis_client = None
        print(f"⚠️  Redis unavailable ({e}) — rate limiting & caching disabled")


async def disconnect_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None
        print("🔌 Redis disconnected")


def get_redis() -> redis.Redis:
    if redis_client is None:
        raise RuntimeError("Redis not connected")
    return redis_client


class Cache:
    PREFIX = "novacrm:"

    @staticmethod
    async def get(key: str) -> Optional[Any]:
        try:
            r = get_redis()
            data = await r.get(f"{Cache.PREFIX}{key}")
            return json.loads(data) if data else None
        except Exception:
            return None

    @staticmethod
    async def set(key: str, value: Any, ttl: int = 300):
        try:
            r = get_redis()
            await r.set(f"{Cache.PREFIX}{key}", json.dumps(value, default=str), ex=ttl)
        except Exception:
            pass

    @staticmethod
    async def delete(key: str):
        try:
            r = get_redis()
            await r.delete(f"{Cache.PREFIX}{key}")
        except Exception:
            pass

    @staticmethod
    async def delete_pattern(pattern: str):
        try:
            r = get_redis()
            keys = []
            async for key in r.scan_iter(f"{Cache.PREFIX}{pattern}"):
                keys.append(key)
            if keys:
                await r.delete(*keys)
        except Exception:
            pass

    @staticmethod
    async def blacklist_token(jti: str, ttl: int):
        try:
            r = get_redis()
            await r.set(f"{Cache.PREFIX}bl:{jti}", "1", ex=ttl)
        except Exception:
            pass

    @staticmethod
    async def is_blacklisted(jti: str) -> bool:
        try:
            r = get_redis()
            return await r.exists(f"{Cache.PREFIX}bl:{jti}") == 1
        except Exception:
            return False

    @staticmethod
    async def increment(key: str, ttl: int = 60) -> int:
        try:
            r = get_redis()
            full_key = f"{Cache.PREFIX}{key}"
            count = await r.incr(full_key)
            if count == 1:
                await r.expire(full_key, ttl)
            return count
        except Exception:
            return 0
