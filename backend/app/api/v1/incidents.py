from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.models.incident import Incident
from app.models.user import ROLE_AUTHORITY, User
from app.schemas.incident import IncidentCreate, IncidentResponse, IncidentUpdate

router = APIRouter(prefix="/incidents", tags=["incidents"])


def find_incident(incident_id: UUID, db: Session) -> Incident:
    incident = db.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident not found",
        )
    return incident


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_data: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Incident:
    incident = Incident(
        **incident_data.model_dump(),
        created_by_id=current_user.id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("", response_model=list[IncidentResponse])
def list_incidents(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Incident]:
    return list(db.scalars(select(Incident).order_by(Incident.created_at)).all())


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: UUID,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Incident:
    return find_incident(incident_id, db)


@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: UUID,
    incident_data: IncidentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Incident:
    incident = find_incident(incident_id, db)
    if incident.created_by_id != current_user.id and current_user.role != ROLE_AUTHORITY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the incident creator or an authority can update this incident",
        )

    for field, value in incident_data.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)
    db.commit()
    db.refresh(incident)
    return incident