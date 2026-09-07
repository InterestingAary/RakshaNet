from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user, require_authority
from app.core.database import get_db
from app.models.blocked_road import BlockedRoad
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


@router.get("/{disaster_id}/timeline")
def get_disaster_timeline(
    disaster_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    disaster = find_disaster(disaster_id, db)
    events = [
        {
            "id": f"evt-{disaster.id}",
            "timestamp": disaster.created_at.isoformat() if hasattr(disaster, "created_at") and disaster.created_at else "",
            "type": "event_created",
            "title": f"Emergency Declared: {disaster.title}",
            "description": disaster.description,
            "severity": str(disaster.severity).lower(),
            "relatedEntityId": str(disaster.id),
            "relatedEntityType": "disaster",
        }
    ]

    try:
        roads = list(db.scalars(select(BlockedRoad).where(BlockedRoad.disaster_id == disaster.id)).all())
        for road in roads:
            if hasattr(road, "created_at") and road.created_at:
                events.append({
                    "id": f"block-{road.id}",
                    "timestamp": road.created_at.isoformat(),
                    "type": "route_blocked",
                    "title": f"Road Obstruction: {road.road_name}",
                    "description": road.description,
                    "severity": str(road.severity).lower(),
                    "relatedEntityId": str(road.id),
                    "relatedEntityType": "blocked_road",
                })
            if hasattr(road, "verified_at") and road.verified_at:
                events.append({
                    "id": f"verified-{road.id}",
                    "timestamp": road.verified_at.isoformat(),
                    "type": "alert_issued",
                    "title": f"Obstruction Verified: {road.road_name}",
                    "description": "Patrol verified closure. Route avoided.",
                    "severity": "high",
                    "relatedEntityId": str(road.id),
                    "relatedEntityType": "blocked_road",
                })
            if hasattr(road, "cleared_at") and road.cleared_at:
                events.append({
                    "id": f"cleared-{road.id}",
                    "timestamp": road.cleared_at.isoformat(),
                    "type": "incident_resolved",
                    "title": f"Road Cleared: {road.road_name}",
                    "description": "Roadway reopened for normal evacuation traffic.",
                    "severity": "low",
                    "relatedEntityId": str(road.id),
                    "relatedEntityType": "blocked_road",
                })
    except Exception:
        pass

    events.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    return events