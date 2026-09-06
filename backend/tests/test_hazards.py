import json
import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.core.database import SessionLocal, engine
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.disaster import Disaster, DisasterSeverity, DisasterStatus, DisasterType
from app.models.hazard_zone import HazardZone
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User
from app.schemas.hazard_zone import (
    HazardZoneCreate,
    HazardZoneVerify,
    MultiPolygonCoordinates,
)

# Valid sample GeoJSON MultiPolygon coordinates
VALID_MULTIPOLYGON = {
    "type": "MultiPolygon",
    "coordinates": [
        [
            [
                [77.5900, 12.9700],
                [77.6000, 12.9700],
                [77.6000, 12.9800],
                [77.5900, 12.9800],
                [77.5900, 12.9700],
            ]
        ]
    ],
}


class TestMultiPolygonValidation(unittest.TestCase):
    """Strict schema-level validation tests for GeoJSON MultiPolygon."""

    def test_valid_multipolygon(self):
        geom = MultiPolygonCoordinates.model_validate(VALID_MULTIPOLYGON)
        self.assertEqual(geom.type, "MultiPolygon")
        self.assertEqual(len(geom.coordinates), 1)
        self.assertEqual(len(geom.coordinates[0][0]), 5)

    def test_reject_wrong_type(self):
        invalid = {
            "type": "Polygon",
            "coordinates": VALID_MULTIPOLYGON["coordinates"],
        }
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_empty_coordinates(self):
        invalid = {"type": "MultiPolygon", "coordinates": []}
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_empty_polygons(self):
        invalid = {"type": "MultiPolygon", "coordinates": [[]]}
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_unclosed_linear_ring(self):
        # Ring has 4 points, but first != last
        invalid = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [77.59, 12.97],
                        [77.60, 12.97],
                        [77.60, 12.98],
                        [77.59, 12.98],  # does not match first point [77.59, 12.97]
                    ]
                ]
            ],
        }
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_less_than_4_points_in_ring(self):
        invalid = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [77.59, 12.97],
                        [77.60, 12.97],
                        [77.59, 12.97],
                    ]
                ]
            ],
        }
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_invalid_position_dimension(self):
        # Point with only 1 coordinate
        invalid = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [77.59],
                        [77.60, 12.97],
                        [77.60, 12.98],
                        [77.59],
                    ]
                ]
            ],
        }
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_out_of_bounds_latitude(self):
        invalid = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [77.59, 95.0],  # Lat > 90
                        [77.60, 95.0],
                        [77.60, 96.0],
                        [77.59, 96.0],
                        [77.59, 95.0],
                    ]
                ]
            ],
        }
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_out_of_bounds_longitude(self):
        invalid = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [185.0, 12.97],  # Lon > 180
                        [186.0, 12.97],
                        [186.0, 12.98],
                        [185.0, 12.98],
                        [185.0, 12.97],
                    ]
                ]
            ],
        }
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)

    def test_reject_non_numeric_coordinates(self):
        invalid = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        ["invalid", 12.97],
                        [77.60, 12.97],
                        [77.60, 12.98],
                        ["invalid", 12.97],
                    ]
                ]
            ],
        }
        with self.assertRaises(ValidationError):
            MultiPolygonCoordinates.model_validate(invalid)


