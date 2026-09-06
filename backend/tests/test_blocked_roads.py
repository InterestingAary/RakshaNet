import unittest
from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.database import SessionLocal, engine
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.blocked_road import (
    AuditAction,
    BlockageSeverity,
    BlockageType,
    BlockedRoad,
    BlockedRoadAuditLog,
    BlockedRoadStatus,
)
from app.models.disaster import Disaster, DisasterSeverity, DisasterStatus, DisasterType
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User


class TestBlockedRoadAPI(unittest.TestCase):
    """Integration, Authorization, and Audit tests for /api/v1/blocked-roads."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal(bind=engine)

        cls.authority = User(
            full_name="Officer Ramanathan",
            email=f"officer_{uuid4().hex[:8]}@rakshanet.gov.in",
            hashed_password=hash_password("officerPass123!"),
            role=ROLE_AUTHORITY,
            is_active=True,
        )
        cls.citizen = User(
            full_name="Citizen Suresh",
            email=f"suresh_{uuid4().hex[:8]}@example.com",
            hashed_password=hash_password("citizenPass123!"),
            role=ROLE_CITIZEN,
            is_active=True,
        )
        cls.db.add(cls.authority)
        cls.db.add(cls.citizen)
        cls.db.commit()
        cls.db.refresh(cls.authority)
        cls.db.refresh(cls.citizen)

        cls.authority_token = create_access_token(cls.authority.id)
        cls.citizen_token = create_access_token(cls.citizen.id)

        cls.authority_headers = {"Authorization": f"Bearer {cls.authority_token}"}
        cls.citizen_headers = {"Authorization": f"Bearer {cls.citizen_token}"}

        cls.disaster = Disaster(
            title="Monsoon Urban Flash Flood 2026",
            description="Severe waterlogging on arterial roads",
            disaster_type=DisasterType.FLOOD.value,
            severity=DisasterSeverity.HIGH.value,
            status=DisasterStatus.ACTIVE.value,
            latitude=16.5062,
            longitude=80.6480,
            location="Vijayawada Central",
            created_by_id=cls.authority.id,
        )
        cls.db.add(cls.disaster)
        cls.db.commit()
        cls.db.refresh(cls.disaster)

    @classmethod
    def tearDownClass(cls):
        try:
            cls.db.query(BlockedRoadAuditLog).delete()
            cls.db.query(BlockedRoad).delete()
            cls.db.query(Disaster).delete()
            cls.db.query(User).filter(User.id.in_([cls.authority.id, cls.citizen.id])).delete(synchronize_session=False)
            cls.db.commit()
        finally:
            cls.db.close()

    def setUp(self):
        self.db.query(BlockedRoadAuditLog).delete()
        self.db.query(BlockedRoad).delete()
        self.db.commit()

    # 1. Coordinate & Schema Validation Tests
    def test_coordinate_validation(self):
        bad_coords = [
            {"lat": 91.0, "lon": 80.0},
            {"lat": -91.0, "lon": 80.0},
            {"lat": 16.0, "lon": 181.0},
            {"lat": 16.0, "lon": -181.0},
        ]
        for coord in bad_coords:
            resp = self.client.post(
                "/api/v1/blocked-roads",
                headers=self.citizen_headers,
                json={
                    "road_name": "Test Road",
                    "description": "Flooded sector",
                    "latitude": coord["lat"],
                    "longitude": coord["lon"],
                },
            )
            self.assertEqual(resp.status_code, 422)

    def test_blank_fields_rejected(self):
        resp = self.client.post(
            "/api/v1/blocked-roads",
            headers=self.citizen_headers,
            json={
                "road_name": "   ",
                "description": "Valid description",
                "latitude": 16.5,
                "longitude": 80.6,
            },
        )
        self.assertEqual(resp.status_code, 422)

    # 2. Citizen Reporting & Default State Tests
    def test_citizen_can_report_road_blockage(self):
        payload = {
            "road_name": "Governorpet High Street",
            "description": "Fallen banyan tree and electric pole blocking both lanes",
            "blockage_type": BlockageType.TREE_FALL.value,
            "severity": BlockageSeverity.FULL_CLOSURE.value,
            "latitude": 16.5120,
            "longitude": 80.6250,
            "disaster_id": str(self.disaster.id),
        }
        res = self.client.post("/api/v1/blocked-roads", headers=self.citizen_headers, json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["road_name"], "Governorpet High Street")
        self.assertEqual(data["status"], BlockedRoadStatus.REPORTED.value)
        self.assertFalse(data["verified"], "New report must default to verified=False")
        self.assertEqual(data["reported_by_id"], str(self.citizen.id))
        self.assertIsNone(data["verified_by_id"])

        # Initial audit log must exist
        road_id = data["id"]
        logs = self.db.query(BlockedRoadAuditLog).filter_by(blocked_road_id=road_id).all()
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].action, AuditAction.REPORTED.value)

    # 3. Public Visibility & Zero Unverified Leakage
    def test_public_cannot_see_unverified_blockages(self):
        # Create unverified blockage
        self.client.post(
            "/api/v1/blocked-roads",
            headers=self.citizen_headers,
            json={
                "road_name": "Unverified Flooded Alley",
                "description": "Reported waterlogging",
                "latitude": 16.5150,
                "longitude": 80.6280,
            },
        )
        # Public GET must return empty
        pub_resp = self.client.get("/api/v1/blocked-roads")
        self.assertEqual(pub_resp.status_code, 200)
        self.assertEqual(len(pub_resp.json()), 0)

        # Authority can see unverified report
        auth_resp = self.client.get("/api/v1/blocked-roads", headers=self.authority_headers)
        self.assertEqual(auth_resp.status_code, 200)
        self.assertEqual(len(auth_resp.json()), 1)

    # 4. Authority Verification Workflow
    def test_authority_verification_and_rejection(self):
        create_res = self.client.post(
            "/api/v1/blocked-roads",
            headers=self.citizen_headers,
            json={
                "road_name": "MG Road Underpass",
                "description": "Standing water 1.5 meters deep",
                "latitude": 16.5080,
                "longitude": 80.6350,
            },
        )
        road_id = create_res.json()["id"]

        # Citizen cannot verify (403)
        citizen_verify = self.client.patch(
            f"/api/v1/blocked-roads/{road_id}/verify",
            headers=self.citizen_headers,
            json={"verified": True},
        )
        self.assertEqual(citizen_verify.status_code, 403)

        # Authority verifies report
        auth_verify = self.client.patch(
            f"/api/v1/blocked-roads/{road_id}/verify",
            headers=self.authority_headers,
            json={"verified": True, "notes": "Confirmed by traffic patrol drone"},
        )
        self.assertEqual(auth_verify.status_code, 200)
        verified_data = auth_verify.json()
        self.assertTrue(verified_data["verified"])
        self.assertEqual(verified_data["status"], BlockedRoadStatus.VERIFIED.value)
        self.assertEqual(verified_data["verified_by_id"], str(self.authority.id))
        self.assertIsNotNone(verified_data["verified_at"])

        # Public CAN now see verified blockage
        pub_after = self.client.get("/api/v1/blocked-roads")
        self.assertEqual(pub_after.status_code, 200)
        self.assertEqual(len(pub_after.json()), 1)
        self.assertEqual(pub_after.json()[0]["id"], road_id)

    # 5. Road Clearance Workflow
    def test_authority_clearance_workflow(self):
        create_res = self.client.post(
            "/api/v1/blocked-roads",
            headers=self.authority_headers,
            json={
                "road_name": "Ring Road Flyover",
                "description": "Fallen signage board",
                "latitude": 16.5200,
                "longitude": 80.6400,
            },
        )
        road_id = create_res.json()["id"]

        # Verify first
        self.client.patch(
            f"/api/v1/blocked-roads/{road_id}/verify",
            headers=self.authority_headers,
            json={"verified": True},
        )

        # Authority marks cleared
        clear_res = self.client.patch(
            f"/api/v1/blocked-roads/{road_id}/clear",
            headers=self.authority_headers,
            json={"notes": "Signage removed and debris cleared by crane unit"},
        )
        self.assertEqual(clear_res.status_code, 200)
        cleared_data = clear_res.json()
        self.assertEqual(cleared_data["status"], BlockedRoadStatus.CLEARED.value)
        self.assertIsNotNone(cleared_data["cleared_at"])

        # Cleared roads no longer appear in active public list
        pub_list = self.client.get("/api/v1/blocked-roads").json()
        self.assertEqual(len(pub_list), 0)

        # Authority can query cleared roads
        auth_cleared = self.client.get(
            "/api/v1/blocked-roads?status=CLEARED",
            headers=self.authority_headers,
        ).json()
        self.assertEqual(len(auth_cleared), 1)

    # 6. Audit Trail History
    def test_audit_log_history(self):
        create_res = self.client.post(
            "/api/v1/blocked-roads",
            headers=self.citizen_headers,
            json={
                "road_name": "Canal Bund Road",
                "description": "Embankment breach and mudslide",
                "latitude": 16.5100,
                "longitude": 80.6300,
            },
        )
        road_id = create_res.json()["id"]

        self.client.patch(
            f"/api/v1/blocked-roads/{road_id}/verify",
            headers=self.authority_headers,
            json={"verified": True, "notes": "Breach inspected by engineer"},
        )
        self.client.patch(
            f"/api/v1/blocked-roads/{road_id}/clear",
            headers=self.authority_headers,
            json={"notes": "Bund reinforced and road cleared"},
        )

        # Fetch audit logs as authority
        audit_res = self.client.get(
            f"/api/v1/blocked-roads/{road_id}/audit-logs",
            headers=self.authority_headers,
        )
        self.assertEqual(audit_res.status_code, 200)
        logs = audit_res.json()
        self.assertEqual(len(logs), 3)
        actions = [log["action"] for log in logs]
        self.assertIn(AuditAction.REPORTED.value, actions)
        self.assertIn(AuditAction.VERIFIED.value, actions)
        self.assertIn(AuditAction.CLEARED.value, actions)


if __name__ == "__main__":
    unittest.main()
