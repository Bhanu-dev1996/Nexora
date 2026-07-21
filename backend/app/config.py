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

    GOOGLE_CLIENT_ID: str = "26898554047-h4n4cm5va1t2f1vegf1p75r0559fkr55.apps.googleusercontent.com"

    MAILTRAP_SMTP_USERNAME: str = "01fe9e69a90e00"
    MAILTRAP_SMTP_PASSWORD: str = "36b3d304acc93e"
    EMAIL_FROM: str = "noreply@nexora.app"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
