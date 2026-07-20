import re
from typing import Optional

from pydantic import BaseModel, field_validator


class RegisterRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str
    organizationName: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8 or len(v) > 128:
            raise ValueError("Password must be 8-128 characters")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain a lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain a number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain a special character")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshTokenRequest(BaseModel):
    refreshToken: str


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    accessTokenExpiresAt: str
    refreshTokenExpiresAt: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    firstName: str
    lastName: str
    avatar: Optional[str] = None
    role: Optional[str] = None
    organizationId: Optional[str] = None
    permissions: Optional[list] = None


class AuthResponse(BaseModel):
    user: UserResponse
    tokens: TokenResponse
