from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1 import api_router
from app.core.redis import connect_redis, disconnect_redis
from app.middleware.rate_limit import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_redis()
    yield
    await disconnect_redis()


app = FastAPI(
    title="Nexora API",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(RateLimitMiddleware, requests_per_minute=60, auth_requests_per_minute=20)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "nexora-api", "version": "1.0.0"}
