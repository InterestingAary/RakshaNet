from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator, model_validator

from app.models.shelter import ShelterStatus


class ShelterCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=5000)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    location: str | None = Field(default=None, max_length=500)
    total_capacity: int = Field(gt=0)
    current_occupancy: int = Field(default=0, ge=0)

    @field_validator("name", "description", "location")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value cannot be blank")
        return normalized

    @model_validator(mode="after")
    def validate_capacity(self):
        if self.current_occupancy > self.total_capacity:
            raise ValueError("current_occupancy cannot exceed total_capacity")
        return self


class ShelterUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, min_length=1, max_length=5000)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    location: str | None = Field(default=None, max_length=500)
    total_capacity: int | None = Field(default=None, gt=0)
    current_occupancy: int | None = Field(default=None, ge=0)
    status: ShelterStatus | None = None

    @field_validator("name", "description", "location")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = value.strip()
        if not normalized:
            raise ValueError("Value cannot be blank")
        return normalized

    @model_validator(mode="after")
    def validate_capacity(self):
        if (
            self.total_capacity is not None
            and self.current_occupancy is not None
            and self.current_occupancy > self.total_capacity
        ):
            raise ValueError("current_occupancy cannot exceed total_capacity")
        return self


class ShelterVerify(BaseModel):
    verified: bool = True


class ShelterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str
    latitude: float
    longitude: float
    location: str | None
    total_capacity: int
    current_occupancy: int
    status: ShelterStatus
    verified: bool = False
    created_by_id: UUID
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def available_capacity(self) -> int:
        return self.total_capacity - self.current_occupancy


class CitizenCoordinates(BaseModel):
    latitude: float = Field(ge=-90.0, le=90.0)
    longitude: float = Field(ge=-180.0, le=180.0)


class ShelterWithDistanceResponse(ShelterResponse):
    distance_meters: float
    distance_km: float


class ShelterRecommendationResponse(BaseModel):
    recommended_shelter: ShelterWithDistanceResponse | None = None
    distance_meters: float | None = None
    distance_km: float | None = None
    available_capacity: int | None = None
    citizen_location: CitizenCoordinates
    available_shelters: list[ShelterWithDistanceResponse] = []

