from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, SecretStr, field_validator


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    password: SecretStr = Field(min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Full name cannot be blank")
        return normalized

    @field_validator("email")
    @classmethod
    def normalize_and_validate_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if (
            normalized.count("@") != 1
            or normalized.startswith("@")
            or normalized.endswith("@")
            or "." not in normalized.rsplit("@", 1)[1]
        ):
            raise ValueError("Invalid email address")
        return normalized

    @field_validator("password")
    @classmethod
    def validate_password_bytes(cls, value: SecretStr) -> SecretStr:
        if len(value.get_secret_value().encode("utf-8")) > 72:
            raise ValueError("Password is too long")
        return value


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: str
    phone: str | None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime