"""create shelters table

Revision ID: 5e1b9d0f7e2a
Revises: 2a6c11d0648c
Create Date: 2026-08-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "5e1b9d0f7e2a"
down_revision: Union[str, Sequence[str], None] = "2a6c11d0648c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shelters",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=5000), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("location", sa.String(length=500), nullable=True),
        sa.Column("total_capacity", sa.Integer(), nullable=False),
        sa.Column("current_occupancy", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), server_default=sa.text("'ACTIVE'"), nullable=False),
        sa.Column("created_by_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.CheckConstraint("latitude >= -90 AND latitude <= 90", name="ck_shelters_latitude"),
        sa.CheckConstraint("longitude >= -180 AND longitude <= 180", name="ck_shelters_longitude"),
        sa.CheckConstraint("total_capacity > 0", name="ck_shelters_total_capacity_positive"),
        sa.CheckConstraint("current_occupancy >= 0", name="ck_shelters_current_occupancy_non_negative"),
        sa.CheckConstraint(
            "current_occupancy <= total_capacity",
            name="ck_shelters_current_occupancy_lte_total_capacity",
        ),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_shelters_created_by_id", "shelters", ["created_by_id"], unique=False)
    op.create_index("ix_shelters_status", "shelters", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_shelters_status", table_name="shelters")
    op.drop_index("ix_shelters_created_by_id", table_name="shelters")
    op.drop_table("shelters")
