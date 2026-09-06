from collections.abc import Iterable

from .config import LOW_CONFIDENCE_THRESHOLD, MODEL_VERSION
from .schemas import DataQuality, HazardType, RelocationRequest, ReportRequest, RiskLevel, RiskRequest, ShelterData


def _quality(request: RiskRequest, fields: Iterable[str]) -> DataQuality:
    missing = [field for field in fields if getattr(request, field) is None]
    stale = []
    warnings = []
    if request.data_freshness_hours is not None and request.data_freshness_hours > 24:
        stale.append("hazard_and_demographic_features")
        warnings.append("Input data is older than 24 hours")
    if request.source_reliability is not None and request.source_reliability < 0.5:
        warnings.append("Source reliability is below the prototype threshold")
    return DataQuality(missing_features=missing, stale_features=stale, source_warnings=warnings)


def _capacity(shelter: ShelterData | None, demand: int | None) -> tuple[int | None, int | None, list[str], bool]:
    if shelter is None or shelter.total_capacity is None or shelter.current_occupancy is None:
        return None, None, ["Shelter capacity is unknown and requires authority verification"], True
    available = max(0, shelter.total_capacity - shelter.current_occupancy - shelter.reserved_emergency_capacity)
    gap = None if demand is None else max(0, demand - available)
    reasons = []
    needs_review = False
    if gap and gap > 0:
        reasons.append("Estimated relocation demand exceeds verified available capacity")
    if not shelter.verified or not shelter.operational or not shelter.accessible or not shelter.route_available or shelter.inside_hazard_zone:
        reasons.append("Shelter suitability requires authority verification")
        needs_review = True
    if shelter.data_freshness_hours is None or shelter.data_freshness_hours > 24:
        reasons.append("Shelter data is missing or stale")
        needs_review = True
    return available, gap, reasons, needs_review


def assess_risk(request: RiskRequest) -> dict:
    required = ("hazard_severity", "hazard_zone_intersection", "population", "vulnerable_population", "road_accessibility", "available_shelter_capacity")
    quality = _quality(request, required)
    score = 0.0
    reasons = []
    if request.hazard_severity is not None:
        score += 0.40 * request.hazard_severity
        if request.hazard_severity >= 0.7: reasons.append("High reported hazard severity")
    if request.hazard_zone_intersection:
        score += 0.25; reasons.append("Habitation intersects the active hazard zone")
    if request.vulnerable_population is not None and request.population:
        ratio = min(1, request.vulnerable_population / request.population)
        score += 0.15 * ratio
        if ratio >= 0.25: reasons.append("Large vulnerable-population share")
    if request.road_accessibility is not None:
        score += 0.10 * (1 - request.road_accessibility)
        if request.road_accessibility < 0.4: reasons.append("Limited road accessibility")
    if request.available_shelter_capacity is not None and request.estimated_relocation_demand:
        if request.available_shelter_capacity < request.estimated_relocation_demand:
            score += 0.10; reasons.append("Available shelter capacity is below estimated demand")
    if not reasons and quality.missing_features:
        reasons.append("Insufficient evidence for a confident risk assessment")
    score = round(min(1, score), 3)
    confidence = round(max(0.25, 0.95 - 0.08 * len(quality.missing_features) - (0.15 if quality.stale_features else 0)), 3)
    if len(quality.missing_features) >= 4: level = RiskLevel.UNKNOWN
    elif score >= 0.8: level = RiskLevel.CRITICAL
    elif score >= 0.55: level = RiskLevel.HIGH
    elif score >= 0.3: level = RiskLevel.MODERATE
    else: level = RiskLevel.LOW
    review = level in (RiskLevel.HIGH, RiskLevel.CRITICAL, RiskLevel.UNKNOWN) or confidence < LOW_CONFIDENCE_THRESHOLD or bool(quality.stale_features)
    return {"result": {"habitation_id": request.habitation_id, "risk_level": level, "risk_score": score, "priority": "URGENT_REVIEW" if review else "MONITOR", "reasons": reasons}, "confidence": confidence, "explanation": reasons, "data_quality": quality, "requires_human_review": review, "model_version": MODEL_VERSION}


def assess_relocation(request: RelocationRequest) -> dict:
    risk = assess_risk(request)
    available, gap, capacity_reasons, capacity_review = _capacity(request.shelter, request.estimated_relocation_demand)
    data_stale = request.shelter is None or request.shelter.data_freshness_hours is None or request.shelter.data_freshness_hours > 24
    score = risk["result"]["risk_score"]
    if gap and request.estimated_relocation_demand:
        score = min(1, score + min(0.2, gap / request.estimated_relocation_demand * 0.2))
    if score >= 0.8: priority = "P1"
    elif score >= 0.55: priority = "P2"
    elif score >= 0.3: priority = "P3"
    else: priority = "P4"
    reasons = list(risk["explanation"]) + capacity_reasons
    review = risk["requires_human_review"] or capacity_review
    return {"result": {"habitation_id": request.habitation_id, "relocation_priority": priority, "priority_score": round(score, 3), "recommended_action": "IMMEDIATE_AUTHORITY_REVIEW" if priority == "P1" else "AUTHORITY_ASSESSMENT", "reasons": reasons, "estimated_demand": request.estimated_relocation_demand, "available_capacity": available, "capacity_gap": gap, "capacity_unknown": available is None, "data_stale": data_stale, "requires_authority_verification": review}, "confidence": risk["confidence"], "explanation": reasons, "data_quality": risk["data_quality"], "requires_human_review": review, "model_version": MODEL_VERSION}


def classify_report(request: ReportRequest) -> dict:
    text = request.report_text.lower()
    keywords = {"BLOCKED_ROAD": ("road", "blocked", "traffic"), "FLOODING": ("flood", "water", "inundated"), "LANDSLIDE": ("landslide", "mudslide"), "DAMAGED_BRIDGE": ("bridge", "collapsed"), "SHELTER_OVERFLOW": ("shelter", "full", "overflow"), "FIRE": ("fire", "smoke", "burning"), "BUILDING_DAMAGE": ("building", "crack", "collapsed house"), "MEDICAL_EMERGENCY": ("injury", "ambulance", "medical")}
    matches = [(category, sum(word in text for word in words)) for category, words in keywords.items()]
    category, count = max(matches, key=lambda item: item[1])
    if count == 0: category, confidence = "OTHER", 0.35
    else: confidence = min(0.92, 0.58 + count * 0.1)
    reasons = [f"Report text contains indicators associated with {category.replace('_', ' ').lower()}"]
    if request.nearby_hazard: reasons.append("Location is near a reported active hazard")
    if request.previous_reports_same_area and request.previous_reports_same_area > 0: reasons.append("Other reports exist in the same area")
    if request.image_available: reasons.append("Image is available but has not been treated as confirmed evidence")
    if confidence < LOW_CONFIDENCE_THRESHOLD: reasons.append("Classification confidence is low")
    return {"result": {"report_id": request.report_id, "predicted_category": category, "severity": "HIGH" if request.nearby_hazard or category in ("MEDICAL_EMERGENCY", "FIRE") else "MODERATE", "verification_status": "PENDING_REVIEW", "recommended_action": "AUTHORITY_VERIFICATION"}, "confidence": confidence, "explanation": reasons, "data_quality": DataQuality(), "requires_human_review": True, "model_version": MODEL_VERSION}