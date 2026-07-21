import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(data: dict, secret: str, expires_minutes: int) -> str:
    to_encode = data.copy()
    to_encode.setdefault("jti", secrets.token_hex(16))
    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc), "iss": "nexora-api", "aud": "nexora-api"})
    return jwt.encode(to_encode, secret, algorithm="HS256")


def create_access_token(user_id: str, org_id: str, role: str, permissions: list[str], email: str, expires_delta: Optional[timedelta] = None) -> str:
    minutes = int(expires_delta.total_seconds() / 60) if expires_delta else settings.JWT_ACCESS_EXPIRY
    return create_token(
        {"sub": user_id, "org_id": org_id, "role": role, "permissions": permissions, "email": email},
        settings.JWT_ACCESS_SECRET,
        minutes,
    )


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_ACCESS_SECRET, algorithms=["HS256"], issuer="nexora-api", audience="nexora-api")
    except JWTError:
        return None


def create_refresh_token() -> str:
    import secrets
    return f"rt_{secrets.token_hex(32)}"
