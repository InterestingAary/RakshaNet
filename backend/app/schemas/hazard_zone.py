from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MultiPolygonCoordinates(BaseModel):
    """Typed representation of a GeoJSON MultiPolygon coordinate structure.
    Coordinates structure: List[Polygon] where Polygon = List[LinearRing],
    and LinearRing = List[Tuple[float, float]] (lon, lat).
    """
    type: Literal["MultiPolygon"] = "MultiPolygon"
    coordinates: list[list[list[tuple[float, float]]]]

    @field_validator("coordinates")
    @classmethod
    def validate_multipolygon(cls, v: list) -> list:
        if not isinstance(v, list) or len(v) == 0:
            raise ValueError("Coordinates must be a non-empty list of polygons")

        for p_idx, polygon in enumerate(v):
            if not isinstance(polygon, list) or len(polygon) == 0:
                raise ValueError(f"Polygon {p_idx} must be a non-empty list of linear rings")

            for r_idx, ring in enumerate(polygon):
                if not isinstance(ring, list) or len(ring) < 4:
                    raise ValueError(
                        f"Linear ring {r_idx} in polygon {p_idx} must have at least 4 coordinate positions"
                    )

                for pt_idx, point in enumerate(ring):
                    if not (isinstance(point, (list, tuple))) or len(point) != 2:
                        raise ValueError(
                            f"Position {pt_idx} in ring {r_idx} of polygon {p_idx} must be a (lon, lat) pair"
                        )
                    lon, lat = point[0], point[1]
                    try:
                        lon = float(lon)
                        lat = float(lat)
                    except (TypeError, ValueError):
                        raise ValueError(f"Position coordinates must be valid numbers: ({lon}, {lat})")

                    if not (-180.0 <= lon <= 180.0):
                        raise ValueError(f"Longitude {lon} out of valid range [-180, 180]")
                    if not (-90.0 <= lat <= 90.0):
                        raise ValueError(f"Latitude {lat} out of valid range [-90, 90]")

                # GeoJSON standard: LinearRing must be closed (first == last)
                first_pt = ring[0]
                last_pt = ring[-1]
                if float(first_pt[0]) != float(last_pt[0]) or float(first_pt[1]) != float(last_pt[1]):
                    raise ValueError(
                        f"Linear ring {r_idx} in polygon {p_idx} must be closed (first coordinate must match last coordinate)"
                    )

        return v


class HazardZoneBase(BaseModel):
    disaster_id: UUID
    name: str = Field(min_length=1, max_length=200)
    severity: int = Field(ge=1, le=5)
    geometry: MultiPolygonCoordinates
    source: str | None = Field(default=None, max_length=500)


class HazardZoneCreate(HazardZoneBase):
    pass


class HazardZoneUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    severity: int | None = Field(default=None, ge=1, le=5)
    geometry: MultiPolygonCoordinates | None = None
    source: str | None = Field(default=None, max_length=500)


class HazardZoneVerify(BaseModel):
    verified: bool = True


class HazardZoneOut(HazardZoneBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    verified: bool
    created_at: datetime
    updated_at: datetime | None = None

