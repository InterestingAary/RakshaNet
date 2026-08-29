"""create reports table

Revision ID: 6df2b9ef5f10
Revises: 5e1b9d0f7e2a
Create Date: 2026-08-29 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "6df2b9ef5f10"
down_revision: Union[str, Sequence[str], None] = "5e1b9d0f7e2a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "reports",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.String(length=5000), nullable=False),
        sa.Column("report_type", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=30), server_default=sa.text("'OPEN'"), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("location", sa.String(length=500), nullable=True),
        sa.Column("created_by_id", sa.UUID(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.CheckConstraint("latitude IS NULL OR (latitude >= -90 AND latitude <= 90)", name="ck_reports_latitude"),
        sa.CheckConstraint("longitude IS NULL OR (longitude >= -180 AND longitude <= 180)", name="ck_reports_longitude"),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reports_created_by_id", "reports", ["created_by_id"], unique=False)
    op.create_index("ix_reports_status", "reports", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_reports_status", table_name="reports")
    op.drop_index("ix_reports_created_by_id", table_name="reports")
    op.drop_table("reports")
