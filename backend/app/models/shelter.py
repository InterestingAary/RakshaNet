import uuid
from datetime import datetime
from enum import Enum

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, CheckConstraint, DateTime, Float, ForeignKey, Index, Integer, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.user import utc_now


class ShelterStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class Shelter(Base):
    __tablename__ = "shelters"
    __table_args__ = (
        CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_shelters_latitude"),
        CheckConstraint("longitude >= -180 AND longitude <= 180", name="ck_shelters_longitude"),
        CheckConstraint("total_capacity > 0", name="ck_shelters_total_capacity_positive"),
        CheckConstraint("current_occupancy >= 0", name="ck_shelters_current_occupancy_non_negative"),
        CheckConstraint(
            "current_occupancy <= total_capacity",
            name="ck_shelters_current_occupancy_lte_total_capacity",
        ),
        Index("ix_shelters_created_by_id", "created_by_id"),
        Index("ix_shelters_status", "status"),
        Index("ix_shelters_verified", "verified"),
        Index("idx_shelters_geom", "geom", postgresql_using="gist"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(String(5000), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(Geometry(geometry_type="POINT", srid=4326, spatial_index=False), nullable=True)
    location: Mapped[str | None] = mapped_column(String(500), nullable=True)
    total_capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    current_occupancy: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        server_default=text("'ACTIVE'"),
    )
    verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
    )
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

