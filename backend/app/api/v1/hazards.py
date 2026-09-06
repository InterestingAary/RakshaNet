import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from geoalchemy2 import Geography
from sqlalchemy import cast, func, select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user, require_authority
from app.core.database import get_db
from app.models.disaster import Disaster
from app.models.hazard_zone import HazardZone
from app.models.user import ROLE_AUTHORITY, User
from app.schemas.exposure import CitizenCoordinates, ExposureHazardZone, ExposureResponse
from app.schemas.hazard_zone import (
    HazardZoneCreate,
    HazardZoneOut,
    HazardZoneUpdate,
    HazardZoneVerify,
    MultiPolygonCoordinates,
)

router = APIRouter(prefix="/hazards", tags=["hazards"])


def _calculate_exposure(coords: CitizenCoordinates, db: Session) -> ExposureResponse:
    citizen_pt = func.ST_SetSRID(func.ST_MakePoint(coords.longitude, coords.latitude), 4326)
    dist_expr = func.ST_Distance(
        cast(HazardZone.geometry, Geography),
        cast(citizen_pt, Geography),
    ).label("distance_meters")

    # Strictly check ONLY verified hazard zones
    intersecting_stmt = (
        select(HazardZone, dist_expr)
        .where(
            HazardZone.verified.is_(True),
            func.ST_Intersects(HazardZone.geometry, citizen_pt),
        )
        .order_by(HazardZone.severity.desc())
    )
    intersecting_results = db.execute(intersecting_stmt).all()

    if intersecting_results:
        matched_zones: list[ExposureHazardZone] = []
        for hz, dist in intersecting_results:
            matched_zones.append(
                ExposureHazardZone(
                    id=hz.id,
                    disaster_id=hz.disaster_id,
                    name=hz.name,
                    severity=hz.severity,
                    source=hz.source,
                    distance_meters=round(float(dist), 1),
                )
            )
        highest_sev = max(z.severity for z in matched_zones)
        return ExposureResponse(
            is_exposed=True,
            citizen_location=coords,
            hazard_zones=matched_zones,
            highest_severity=highest_sev,
            nearest_hazard_distance_meters=0.0,
            message=f"Warning: You are inside {len(matched_zones)} verified hazard zone(s). Immediate evacuation recommended.",
        )

    # If not inside any verified hazard zone, find distance to nearest verified hazard zone
    nearest_stmt = (
        select(dist_expr)
        .where(HazardZone.verified.is_(True))
        .order_by(dist_expr.asc())
        .limit(1)
    )
    nearest_dist = db.execute(nearest_stmt).scalar_one_or_none()
    dist_float = round(float(nearest_dist), 1) if nearest_dist is not None else None

    return ExposureResponse(
        is_exposed=False,
        citizen_location=coords,
        hazard_zones=[],
        highest_severity=None,
        nearest_hazard_distance_meters=dist_float,
        message="You are currently outside all verified hazard zones.",
    )


# Public POST: Citizen exposure detection
@router.post("/exposure", response_model=ExposureResponse)
def check_citizen_exposure_post(
    coords: CitizenCoordinates,
    db: Session = Depends(get_db),
) -> ExposureResponse:
    return _calculate_exposure(coords, db)


# Public GET: Citizen exposure detection via query parameters
@router.get("/exposure", response_model=ExposureResponse)
def check_citizen_exposure_get(
    latitude: float = Query(ge=-90.0, le=90.0, description="Citizen latitude (-90 to 90)"),
    longitude: float = Query(ge=-180.0, le=180.0, description="Citizen longitude (-180 to 180)"),
    db: Session = Depends(get_db),
) -> ExposureResponse:
    return _calculate_exposure(CitizenCoordinates(latitude=latitude, longitude=longitude), db)



def _to_hazard_zone_out(hz: HazardZone, geojson_str: str) -> HazardZoneOut:
    geom_data = json.loads(geojson_str)
    return HazardZoneOut(
        id=hz.id,
        disaster_id=hz.disaster_id,
        name=hz.name,
        severity=hz.severity,
        geometry=MultiPolygonCoordinates.model_validate(geom_data),
        source=hz.source,
        verified=hz.verified,
        created_at=hz.created_at,
        updated_at=hz.updated_at,
    )


