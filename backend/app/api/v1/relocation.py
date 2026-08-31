import math
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.models.disaster import Disaster, DisasterStatus
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import User
from app.schemas.replanning import ReplanningRecommendation
from app.schemas.relocation import RelocationRecommendation, RelocationRequest
from app.services.replanning import build_relocation_recommendation

router = APIRouter(prefix="/relocation", tags=["relocation"])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371.0
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


@router.post("/recommend", response_model=RelocationRecommendation)
def recommend_shelter(
    request_data: RelocationRequest,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RelocationRecommendation:
    if request_data.disaster_id is not None:
        disaster = db.get(Disaster, request_data.disaster_id)
        if disaster is None or disaster.status != DisasterStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Disaster not found",
            )

    query = select(Shelter).where(Shelter.status == ShelterStatus.ACTIVE)
    shelters = list(db.scalars(query).all())
    eligible = []
    for shelter in shelters:
        available_capacity = shelter.total_capacity - shelter.current_occupancy
        if available_capacity <= 0:
            continue
        distance_km = haversine_km(
            request_data.latitude,
            request_data.longitude,
            shelter.latitude,
            shelter.longitude,
        )
        eligible.append(
            {
                "shelter": shelter,
                "distance_km": distance_km,
                "available_capacity": available_capacity,
            }
        )

    if not eligible:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No suitable shelter with available capacity was found",
        )

    eligible.sort(
        key=lambda item: (
            item["distance_km"],
            -item["available_capacity"],
        )
    )
    best = eligible[0]
    shelter = best["shelter"]
    return RelocationRecommendation(
        shelter_id=shelter.id,
        shelter_name=shelter.name,
        distance_km=round(best["distance_km"], 3),
        available_capacity=best["available_capacity"],
        latitude=shelter.latitude,
        longitude=shelter.longitude,
    )


@router.post("/refresh", response_model=ReplanningRecommendation)
def refresh_relocation_recommendation(
    request_data: RelocationRequest,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    try:
        recommendation = build_relocation_recommendation(
            db,
            request_data.latitude,
            request_data.longitude,
            request_data.disaster_id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    return recommendation
