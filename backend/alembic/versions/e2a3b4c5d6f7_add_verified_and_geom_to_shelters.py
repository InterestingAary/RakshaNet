"""add verified and geom to shelters

Revision ID: e2a3b4c5d6f7
Revises: d1f2c3e4b5f6
Create Date: 2026-09-06 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry


# revision identifiers, used by Alembic.
revision: str = "e2a3b4c5d6f7"
down_revision: Union[str, Sequence[str], None] = "d1f2c3e4b5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "shelters",
        sa.Column("verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "shelters",
        sa.Column("geom", Geometry(geometry_type="POINT", srid=4326, spatial_index=False), nullable=True),
    )
    op.execute(
        "UPDATE shelters SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) "
        "WHERE latitude IS NOT NULL AND longitude IS NOT NULL;"
    )
    op.create_index("ix_shelters_verified", "shelters", ["verified"], unique=False)
    op.create_index("idx_shelters_geom", "shelters", ["geom"], postgresql_using="gist")


def downgrade() -> None:
    op.drop_index("idx_shelters_geom", table_name="shelters")
    op.drop_index("ix_shelters_verified", table_name="shelters")
    op.drop_column("shelters", "geom")
    op.drop_column("shelters", "verified")
