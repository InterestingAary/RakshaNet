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


class RouteCalculationRequest(BaseModel):
    origin_latitude: float = Field(ge=-90, le=90)
    origin_longitude: float = Field(ge=-180, le=180)
    destination_latitude: float = Field(ge=-90, le=90)
    destination_longitude: float = Field(ge=-180, le=180)
    shelter_id: UUID | None = None
    disaster_id: UUID | None = None
    avoid_hazards: bool = True
    avoid_blocked_roads: bool = True


class RouteGeometry(BaseModel):
    type: str = "LineString"
    coordinates: list[list[float]]


class RouteCalculationResponse(BaseModel):
    status: str
    distance_km: float
    estimated_time_minutes: float
    safety_score: float
    geometry: RouteGeometry
    avoided_hazards_count: int
    avoided_blocked_roads_count: int
    warnings: list[str] = []