class TestHazardZoneAPI(unittest.TestCase):
    """Integration and Authorization tests for /api/v1/hazards against live Docker PostGIS."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal(bind=engine)

        # Create authority user
        cls.authority = User(
            full_name="Authority Officer",
            email=f"officer_{uuid4().hex[:8]}@rakshanet.gov.in",
            hashed_password=hash_password("officerPass123!"),
            role=ROLE_AUTHORITY,
            is_active=True,
        )
        # Create citizen user
        cls.citizen = User(
            full_name="Citizen User",
            email=f"citizen_{uuid4().hex[:8]}@example.com",
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

        # Create a test disaster
        cls.disaster = Disaster(
            title="Bangalore Flash Flood 2026",
            description="Severe flooding in low-lying zones",
            disaster_type=DisasterType.FLOOD.value,
            severity=DisasterSeverity.HIGH.value,
            status=DisasterStatus.ACTIVE.value,
            latitude=12.9716,
            longitude=77.5946,
            location="Bangalore Central",
            created_by_id=cls.authority.id,
        )
        cls.db.add(cls.disaster)
        cls.db.commit()
        cls.db.refresh(cls.disaster)

    @classmethod
    def tearDownClass(cls):
        try:
            cls.db.query(HazardZone).delete()
            cls.db.query(Disaster).delete()
            cls.db.query(User).filter(User.id.in_([cls.authority.id, cls.citizen.id])).delete(synchronize_session=False)
            cls.db.commit()
        finally:
            cls.db.close()

    def setUp(self):
        # Clean up hazard zones between tests
        self.db.query(HazardZone).delete()
        self.db.commit()

    # --- Authorization & Public Access Tests ---

    def test_public_get_returns_only_verified_zones(self):
        # Create one verified zone and one unverified zone via authority
        resp_unverified = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Unverified Inundation Zone",
                "severity": 3,
                "geometry": VALID_MULTIPOLYGON,
                "source": "Citizen Report Crowdsource",
            },
        )
        self.assertEqual(resp_unverified.status_code, 201)
        unverified_id = resp_unverified.json()["id"]

        resp_verified = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Verified Inundation Zone",
                "severity": 4,
                "geometry": VALID_MULTIPOLYGON,
                "source": "IMD Satellite Data",
            },
        )
        self.assertEqual(resp_verified.status_code, 201)
        verified_id = resp_verified.json()["id"]

        # Verify the second zone via dedicated verification endpoint
        verify_resp = self.client.patch(
            f"/api/v1/hazards/{verified_id}/verify",
            headers=self.authority_headers,
            json={"verified": True},
        )
        self.assertEqual(verify_resp.status_code, 200)
        self.assertTrue(verify_resp.json()["verified"])

        # Public GET without ANY authorization header
        public_resp = self.client.get("/api/v1/hazards")
        self.assertEqual(public_resp.status_code, 200)
        zones = public_resp.json()

        returned_ids = [z["id"] for z in zones]
        self.assertIn(verified_id, returned_ids)
        self.assertNotIn(unverified_id, returned_ids)

    def test_create_hazard_zone_unauthenticated_rejected(self):
        resp = self.client.post(
            "/api/v1/hazards",
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Unauthorized Zone",
                "severity": 3,
                "geometry": VALID_MULTIPOLYGON,
            },
        )
        self.assertEqual(resp.status_code, 401)

    def test_create_hazard_zone_citizen_forbidden(self):
        resp = self.client.post(
            "/api/v1/hazards",
            headers=self.citizen_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Citizen Created Zone",
                "severity": 2,
                "geometry": VALID_MULTIPOLYGON,
            },
        )
        self.assertEqual(resp.status_code, 403)
        self.assertIn("Authority role required", resp.json()["detail"])

    def test_create_hazard_zone_authority_success_defaults_unverified(self):
        resp = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "High Risk Flood Zone",
                "severity": 5,
                "geometry": VALID_MULTIPOLYGON,
                "source": "State Disaster Management Authority",
            },
        )
        self.assertEqual(resp.status_code, 201)
        data = resp.json()
        self.assertEqual(data["name"], "High Risk Flood Zone")
        self.assertEqual(data["severity"], 5)
        self.assertEqual(data["disaster_id"], str(self.disaster.id))
        self.assertFalse(data["verified"], "Zone must default to verified=False upon creation")
        self.assertEqual(data["geometry"]["type"], "MultiPolygon")
        self.assertEqual(len(data["geometry"]["coordinates"]), 1)

    def test_create_rejects_malformed_geometry_at_api_level(self):
        # Unclosed ring
        unclosed = {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [
                        [77.59, 12.97],
                        [77.60, 12.97],
                        [77.60, 12.98],
                        [77.59, 12.98],
                    ]
                ]
            ],
        }
        resp = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Malformed Zone",
                "severity": 3,
                "geometry": unclosed,
            },
        )
        self.assertEqual(resp.status_code, 422)

    def test_create_rejects_nonexistent_disaster(self):
        fake_disaster_id = str(uuid4())
        resp = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": fake_disaster_id,
                "name": "Orphan Zone",
                "severity": 3,
                "geometry": VALID_MULTIPOLYGON,
            },
        )
        self.assertEqual(resp.status_code, 404)

    # --- Separate Verification Tests ---

    def test_separate_verification_flow(self):
        # 1. Create zone (starts unverified)
        create_resp = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Evacuation Hazard Perimeter",
                "severity": 4,
                "geometry": VALID_MULTIPOLYGON,
            },
        )
        self.assertEqual(create_resp.status_code, 201)
        zone_id = create_resp.json()["id"]
        self.assertFalse(create_resp.json()["verified"])

        # 2. Zone is NOT present in public listing
        list_resp = self.client.get("/api/v1/hazards")
        self.assertEqual(list_resp.status_code, 200)
        self.assertNotIn(zone_id, [z["id"] for z in list_resp.json()])

        # 3. Unauthenticated verify rejected
        unauth_verify = self.client.patch(
            f"/api/v1/hazards/{zone_id}/verify",
            json={"verified": True},
        )
        self.assertEqual(unauth_verify.status_code, 401)

        # 4. Citizen verify rejected
        citizen_verify = self.client.patch(
            f"/api/v1/hazards/{zone_id}/verify",
            headers=self.citizen_headers,
            json={"verified": True},
        )
        self.assertEqual(citizen_verify.status_code, 403)

        # 5. Authority verifies zone
        auth_verify = self.client.patch(
            f"/api/v1/hazards/{zone_id}/verify",
            headers=self.authority_headers,
            json={"verified": True},
        )
        self.assertEqual(auth_verify.status_code, 200)
        self.assertTrue(auth_verify.json()["verified"])

        # 6. Now zone IS present in public listing
        list_resp_after = self.client.get("/api/v1/hazards")
        self.assertEqual(list_resp_after.status_code, 200)
        self.assertIn(zone_id, [z["id"] for z in list_resp_after.json()])

        # 7. Authority can unverify zone
        auth_unverify = self.client.patch(
            f"/api/v1/hazards/{zone_id}/verify",
            headers=self.authority_headers,
            json={"verified": False},
        )
        self.assertEqual(auth_unverify.status_code, 200)
        self.assertFalse(auth_unverify.json()["verified"])

        # 8. Zone disappears from public listing again
        list_resp_final = self.client.get("/api/v1/hazards")
        self.assertEqual(list_resp_final.status_code, 200)
        self.assertNotIn(zone_id, [z["id"] for z in list_resp_final.json()])

    # --- CRUD Update and Delete Tests ---

    def test_update_hazard_zone_authorization(self):
        # Create zone
        create_resp = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Zone A",
                "severity": 2,
                "geometry": VALID_MULTIPOLYGON,
            },
        )
        zone_id = create_resp.json()["id"]

        # Citizen cannot update
        cit_update = self.client.put(
            f"/api/v1/hazards/{zone_id}",
            headers=self.citizen_headers,
            json={"name": "Zone A Updated by Citizen"},
        )
        self.assertEqual(cit_update.status_code, 403)

        # Authority can update
        auth_update = self.client.put(
            f"/api/v1/hazards/{zone_id}",
            headers=self.authority_headers,
            json={"name": "Zone A Expanded", "severity": 4},
        )
        self.assertEqual(auth_update.status_code, 200)
        self.assertEqual(auth_update.json()["name"], "Zone A Expanded")
        self.assertEqual(auth_update.json()["severity"], 4)

    def test_delete_hazard_zone_authorization(self):
        # Create zone
        create_resp = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Temporary Hazard Zone",
                "severity": 1,
                "geometry": VALID_MULTIPOLYGON,
            },
        )
        zone_id = create_resp.json()["id"]

        # Citizen cannot delete
        cit_delete = self.client.delete(
            f"/api/v1/hazards/{zone_id}",
            headers=self.citizen_headers,
        )
        self.assertEqual(cit_delete.status_code, 403)

        # Authority can delete
        auth_delete = self.client.delete(
            f"/api/v1/hazards/{zone_id}",
            headers=self.authority_headers,
        )
        self.assertEqual(auth_delete.status_code, 204)

        # Confirm deleted
        get_resp = self.client.get(f"/api/v1/hazards/{zone_id}")
        self.assertEqual(get_resp.status_code, 404)


if __name__ == "__main__":
    unittest.main()
