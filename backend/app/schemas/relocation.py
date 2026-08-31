from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RelocationRequest(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    disaster_id: UUID | None = None

    @field_validator("latitude", "longitude")
    @classmethod
    def validate_coordinates(cls, value: float) -> float:
        if value is None:
            return value
        return float(value)


class RelocationRecommendation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    shelter_id: UUID
    shelter_name: str
    distance_km: float
    available_capacity: int
    latitude: float
    longitude: float
    created_at: datetime | None = None
