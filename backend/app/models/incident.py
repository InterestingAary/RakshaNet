import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import CheckConstraint, DateTime, Float, ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.user import utc_now


class IncidentType(str, Enum):
    FIRE = "FIRE"
    FLOOD = "FLOOD"
    EARTHQUAKE = "EARTHQUAKE"
    LANDSLIDE = "LANDSLIDE"
    CYCLONE = "CYCLONE"
    INDUSTRIAL = "INDUSTRIAL"
    MEDICAL = "MEDICAL"
    OTHER = "OTHER"


class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"


class Incident(Base):
    __tablename__ = "incidents"
    __table_args__ = (
        CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_incidents_latitude"),
        CheckConstraint("longitude >= -180 AND longitude <= 180", name="ck_incidents_longitude"),
        Index("ix_incidents_created_by_id", "created_by_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(5000), nullable=False)
    incident_type: Mapped[str] = mapped_column(String(30), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default=text("'OPEN'"),
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
        onupdate=utc_now,
    )