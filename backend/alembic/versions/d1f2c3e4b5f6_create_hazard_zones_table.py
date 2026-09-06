"""create hazard zones table"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision = "d1f2c3e4b5f6"
down_revision = "6df2b9ef5f10"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "hazard_zones",
        sa.Column("id", sa.UUID(), primary_key=True, nullable=False),
        sa.Column("disaster_id", sa.UUID(), sa.ForeignKey("disasters.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(length=200), nullable=False),
        sa.Column("severity", sa.Integer(), nullable=False),
        sa.Column("geometry", Geometry(geometry_type="MULTIPOLYGON", srid=4326), nullable=False),
        sa.Column("source", sa.String(length=500), nullable=True),
        sa.Column("verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
    )
    op.create_index("ix_hazard_zones_disaster_id", "hazard_zones", ["disaster_id"], unique=False)
    op.create_index("ix_hazard_zones_verified", "hazard_zones", ["verified"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_hazard_zones_verified", table_name="hazard_zones")
    op.drop_index("ix_hazard_zones_disaster_id", table_name="hazard_zones")
    op.drop_table("hazard_zones")
