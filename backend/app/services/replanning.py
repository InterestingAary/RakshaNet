import math
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.disaster import Disaster, DisasterStatus
from app.models.incident import Incident, IncidentSeverity, IncidentStatus
from app.models.report import Report, ReportStatus
from app.models.shelter import Shelter, ShelterStatus


SEVERITY_WEIGHTS = {
    IncidentSeverity.LOW: 1,
    IncidentSeverity.MEDIUM: 2,
    IncidentSeverity.HIGH: 4,
    IncidentSeverity.CRITICAL: 6,
}

INCIDENT_STATUS_WEIGHTS = {
    IncidentStatus.OPEN: 2,
    IncidentStatus.IN_PROGRESS: 2,
    IncidentStatus.RESOLVED: 0,
    IncidentStatus.CANCELLED: 0,
}

REPORT_STATUS_WEIGHTS = {
    ReportStatus.OPEN: 2,
    ReportStatus.UNDER_REVIEW: 2,
    ReportStatus.RESOLVED: 0,
    ReportStatus.REJECTED: 0,
}


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


def available_capacity(shelter: Shelter) -> int:
    return shelter.total_capacity - shelter.current_occupancy


def _distance_to_shelter(latitude: float, longitude: float, shelter: Shelter) -> float:
    return haversine_km(latitude, longitude, shelter.latitude, shelter.longitude)


def _incident_risk_score(incident: Incident, shelter: Shelter) -> tuple[int, str | None]:
    if incident.latitude is None or incident.longitude is None:
        return 0, None

    distance_km = haversine_km(shelter.latitude, shelter.longitude, incident.latitude, incident.longitude)
    if distance_km > 10:
        return 0, None

    severity_weight = SEVERITY_WEIGHTS.get(IncidentSeverity(incident.severity), 0)
    status_weight = INCIDENT_STATUS_WEIGHTS.get(IncidentStatus(incident.status), 0)
    total = severity_weight + status_weight

    if total <= 0:
        return 0, None

    if abs(incident.latitude - shelter.latitude) < 1e-9 and abs(incident.longitude - shelter.longitude) < 1e-9:
        return total, "nearby_incident_at_shelter"

    return total, "nearby_incident"


def _report_risk_score(report: Report, shelter: Shelter) -> tuple[int, str | None]:
    if report.latitude is None or report.longitude is None:
        return 0, None

    distance_km = haversine_km(shelter.latitude, shelter.longitude, report.latitude, report.longitude)
    if distance_km > 8:
        return 0, None

    status_weight = REPORT_STATUS_WEIGHTS.get(ReportStatus(report.status), 0)
    if status_weight <= 0:
        return 0, None

    return status_weight, "nearby_open_report"


def evaluate_shelter_risk(db: Session, shelter: Shelter, latitude: float, longitude: float) -> tuple[int, list[str]]:
    incidents = list(db.scalars(select(Incident)).all())
    reports = list(db.scalars(select(Report)).all())

    risk_score = 0
    risk_flags: list[str] = []

    for incident in incidents:
        incident_score, flag = _incident_risk_score(incident, shelter)
        if incident_score and flag:
            risk_score += incident_score
            risk_flags.append(flag)

    for report in reports:
        report_score, flag = _report_risk_score(report, shelter)
        if report_score and flag:
            risk_score += report_score
            risk_flags.append(flag)

    from app.models.blocked_road import BlockedRoad, BlockedRoadStatus
    blocked_roads = list(db.scalars(
        select(BlockedRoad).where(
            BlockedRoad.verified.is_(True),
            BlockedRoad.status == BlockedRoadStatus.VERIFIED.value
        )
    ).all())
    
    for road in blocked_roads:
        # Penalize shelters that are very close to a verified blocked road (e.g. 500m)
        dist_km = haversine_km(shelter.latitude, shelter.longitude, road.latitude, road.longitude)
        if dist_km < 0.5:
            risk_score += 10
            risk_flags.append("BLOCKED_ROAD_DETECTED")

    deduped = []
    for flag in risk_flags:
        if flag not in deduped:
            deduped.append(flag)

    return risk_score, deduped


def build_relocation_recommendation(
    db: Session,
    latitude: float,
    longitude: float,
    disaster_id: UUID | None = None,
) -> dict:
    if disaster_id is not None:
        disaster = db.get(Disaster, disaster_id)
        if disaster is None or disaster.status != DisasterStatus.ACTIVE:
            raise ValueError("Disaster not found")

    shelters = list(db.scalars(select(Shelter).where(Shelter.status == ShelterStatus.ACTIVE)).all())
    candidates = []

    for shelter in shelters:
        shelter_capacity = available_capacity(shelter)
        if shelter_capacity <= 0:
            continue

        distance_km = _distance_to_shelter(latitude, longitude, shelter)
        risk_score, risk_flags = evaluate_shelter_risk(db, shelter, latitude, longitude)

        candidates.append(
            {
                "shelter": shelter,
                "distance_km": distance_km,
                "available_capacity": shelter_capacity,
                "risk_score": risk_score,
                "risk_flags": risk_flags,
                "recommendation_reason": "nearest_eligible_shelter",
            }
        )

    if not candidates:
        raise ValueError("No eligible shelters")

    candidates.sort(
        key=lambda item: (
            item["distance_km"],
            item["risk_score"],
            -item["available_capacity"],
            item["shelter"].name.lower(),
        )
    )

    best = candidates[0]
    if best["risk_score"] > 0:
        best["recommendation_reason"] = "nearest_eligible_shelter_with_risk_adjustment"

    return {
        "shelter_id": best["shelter"].id,
        "shelter_name": best["shelter"].name,
        "distance_km": round(best["distance_km"], 3),
        "available_capacity": best["available_capacity"],
        "risk_flags": best["risk_flags"],
        "risk_score": best["risk_score"],
        "recommendation_reason": best["recommendation_reason"],
        "latitude": best["shelter"].latitude,
        "longitude": best["shelter"].longitude,
        "disaster_id": str(disaster_id) if disaster_id is not None else None,
    }
