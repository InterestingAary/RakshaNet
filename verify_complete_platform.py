import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parent / "backend" / ".env")
import requests
from sqlalchemy import select
from app.core.database import SessionLocal, engine


from app.core.security import hash_password
from app.models.user import User, ROLE_AUTHORITY

BASE_URL = "http://localhost:8000"

def ensure_authority_user():
    db = SessionLocal(bind=engine)
    try:
        user = db.scalar(select(User).where(User.email == "authority@rakshanet.org"))
        if not user:
            user = User(
                full_name="District Operations Authority",
                email="authority@rakshanet.org",
                hashed_password=hash_password("AuthorityPassword123!"),
                role=ROLE_AUTHORITY,
                is_active=True,
            )
            db.add(user)
            db.commit()
            print("  [SETUP] Created authority user in database")
        elif user.role != ROLE_AUTHORITY:
            user.role = ROLE_AUTHORITY
            db.commit()
            print("  [SETUP] Promoted user to authority role")
    finally:
        db.close()

def test_api():
    print("--- 1. Health Checks ---")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print("  [PASS] /health is healthy")

    r = requests.get(f"{BASE_URL}/health/db")
    assert r.status_code == 200, f"Database health check failed: {r.text}"
    print("  [PASS] /health/db connected to PostGIS")

    print("\n--- 2. Public Verified Hazards & Shelters ---")
    r = requests.get(f"{BASE_URL}/api/v1/hazards")
    assert r.status_code == 200, f"Hazards endpoint failed: {r.text}"
    hazards = r.json()
    print(f"  [PASS] /api/v1/hazards returned {len(hazards)} verified hazard zones")

    r = requests.get(f"{BASE_URL}/api/v1/shelters")
    assert r.status_code == 200, f"Shelters endpoint failed: {r.text}"
    shelters = r.json()
    print(f"  [PASS] /api/v1/shelters returned {len(shelters)} verified active shelters")

    print("\n--- 3. Blocked Roads Public List ---")
    r = requests.get(f"{BASE_URL}/api/v1/blocked-roads")
    assert r.status_code == 200, f"Blocked roads failed: {r.text}"
    blockages = r.json()
    print(f"  [PASS] /api/v1/blocked-roads returned {len(blockages)} verified blockages")

    print("\n--- 4. AI Decision Support Endpoints ---")
    r = requests.get(f"{BASE_URL}/api/v1/ai/model-status")
    assert r.status_code == 200, f"AI model status failed: {r.text}"
    model_status = r.json()
    assert model_status["available"] is True
    print(f"  [PASS] /api/v1/ai/model-status active: version {model_status['model_version']}")

    r = requests.post(f"{BASE_URL}/api/v1/ai/risk-assessment", json={
        "habitation_id": "HAB-KRISHNA-01",
        "hazard_severity": 0.88,
        "hazard_zone_intersection": True,
        "population": 1500,
        "vulnerable_population": 380,
        "road_accessibility": 0.3,
        "available_shelter_capacity": 300,
        "estimated_relocation_demand": 450
    })
    assert r.status_code == 200, f"AI risk assessment failed: {r.text}"
    risk_res = r.json()
    assert risk_res["result"]["risk_level"] in ("HIGH", "CRITICAL")
    assert risk_res["requires_human_review"] is True
    print(f"  [PASS] /api/v1/ai/risk-assessment: Level={risk_res['result']['risk_level']}, Confidence={risk_res['confidence']*100:.0f}%")

    r = requests.post(f"{BASE_URL}/api/v1/ai/classify-report", json={
        "report_id": "REP-9901",
        "report_text": "Bridge across canal is completely submerged and blocked with tree debris",
        "nearby_hazard": True
    })
    assert r.status_code == 200, f"AI report classify failed: {r.text}"
    classify_res = r.json()
    print(f"  [PASS] /api/v1/ai/classify-report: Predicted={classify_res['result']['predicted_category']}, Status={classify_res['verification_status']}")

    print("\n--- 5. Authentication & Authority Blocked-Road Lifecycle ---")
    ensure_authority_user()
    login_res = requests.post(f"{BASE_URL}/api/v1/auth/login", data={
        "username": "authority@rakshanet.org",
        "password": "AuthorityPassword123!"
    })
    assert login_res.status_code == 200, f"Authority login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("  [PASS] Authority authenticated successfully with OAuth2 token")

    # Report blockage
    report_res = requests.post(f"{BASE_URL}/api/v1/blocked-roads", headers=headers, json={
        "road_name": "Kaleswara Rao Market Link Road",
        "description": "Flash flooding has submerged the carriageway by 1 meter",
        "latitude": 16.5150,
        "longitude": 80.6250,
        "blockage_type": "FLOODED",
        "severity": "FULL_CLOSURE"
    })
    assert report_res.status_code == 201, f"Report blockage failed: {report_res.text}"
    blockage_id = report_res.json()["id"]
    print(f"  [PASS] Created blockage report: {blockage_id}")

    # Authority verifies blockage
    verify_res = requests.patch(f"{BASE_URL}/api/v1/blocked-roads/{blockage_id}/verify", headers=headers, json={
        "verification_notes": "Ground patrol confirmed full closure",
        "confidence_score": 0.95
    })
    assert verify_res.status_code == 200, f"Verify blockage failed: {verify_res.text}"
    assert verify_res.json()["status"] == "VERIFIED"
    print("  [PASS] Blockage verified by authority")

    # Check routing with avoidance
    route_res = requests.post(f"{BASE_URL}/api/v1/relocation/route", headers=headers, json={
        "origin_latitude": 16.5050,
        "origin_longitude": 80.6150,
        "destination_latitude": 16.5250,
        "destination_longitude": 80.6350,
        "avoid_hazards": True,
        "avoid_blocked_roads": True
    })
    assert route_res.status_code == 200, f"Route calculation failed: {route_res.text}"
    route_data = route_res.json()
    assert route_data["status"] == "SUCCESS"
    print(f"  [PASS] /api/v1/relocation/route: Distance={route_data['distance_km']}km, ETA={route_data['estimated_time_minutes']}min, Avoided={route_data['avoided_blocked_roads_count']} blockages")

    # Authority clears blockage
    clear_res = requests.patch(f"{BASE_URL}/api/v1/blocked-roads/{blockage_id}/clear", headers=headers, json={
        "clearance_notes": "Water drained and road debris removed by SDRF crew"
    })
    assert clear_res.status_code == 200, f"Clear blockage failed: {clear_res.text}"
    assert clear_res.json()["status"] == "CLEARED"
    assert clear_res.json()["cleared_at"] is not None
    print("  [PASS] Blockage cleared (status=CLEARED, cleared_at timestamp recorded)")

    # Check audit log
    audit_res = requests.get(f"{BASE_URL}/api/v1/blocked-roads/{blockage_id}/audit-logs", headers=headers)
    assert audit_res.status_code == 200, f"Audit log failed: {audit_res.text}"
    audit_logs = audit_res.json()
    assert len(audit_logs) >= 3, f"Expected at least 3 audit entries, got {len(audit_logs)}"
    print(f"  [PASS] Audit trail recorded {len(audit_logs)} lifecycle actions (REPORTED -> VERIFIED -> CLEARED)")

    print("\n=======================================================")
    print("ALL LIVE END-TO-END VERIFICATION CHECKS PASSED ON MAIN!")
    print("=======================================================")

if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"FAILED: {e}")
        sys.exit(1)
