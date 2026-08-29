from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.models.report import Report, ReportStatus
from app.models.user import ROLE_AUTHORITY, User
from app.schemas.report import ReportCreate, ReportResponse, ReportUpdate

router = APIRouter(prefix="/reports", tags=["reports"])

ALLOWED_STATUS_TRANSITIONS = {
    ReportStatus.OPEN: {ReportStatus.UNDER_REVIEW, ReportStatus.RESOLVED, ReportStatus.REJECTED},
    ReportStatus.UNDER_REVIEW: {ReportStatus.RESOLVED, ReportStatus.REJECTED},
    ReportStatus.RESOLVED: set(),
    ReportStatus.REJECTED: set(),
}


def find_report(report_id: UUID, db: Session) -> Report:
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
    return report


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Report:
    report = Report(
        **report_data.model_dump(),
        created_by_id=current_user.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=list[ReportResponse])
def list_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Report]:
    if current_user.role != ROLE_AUTHORITY:
        return list(db.scalars(select(Report).order_by(Report.created_at)).all())
    return list(db.scalars(select(Report).order_by(Report.created_at)).all())


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: UUID,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Report:
    return find_report(report_id, db)


@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: UUID,
    report_data: ReportUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Report:
    report = find_report(report_id, db)
    if report.created_by_id != current_user.id and current_user.role != ROLE_AUTHORITY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the report owner or an authority can update this report",
        )

    changes = report_data.model_dump(exclude_unset=True)
    requested_status = changes.get("status")
    if requested_status is not None and requested_status != report.status:
        allowed_statuses = ALLOWED_STATUS_TRANSITIONS.get(report.status, set())
        if requested_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Cannot change report status from {report.status} to {requested_status}",
            )

    for field, value in changes.items():
        setattr(report, field, value)
    db.commit()
    db.refresh(report)
    return report
