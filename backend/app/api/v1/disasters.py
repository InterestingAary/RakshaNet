from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user, require_authority
from app.core.database import get_db
from app.models.disaster import Disaster, DisasterStatus
from app.models.user import ROLE_AUTHORITY, User
from app.schemas.disaster import DisasterCreate, DisasterResponse, DisasterUpdate

router = APIRouter(prefix="/disasters", tags=["disasters"])

ALLOWED_STATUS_TRANSITIONS = {
    DisasterStatus.DRAFT: {DisasterStatus.ACTIVE, DisasterStatus.CANCELLED},
    DisasterStatus.ACTIVE: {DisasterStatus.RESOLVED, DisasterStatus.CANCELLED},
    DisasterStatus.RESOLVED: set(),
    DisasterStatus.CANCELLED: set(),
}


def find_disaster(disaster_id: UUID, db: Session) -> Disaster:
    disaster = db.get(Disaster, disaster_id)
    if disaster is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disaster not found",
        )
    return disaster


def visible_to_user(disaster: Disaster, current_user: User) -> bool:
    return (
        current_user.role == ROLE_AUTHORITY
        or disaster.status == DisasterStatus.ACTIVE
    )


@router.post("", response_model=DisasterResponse, status_code=status.HTTP_201_CREATED)
def create_disaster(
    disaster_data: DisasterCreate,
    _authority: User = Depends(require_authority),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Disaster:
    disaster = Disaster(
        **disaster_data.model_dump(),
        created_by_id=current_user.id,
    )
    db.add(disaster)
    db.commit()
    db.refresh(disaster)
    return disaster


@router.get("", response_model=list[DisasterResponse])
def list_disasters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Disaster]:
    query = select(Disaster).order_by(Disaster.created_at)
    if current_user.role != ROLE_AUTHORITY:
        query = query.where(Disaster.status == DisasterStatus.ACTIVE)
    return list(db.scalars(query).all())


@router.get("/{disaster_id}", response_model=DisasterResponse)
def get_disaster(
    disaster_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Disaster:
    disaster = find_disaster(disaster_id, db)
    if not visible_to_user(disaster, current_user):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Disaster not found")
    return disaster


@router.patch("/{disaster_id}", response_model=DisasterResponse)
def update_disaster(
    disaster_id: UUID,
    disaster_data: DisasterUpdate,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> Disaster:
    disaster = find_disaster(disaster_id, db)
    changes = disaster_data.model_dump(exclude_unset=True)
    requested_status = changes.get("status")
    if requested_status is not None and requested_status != disaster.status:
        allowed_statuses = ALLOWED_STATUS_TRANSITIONS.get(disaster.status, set())
        if requested_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot change disaster status from {disaster.status} to {requested_status}",
            )

    for field, value in changes.items():
        setattr(disaster, field, value)
    db.commit()
    db.refresh(disaster)
    return disaster