from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.disaster import DisasterSeverity, DisasterStatus, DisasterType


class DisasterCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    disaster_type: DisasterType
    severity: DisasterSeverity
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    location: str | None = Field(default=None, max_length=500)

    @field_validator("title", "description", "location")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value cannot be blank")
        return normalized


class DisasterUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    disaster_type: DisasterType | None = None
    severity: DisasterSeverity | None = None
    status: DisasterStatus | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    location: str | None = Field(default=None, max_length=500)

    @field_validator("title", "description", "location")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value cannot be blank")
        return normalized


class DisasterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    description: str
    disaster_type: DisasterType
    severity: DisasterSeverity
    status: DisasterStatus
    latitude: float
    longitude: float
    location: str | None
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime