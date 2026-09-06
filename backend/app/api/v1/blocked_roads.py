from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user, require_authority
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.blocked_road import (
    AuditAction,
    BlockageSeverity,
    BlockageType,
    BlockedRoad,
    BlockedRoadAuditLog,
    BlockedRoadStatus,
)
from app.models.disaster import Disaster
from app.models.user import ROLE_AUTHORITY, User, utc_now
from app.schemas.blocked_road import (
    BlockedRoadAuditLogResponse,
    BlockedRoadClear,
    BlockedRoadCreate,
    BlockedRoadResponse,
    BlockedRoadUpdate,
    BlockedRoadVerify,
)

router = APIRouter(prefix="/blocked-roads", tags=["blocked-roads"])

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


def find_blocked_road(road_id: UUID, db: Session) -> BlockedRoad:
    road = db.get(BlockedRoad, road_id)
    if road is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blocked road report not found",
        )
    return road


# 1. POST: Report a road blockage (Citizens or Authorities)
@router.post("", response_model=BlockedRoadResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=BlockedRoadResponse, status_code=status.HTTP_201_CREATED)
def report_blocked_road(
    payload: BlockedRoadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BlockedRoad:
    if payload.disaster_id:
        disaster = db.get(Disaster, payload.disaster_id)
        if not disaster:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Disaster with id '{payload.disaster_id}' not found",
            )

    data = payload.model_dump()
    geom_pt = func.ST_SetSRID(func.ST_MakePoint(payload.longitude, payload.latitude), 4326)

    road = BlockedRoad(
        **data,
        geom=geom_pt,
        reported_by_id=current_user.id,
        status=BlockedRoadStatus.REPORTED.value,
        verified=False,  # Strict safeguard: creation is separate from verification
    )
    db.add(road)
    db.flush()

    # Initial audit log
    audit = BlockedRoadAuditLog(
        blocked_road_id=road.id,
        changed_by_id=current_user.id,
        action=AuditAction.REPORTED.value,
        previous_status=None,
        new_status=BlockedRoadStatus.REPORTED.value,
        notes=f"Initial road blockage report submitted by {current_user.full_name}",
    )
    db.add(audit)
    db.commit()
    db.refresh(road)
    return road


# 2. GET: List blocked roads (Public: verified active only; Authority: can view all)
@router.get("", response_model=list[BlockedRoadResponse])
@router.get("/", response_model=list[BlockedRoadResponse])
def list_blocked_roads(
    status_filter: BlockedRoadStatus | None = Query(default=None, alias="status"),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> list[BlockedRoad]:
    query = select(BlockedRoad).order_by(BlockedRoad.created_at.desc())
    is_authority = current_user is not None and current_user.role == ROLE_AUTHORITY

    if not is_authority:
        # Public must ONLY see verified blockages that are actively blocking routes
        query = query.where(
            BlockedRoad.verified.is_(True),
            BlockedRoad.status == BlockedRoadStatus.VERIFIED.value,
        )
    else:
        if status_filter is not None:
            query = query.where(BlockedRoad.status == status_filter.value)

    return list(db.scalars(query).all())


# 3. GET: Retrieve single blocked road details
@router.get("/{road_id}", response_model=BlockedRoadResponse)
def get_blocked_road(
    road_id: UUID,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
) -> BlockedRoad:
    road = find_blocked_road(road_id, db)
    is_authority = current_user is not None and current_user.role == ROLE_AUTHORITY

    if not is_authority:
        if not road.verified or road.status != BlockedRoadStatus.VERIFIED.value:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Blocked road report not found",
            )
    return road


# 4. PATCH: Dedicated verification endpoint (Authority only)
@router.patch("/{road_id}/verify", response_model=BlockedRoadResponse)
def verify_blocked_road(
    road_id: UUID,
    payload: BlockedRoadVerify,
    authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> BlockedRoad:
    road = find_blocked_road(road_id, db)
    prev_status = road.status

    if payload.verified:
        road.verified = True
        road.status = BlockedRoadStatus.VERIFIED.value
        road.verified_by_id = authority.id
        road.verified_at = datetime.now(timezone.utc)
        action = AuditAction.VERIFIED.value
        default_note = "Road blockage verified by emergency authority."
    else:
        road.verified = False
        road.status = BlockedRoadStatus.REJECTED.value
        action = AuditAction.REJECTED.value
        default_note = "Road blockage rejected / determined clear by authority."

    audit = BlockedRoadAuditLog(
        blocked_road_id=road.id,
        changed_by_id=authority.id,
        action=action,
        previous_status=prev_status,
        new_status=road.status,
        notes=payload.notes or default_note,
    )
    db.add(audit)
    db.commit()
    db.refresh(road)
    return road


# 5. PATCH: Dedicated clearance endpoint (Authority only)
@router.patch("/{road_id}/clear", response_model=BlockedRoadResponse)
def clear_blocked_road(
    road_id: UUID,
    payload: BlockedRoadClear,
    authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> BlockedRoad:
    road = find_blocked_road(road_id, db)
    prev_status = road.status

    road.status = BlockedRoadStatus.CLEARED.value
    road.cleared_at = datetime.now(timezone.utc)

    audit = BlockedRoadAuditLog(
        blocked_road_id=road.id,
        changed_by_id=authority.id,
        action=AuditAction.CLEARED.value,
        previous_status=prev_status,
        new_status=BlockedRoadStatus.CLEARED.value,
        notes=payload.notes or "Road obstacle cleared and route reopened for traffic.",
    )
    db.add(audit)
    db.commit()
    db.refresh(road)
    return road


# 6. PATCH: Update road blockage attributes (Authority only)
@router.patch("/{road_id}", response_model=BlockedRoadResponse)
def update_blocked_road(
    road_id: UUID,
    payload: BlockedRoadUpdate,
    authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> BlockedRoad:
    road = find_blocked_road(road_id, db)
    prev_status = road.status
    changes = payload.model_dump(exclude_unset=True)

    for field, value in changes.items():
        if field in ("blockage_type", "severity") and value is not None:
            setattr(road, field, value.value if hasattr(value, "value") else str(value))
        else:
            setattr(road, field, value)

    if "latitude" in changes or "longitude" in changes:
        road.geom = func.ST_SetSRID(func.ST_MakePoint(road.longitude, road.latitude), 4326)

    audit = BlockedRoadAuditLog(
        blocked_road_id=road.id,
        changed_by_id=authority.id,
        action=AuditAction.STATUS_UPDATED.value,
        previous_status=prev_status,
        new_status=road.status,
        notes=f"Updated attributes: {', '.join(changes.keys())}",
    )
    db.add(audit)
    db.commit()
    db.refresh(road)
    return road


# 7. DELETE: Remove road blockage (Authority only)
@router.delete("/{road_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blocked_road(
    road_id: UUID,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
):
    road = find_blocked_road(road_id, db)
    db.delete(road)
    db.commit()
    return None


# 8. GET: Inspect audit logs for a road blockage (Authority only)
@router.get("/{road_id}/audit-logs", response_model=list[BlockedRoadAuditLogResponse])
def get_blocked_road_audit_logs(
    road_id: UUID,
    _authority: User = Depends(require_authority),
    db: Session = Depends(get_db),
) -> list[BlockedRoadAuditLog]:
    road = find_blocked_road(road_id, db)
    stmt = (
        select(BlockedRoadAuditLog)
        .where(BlockedRoadAuditLog.blocked_road_id == road.id)
        .order_by(BlockedRoadAuditLog.created_at.desc())
    )
    return list(db.scalars(stmt).all())
