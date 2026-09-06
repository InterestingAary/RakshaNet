from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class CitizenCoordinates(BaseModel):
    latitude: float = Field(ge=-90.0, le=90.0, description="Latitude in degrees (-90 to 90)")
    longitude: float = Field(ge=-180.0, le=180.0, description="Longitude in degrees (-180 to 180)")


class ExposureHazardZone(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    disaster_id: UUID
    name: str
    severity: int
    source: str | None = None
    distance_meters: float


class ExposureResponse(BaseModel):
    is_exposed: bool
    citizen_location: CitizenCoordinates
    hazard_zones: list[ExposureHazardZone] = []
    highest_severity: int | None = None
    nearest_hazard_distance_meters: float | None = None
    message: str
