import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.redis import get_redis


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60, auth_requests_per_minute: int = 20):
        super().__init__(app)
        self.rpm = requests_per_minute
        self.auth_rpm = auth_requests_per_minute

    async def dispatch(self, request: Request, call_next):
        try:
            r = get_redis()
        except RuntimeError:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        is_auth = request.url.path.startswith("/api/v1/auth/")
        limit = self.auth_rpm if is_auth else self.rpm
        window = 60

        key = f"rate:auth:{client_ip}" if is_auth else f"rate:api:{client_ip}"

        try:
            pipe = r.pipeline()
            now = time.time()
            window_start = now - window

            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window)

            results = await pipe.execute()
            request_count = results[2]

            remaining = max(0, limit - request_count)
            reset_at = int(now + window)

            if request_count > limit:
                return Response(
                    content='{"error": "Too many requests. Please try again later."}',
                    status_code=429,
                    media_type="application/json",
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(reset_at),
                        "Retry-After": str(window),
                    },
                )

            response = await call_next(request)
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(reset_at)
            return response

        except Exception:
            return await call_next(request)
