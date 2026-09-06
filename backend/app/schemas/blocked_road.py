from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.blocked_road import BlockageSeverity, BlockageType, BlockedRoadStatus


class BlockedRoadBase(BaseModel):
    road_name: str = Field(min_length=1, max_length=255, description="Name of the affected road")
    description: str = Field(min_length=1, max_length=2000, description="Details regarding the obstruction")
    blockage_type: BlockageType = Field(default=BlockageType.OTHER)
    severity: BlockageSeverity = Field(default=BlockageSeverity.FULL_CLOSURE)
    latitude: float = Field(ge=-90.0, le=90.0, description="Latitude in degrees (-90 to 90)")
    longitude: float = Field(ge=-180.0, le=180.0, description="Longitude in degrees (-180 to 180)")
    disaster_id: UUID | None = None

    @field_validator("road_name", "description")
    @classmethod
    def not_empty_after_strip(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Field cannot be empty or pure whitespace")
        return stripped


class BlockedRoadCreate(BlockedRoadBase):
    pass


class BlockedRoadUpdate(BaseModel):
    road_name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1, max_length=2000)
    blockage_type: BlockageType | None = None
    severity: BlockageSeverity | None = None
    latitude: float | None = Field(default=None, ge=-90.0, le=90.0)
    longitude: float | None = Field(default=None, ge=-180.0, le=180.0)

    @field_validator("road_name", "description")
    @classmethod
    def not_empty_after_strip(cls, value: str | None) -> str | None:
        if value is not None:
            stripped = value.strip()
            if not stripped:
                raise ValueError("Field cannot be empty or pure whitespace")
            return stripped
        return value


class BlockedRoadVerify(BaseModel):
    verified: bool = True
    notes: str | None = Field(default=None, max_length=1000, description="Verification review notes")


class BlockedRoadClear(BaseModel):
    notes: str | None = Field(default=None, max_length=1000, description="Clearance inspection notes")


class BlockedRoadAuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    blocked_road_id: UUID
    changed_by_id: UUID
    action: str
    previous_status: str | None = None
    new_status: str
    notes: str | None = None
    created_at: datetime


class BlockedRoadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    disaster_id: UUID | None = None
    road_name: str
    description: str
    blockage_type: str
    severity: str
    status: str
    verified: bool
    latitude: float
    longitude: float
    reported_by_id: UUID | None = None
    verified_by_id: UUID | None = None
    verified_at: datetime | None = None
    cleared_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    audit_logs: list[BlockedRoadAuditLogResponse] = []
