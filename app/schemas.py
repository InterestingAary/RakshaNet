from datetime import datetime, timezone
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"


class HazardType(str, Enum):
    FLOOD = "flood"
    LANDSLIDE = "landslide"
    FIRE = "fire"
    CYCLONE = "cyclone"
    EARTHQUAKE = "earthquake"
    OTHER = "other"


class RiskRequest(BaseModel):
    habitation_id: str = Field(min_length=1)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    hazard_type: HazardType | None = None
    hazard_severity: float | None = Field(default=None, ge=0, le=1)
    distance_to_hazard_zone: float | None = Field(default=None, ge=0)
    hazard_zone_intersection: bool | None = None
    rainfall_or_flood_depth: float | None = Field(default=None, ge=0)
    elevation: float | None = None
    slope: float | None = Field(default=None, ge=0)
    population: int | None = Field(default=None, ge=0)
    vulnerable_population: int | None = Field(default=None, ge=0)
    elderly_population: int | None = Field(default=None, ge=0)
    children_population: int | None = Field(default=None, ge=0)
    persons_with_disabilities: int | None = Field(default=None, ge=0)
    road_accessibility: float | None = Field(default=None, ge=0, le=1)
    shelter_distance: float | None = Field(default=None, ge=0)
    available_shelter_capacity: int | None = Field(default=None, ge=0)
    estimated_relocation_demand: int | None = Field(default=None, ge=0)
    historical_incident_count: int | None = Field(default=None, ge=0)
    data_freshness_hours: float | None = Field(default=None, ge=0)
    source_reliability: float | None = Field(default=None, ge=0, le=1)

    @model_validator(mode="after")
    def validate_population_breakdown(self):
        for value in (self.vulnerable_population, self.elderly_population, self.children_population, self.persons_with_disabilities):
            if value is not None and self.population is not None and value > self.population:
                raise ValueError("population subgroup cannot exceed population")
        return self


class ShelterData(BaseModel):
    total_capacity: int | None = Field(default=None, ge=0)
    current_occupancy: int | None = Field(default=None, ge=0)
    reserved_emergency_capacity: int = Field(default=0, ge=0)
    verified: bool = False
    accessible: bool = False
    operational: bool = False
    inside_hazard_zone: bool = False
    route_available: bool = False
    data_freshness_hours: float | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def validate_occupancy(self):
        if self.total_capacity is not None and self.current_occupancy is not None and self.current_occupancy > self.total_capacity:
            raise ValueError("current_occupancy cannot exceed total_capacity")
        if self.total_capacity is not None and self.reserved_emergency_capacity > self.total_capacity:
            raise ValueError("reserved_emergency_capacity cannot exceed total_capacity")
        return self


class RelocationRequest(RiskRequest):
    shelter: ShelterData | None = None


class ReportRequest(BaseModel):
    report_id: str = Field(min_length=1)
    report_text: str = Field(min_length=1, max_length=10000)
    citizen_category: str | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    image_available: bool = False
    nearby_hazard: bool | None = None
    previous_reports_same_area: int | None = Field(default=None, ge=0)
    report_age_hours: float | None = Field(default=None, ge=0)


class DataQuality(BaseModel):
    missing_features: list[str] = []
    stale_features: list[str] = []
    source_warnings: list[str] = []


class AdvisoryResponse(BaseModel):
    success: bool = True
    result: dict
    confidence: float = Field(ge=0, le=1)
    explanation: list[str]
    data_quality: DataQuality
    requires_human_review: bool
    verification_status: Literal["PENDING_REVIEW"] = "PENDING_REVIEW"
    model_version: str
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))