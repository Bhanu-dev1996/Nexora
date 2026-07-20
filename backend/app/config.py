from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    NODE_ENV: str = "development"
    PORT: int = 4000
    API_URL: str = "http://localhost:4000"
    FRONTEND_URL: str = "http://localhost:5173"

    DATABASE_URL: str
    REDIS_URL: str = "redis://localhost:6379"

    JWT_ACCESS_SECRET: str
    JWT_REFRESH_SECRET: str
    JWT_ACCESS_EXPIRY: int = 15
    JWT_REFRESH_EXPIRY: int = 10080

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