# Public GET: list verified zones only
@router.get("", response_model=list[HazardZoneOut])
@router.get("/", response_model=list[HazardZoneOut])
def list_hazard_zones(
    disaster_id: UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    stmt = select(
        HazardZone,
        func.ST_AsGeoJSON(HazardZone.geometry).label("geojson"),
    ).where(HazardZone.verified.is_(True))

    if disaster_id is not None:
        stmt = stmt.where(HazardZone.disaster_id == disaster_id)

    stmt = stmt.order_by(HazardZone.created_at.desc())
    results = db.execute(stmt).all()

    return [_to_hazard_zone_out(hz, geojson) for hz, geojson in results]


# Authority GET: get single hazard zone
@router.get("/{zone_id}", response_model=HazardZoneOut)
def get_hazard_zone(
    zone_id: UUID,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(lambda: None),
):
    stmt = select(
        HazardZone,
        func.ST_AsGeoJSON(HazardZone.geometry).label("geojson"),
    ).where(HazardZone.id == zone_id)
    result = db.execute(stmt).first()

    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hazard zone not found")

    hz, geojson = result
    return _to_hazard_zone_out(hz, geojson)


# Authority POST: create a new hazard zone (separate creation from verification: verified defaults to False)
@router.post("", response_model=HazardZoneOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=HazardZoneOut, status_code=status.HTTP_201_CREATED)
def create_hazard_zone(
    payload: HazardZoneCreate,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
):
    disaster = db.get(Disaster, payload.disaster_id)
    if not disaster:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Disaster with id '{payload.disaster_id}' not found",
        )

    geom_json_str = payload.geometry.model_dump_json()

    hz = HazardZone(
        disaster_id=payload.disaster_id,
        name=payload.name,
        severity=payload.severity,
        geometry=func.ST_SetSRID(func.ST_GeomFromGeoJSON(geom_json_str), 4326),
        source=payload.source,
        verified=False,  # Creation is separated from verification
    )
    db.add(hz)
    db.commit()
    db.refresh(hz)

    geojson = db.execute(
        select(func.ST_AsGeoJSON(hz.geometry))
    ).scalar_one()

    return _to_hazard_zone_out(hz, geojson)


# Authority PUT: update hazard zone attributes
@router.put("/{zone_id}", response_model=HazardZoneOut)
def update_hazard_zone(
    zone_id: UUID,
    payload: HazardZoneUpdate,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
):
    hz = db.get(HazardZone, zone_id)
    if not hz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hazard zone not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "geometry" and value is not None:
            geom_json_str = payload.geometry.model_dump_json()
            hz.geometry = func.ST_SetSRID(func.ST_GeomFromGeoJSON(geom_json_str), 4326)
        else:
            setattr(hz, field, value)

    db.commit()
    db.refresh(hz)

    geojson = db.execute(
        select(func.ST_AsGeoJSON(hz.geometry))
    ).scalar_one()

    return _to_hazard_zone_out(hz, geojson)


# Authority PATCH: separate verification endpoint
@router.patch("/{zone_id}/verify", response_model=HazardZoneOut)
def verify_hazard_zone(
    zone_id: UUID,
    payload: HazardZoneVerify,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
):
    hz = db.get(HazardZone, zone_id)
    if not hz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hazard zone not found")

    hz.verified = payload.verified
    db.commit()
    db.refresh(hz)

    geojson = db.execute(
        select(func.ST_AsGeoJSON(hz.geometry))
    ).scalar_one()

    return _to_hazard_zone_out(hz, geojson)


# Authority DELETE: remove hazard zone
@router.delete("/{zone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hazard_zone(
    zone_id: UUID,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
):
    hz = db.get(HazardZone, zone_id)
    if not hz:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hazard zone not found")

    db.delete(hz)
    db.commit()
    return None

