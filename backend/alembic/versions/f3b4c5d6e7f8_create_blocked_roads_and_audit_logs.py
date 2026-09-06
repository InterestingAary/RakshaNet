"""create blocked_roads and audit_logs tables

Revision ID: f3b4c5d6e7f8
Revises: e2a3b4c5d6f7
Create Date: 2026-09-06 21:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "f3b4c5d6e7f8"
down_revision: Union[str, Sequence[str], None] = "e2a3b4c5d6f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create blocked_roads table
    op.create_table(
        "blocked_roads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("disaster_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("disasters.id", ondelete="SET NULL"), nullable=True),
        sa.Column("road_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.String(length=2000), nullable=False),
        sa.Column("blockage_type", sa.String(length=50), nullable=False, server_default="OTHER"),
        sa.Column("severity", sa.String(length=30), nullable=False, server_default="FULL_CLOSURE"),
        sa.Column("status", sa.String(length=30), nullable=False, server_default="REPORTED"),
        sa.Column("verified", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=False), nullable=True),
        sa.Column("reported_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("verified_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("cleared_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_blocked_roads_latitude"),
        sa.CheckConstraint("longitude >= -180 AND longitude <= 180", name="ck_blocked_roads_longitude"),
    )
    op.create_index("ix_blocked_roads_status", "blocked_roads", ["status"], unique=False)
    op.create_index("ix_blocked_roads_verified", "blocked_roads", ["verified"], unique=False)
    op.create_index("ix_blocked_roads_disaster_id", "blocked_roads", ["disaster_id"], unique=False)
    op.create_index("idx_blocked_roads_geom", "blocked_roads", ["geom"], postgresql_using="gist")

    # 2. Create blocked_road_audit_logs table
    op.create_table(
        "blocked_road_audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("blocked_road_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("blocked_roads.id", ondelete="CASCADE"), nullable=False),
        sa.Column("changed_by_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("action", sa.String(length=50), nullable=False),
        sa.Column("previous_status", sa.String(length=30), nullable=True),
        sa.Column("new_status", sa.String(length=30), nullable=False),
        sa.Column("notes", sa.String(length=1000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )
    op.create_index("ix_blocked_road_audit_road_id", "blocked_road_audit_logs", ["blocked_road_id"], unique=False)
    op.create_index("ix_blocked_road_audit_created_at", "blocked_road_audit_logs", ["created_at"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_blocked_road_audit_created_at", table_name="blocked_road_audit_logs")
    op.drop_index("ix_blocked_road_audit_road_id", table_name="blocked_road_audit_logs")
    op.drop_table("blocked_road_audit_logs")

    op.drop_index("idx_blocked_roads_geom", table_name="blocked_roads")
    op.drop_index("ix_blocked_roads_disaster_id", table_name="blocked_roads")
    op.drop_index("ix_blocked_roads_verified", table_name="blocked_roads")
    op.drop_index("ix_blocked_roads_status", table_name="blocked_roads")
    op.drop_table("blocked_roads")
