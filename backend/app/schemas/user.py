from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, SecretStr


class UserCreate(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: str = Field(min_length=1, max_length=255)
    phone: str | None = Field(default=None, max_length=30)
    password: SecretStr = Field(min_length=8, max_length=128)
    role: str = Field(default="user", min_length=1, max_length=50)


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