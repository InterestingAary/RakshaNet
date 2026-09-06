import uuid
from datetime import datetime
from enum import Enum

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, CheckConstraint, DateTime, Float, ForeignKey, Index, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.user import utc_now


class BlockageType(str, Enum):
    FLOODED = "FLOODED"
    DEBRIS = "DEBRIS"
    COLLAPSED = "COLLAPSED"
    TREE_FALL = "TREE_FALL"
    INFRASTRUCTURE_DAMAGE = "INFRASTRUCTURE_DAMAGE"
    OTHER = "OTHER"


class BlockageSeverity(str, Enum):
    PARTIAL = "PARTIAL"
    FULL_CLOSURE = "FULL_CLOSURE"
    IMPASSABLE = "IMPASSABLE"


class BlockedRoadStatus(str, Enum):
    REPORTED = "REPORTED"
    VERIFIED = "VERIFIED"
    CLEARED = "CLEARED"
    REJECTED = "REJECTED"


class AuditAction(str, Enum):
    REPORTED = "REPORTED"
    VERIFIED = "VERIFIED"
    STATUS_UPDATED = "STATUS_UPDATED"
    CLEARED = "CLEARED"
    REJECTED = "REJECTED"


class BlockedRoad(Base):
    __tablename__ = "blocked_roads"
    __table_args__ = (
        CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_blocked_roads_latitude"),
        CheckConstraint("longitude >= -180 AND longitude <= 180", name="ck_blocked_roads_longitude"),
        Index("ix_blocked_roads_status", "status"),
        Index("ix_blocked_roads_verified", "verified"),
        Index("ix_blocked_roads_disaster_id", "disaster_id"),
        Index("idx_blocked_roads_geom", "geom", postgresql_using="gist"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    disaster_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("disasters.id", ondelete="SET NULL"),
        nullable=True,
    )
    road_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    blockage_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default=BlockageType.OTHER.value,
    )
    severity: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default=BlockageSeverity.FULL_CLOSURE.value,
    )
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        server_default=text("'REPORTED'"),
    )
    verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        server_default=text("false"),
    )
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    geom = mapped_column(
        Geometry(geometry_type="POINT", srid=4326, spatial_index=False),
        nullable=True,
    )
    reported_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    verified_by_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    verified_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    cleared_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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

    audit_logs = relationship(
        "BlockedRoadAuditLog",
        back_populates="blocked_road",
        cascade="all, delete-orphan",
        order_by="BlockedRoadAuditLog.created_at.desc()",
    )


class BlockedRoadAuditLog(Base):
    __tablename__ = "blocked_road_audit_logs"
    __table_args__ = (
        Index("ix_blocked_road_audit_road_id", "blocked_road_id"),
        Index("ix_blocked_road_audit_created_at", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    blocked_road_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("blocked_roads.id", ondelete="CASCADE"),
        nullable=False,
    )
    changed_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    previous_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    new_status: Mapped[str] = mapped_column(String(30), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("CURRENT_TIMESTAMP"),
    )

    blocked_road = relationship("BlockedRoad", back_populates="audit_logs")
