from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user, require_authority
from app.core.database import get_db
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import ROLE_AUTHORITY, User
from app.schemas.shelter import ShelterCreate, ShelterResponse, ShelterUpdate

router = APIRouter(prefix="/shelters", tags=["shelters"])


def find_shelter(shelter_id: UUID, db: Session) -> Shelter:
    shelter = db.get(Shelter, shelter_id)
    if shelter is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shelter not found",
        )
    return shelter


def visible_to_user(shelter: Shelter, current_user: User) -> bool:
    return current_user.role == ROLE_AUTHORITY or shelter.status == ShelterStatus.ACTIVE


@router.post("", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_data: ShelterCreate,
    _authority: User = Depends(require_authority),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Shelter:
    shelter = Shelter(
        **shelter_data.model_dump(),
        created_by_id=current_user.id,
        status=ShelterStatus.ACTIVE,
    )
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return shelter


@router.get("", response_model=list[ShelterResponse])
def list_shelters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Shelter]:
    query = select(Shelter).order_by(Shelter.created_at)
    if current_user.role != ROLE_AUTHORITY:
        query = query.where(Shelter.status == ShelterStatus.ACTIVE)
    return list(db.scalars(query).all())


@router.get("/{shelter_id}", response_model=ShelterResponse)
def get_shelter(
    shelter_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Shelter:
    shelter = find_shelter(shelter_id, db)
    if not visible_to_user(shelter, current_user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Shelter not found")
    return shelter


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
    if new_total_capacity < new_current_occupancy:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="total_capacity cannot be lower than current_occupancy",
        )

    for field, value in changes.items():
        setattr(shelter, field, value)

    db.commit()
    db.refresh(shelter)
    return shelter
