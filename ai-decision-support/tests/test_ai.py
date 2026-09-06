from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_high_risk_requires_review_and_is_advisory():
    payload = {"habitation_id": "HAB-001", "hazard_severity": 0.9, "hazard_zone_intersection": True, "population": 500, "vulnerable_population": 140, "road_accessibility": 0.2, "available_shelter_capacity": 20, "estimated_relocation_demand": 150}
    result = client.post("/ai/risk-assessment", json=payload)
    assert result.status_code == 200
    body = result.json()
    assert body["result"]["risk_level"] in ("HIGH", "CRITICAL")
    assert body["requires_human_review"] is True
    assert "evacuation" not in str(body).lower()


def test_missing_features_reduce_confidence_and_can_be_unknown():
    body = client.post("/ai/risk-assessment", json={"habitation_id": "HAB-002"}).json()
    assert body["result"]["risk_level"] == "UNKNOWN"
    assert body["confidence"] < 0.65
    assert body["data_quality"]["missing_features"]


def test_invalid_population_is_rejected():
    result = client.post("/ai/risk-assessment", json={"habitation_id": "HAB-003", "population": -1})
    assert result.status_code == 422


def test_capacity_shortage_and_unknown_capacity():
    payload = {"habitation_id": "HAB-004", "hazard_severity": 0.8, "hazard_zone_intersection": True, "population": 100, "vulnerable_population": 50, "estimated_relocation_demand": 80, "shelter": {"total_capacity": 100, "current_occupancy": 70, "verified": True, "accessible": True, "operational": True, "route_available": True, "data_freshness_hours": 2}}
    body = client.post("/ai/relocation-priority", json=payload).json()
    assert body["result"]["capacity_gap"] == 50
    assert body["result"]["capacity_unknown"] is False
    unknown = client.post("/ai/relocation-priority", json={"habitation_id": "HAB-005"}).json()
    assert unknown["result"]["capacity_unknown"] is True
    assert unknown["result"]["data_stale"] is True
    assert unknown["result"]["requires_authority_verification"] is True


def test_report_is_pending_review_even_with_high_confidence():
    body = client.post("/ai/classify-report", json={"report_id": "REP-001", "report_text": "The road is blocked by flood water", "nearby_hazard": True}).json()
    assert body["result"]["predicted_category"] == "BLOCKED_ROAD"
    assert body["result"]["verification_status"] == "PENDING_REVIEW"
    assert body["requires_human_review"] is True


def test_model_status_and_validation():
    assert client.get("/ai/model-status").json()["model_version"] == "rule-baseline-v1"
    result = client.post("/ai/risk-assessment", json={"habitation_id": "H", "latitude": 91})
    assert result.status_code == 422