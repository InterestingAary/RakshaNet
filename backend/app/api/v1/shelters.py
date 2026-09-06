from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from geoalchemy2 import Geography
from sqlalchemy import cast, func, select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user, require_authority
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import ROLE_AUTHORITY, User
from app.schemas.shelter import (
    CitizenCoordinates,
    ShelterCreate,
    ShelterRecommendationResponse,
    ShelterResponse,
    ShelterUpdate,
    ShelterVerify,
    ShelterWithDistanceResponse,
)

router = APIRouter(prefix="/shelters", tags=["shelters"])

oauth2_optional_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)


def get_optional_user(
    token: str | None = Depends(oauth2_optional_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    try:
        user_id = decode_access_token(token)
        user = db.get(User, user_id)
        return user if user and user.is_active else None
    except Exception:
        return None


def find_shelter(shelter_id: UUID, db: Session) -> Shelter:
    shelter = db.get(Shelter, shelter_id)
    if shelter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shelter not found",
        )
    return shelter


# Public GET: Nearest Verified Available Shelter Recommendation using real PostGIS spatial distance
@router.get("/recommend", response_model=ShelterRecommendationResponse)
def recommend_shelter(
    latitude: float = Query(ge=-90.0, le=90.0, description="Citizen latitude (-90 to 90)"),
    longitude: float = Query(ge=-180.0, le=180.0, description="Citizen longitude (-180 to 180)"),
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
) -> ShelterRecommendationResponse:
    citizen_pt = func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)
    dist_expr = func.ST_Distance(
        cast(Shelter.geom, Geography),
        cast(citizen_pt, Geography),
    ).label("distance_meters")

    stmt = (
        select(Shelter, dist_expr)
        .where(
            Shelter.verified.is_(True),
            Shelter.status == ShelterStatus.ACTIVE,
            Shelter.current_occupancy < Shelter.total_capacity,
            Shelter.geom.isnot(None),
        )
        .order_by(dist_expr.asc())
        .limit(limit)
    )

    results = db.execute(stmt).all()

    available: list[ShelterWithDistanceResponse] = []
    for s, dist_m in results:
        dist_float = float(dist_m)
        s_dict = {c.name: getattr(s, c.name) for c in s.__table__.columns if c.name != "geom"}
        s_dict["available_capacity"] = s.total_capacity - s.current_occupancy
        s_dict["distance_meters"] = round(dist_float, 1)
        s_dict["distance_km"] = round(dist_float / 1000.0, 2)
        available.append(ShelterWithDistanceResponse(**s_dict))

    rec = available[0] if available else None
    return ShelterRecommendationResponse(
        recommended_shelter=rec,
        distance_meters=rec.distance_meters if rec else None,
        distance_km=rec.distance_km if rec else None,
        available_capacity=rec.available_capacity if rec else None,
        citizen_location=CitizenCoordinates(latitude=latitude, longitude=longitude),
        available_shelters=available,
    )


# Public GET: list verified active shelters (authorities may see all)
@router.get("", response_model=list[ShelterResponse])
@router.get("/", response_model=list[ShelterResponse])
def list_shelters(
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> list[Shelter]:
    query = select(Shelter).order_by(Shelter.created_at)
    if current_user is None or current_user.role != ROLE_AUTHORITY:
        # Public must ONLY see verified and active shelters
        query = query.where(
            Shelter.verified.is_(True),
            Shelter.status == ShelterStatus.ACTIVE,
        )
    return list(db.scalars(query).all())


# Authority POST: create shelter (defaults to verified=False)
@router.post("", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_data: ShelterCreate,
    _authority: User = Depends(require_authority),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Shelter:
    data = shelter_data.model_dump()
    geom_pt = func.ST_SetSRID(func.ST_MakePoint(shelter_data.longitude, shelter_data.latitude), 4326)

    shelter = Shelter(
        **data,
        geom=geom_pt,
        created_by_id=current_user.id,
        status=ShelterStatus.ACTIVE,
        verified=False,  # Creation is separated from verification
    )
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return shelter


# GET shelter details by ID
@router.get("/{shelter_id}", response_model=ShelterResponse)
def get_shelter(
    shelter_id: UUID,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> Shelter:
    shelter = find_shelter(shelter_id, db)
    # Non-authorities cannot view unverified shelters or inactive shelters
    is_authority = current_user is not None and current_user.role == ROLE_AUTHORITY
    if not is_authority:
        if not shelter.verified or shelter.status != ShelterStatus.ACTIVE:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shelter not found")
    return shelter


# Authority PATCH: update shelter attributes
@router.patch("/{shelter_id}", response_model=ShelterResponse)
def update_shelter(
    shelter_id: UUID,
    shelter_data: ShelterUpdate,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> Shelter:
    shelter = find_shelter(shelter_id, db)
    changes = shelter_data.model_dump(exclude_unset=True)

    new_total_capacity = changes.get("total_capacity", shelter.total_capacity)
    new_current_occupancy = changes.get("current_occupancy", shelter.current_occupancy)

    if new_total_capacity <= 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="total_capacity must be greater than 0",
        )
    if new_current_occupancy < 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="current_occupancy cannot be negative",
        )
    if new_current_occupancy > new_total_capacity:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="current_occupancy cannot exceed total_capacity",
        )

    for field, value in changes.items():
        setattr(shelter, field, value)

    # Update PostGIS geometry if coordinates changed
    if "latitude" in changes or "longitude" in changes:
        shelter.geom = func.ST_SetSRID(func.ST_MakePoint(shelter.longitude, shelter.latitude), 4326)

    db.commit()
    db.refresh(shelter)
    return shelter


# Authority PATCH: dedicated separate verification endpoint
@router.patch("/{shelter_id}/verify", response_model=ShelterResponse)
def verify_shelter(
    shelter_id: UUID,
    payload: ShelterVerify,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> Shelter:
    shelter = find_shelter(shelter_id, db)
    shelter.verified = payload.verified
    db.commit()
    db.refresh(shelter)
    return shelter


# Authority DELETE: remove shelter
@router.delete("/{shelter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shelter(
    shelter_id: UUID,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
):
    shelter = find_shelter(shelter_id, db)
    db.delete(shelter)
    db.commit()
    return None

