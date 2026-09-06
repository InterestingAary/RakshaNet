import json
import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.core.database import SessionLocal, engine
from app.core.security import create_access_token, hash_password
from app.main import app
from app.models.disaster import Disaster, DisasterSeverity, DisasterStatus, DisasterType
from app.models.hazard_zone import HazardZone
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User

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


class TestExposureAndShelterRecommendation(unittest.TestCase):
    """Integration and PostGIS spatial tests for Phase 2C: Exposure and Shelter Recommendation."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)
        cls.db = SessionLocal(bind=engine)

        cls.authority = User(
            full_name="Authority Officer 2C",
            email=f"auth2c_{uuid4().hex[:8]}@rakshanet.gov.in",
            hashed_password=hash_password("officerPass123!"),
            role=ROLE_AUTHORITY,
            is_active=True,
        )
        cls.citizen = User(
            full_name="Citizen User 2C",
            email=f"citizen2c_{uuid4().hex[:8]}@example.com",
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
            title="Bangalore Flash Flood 2C",
            description="Flooding simulation for spatial testing",
            disaster_type=DisasterType.FLOOD.value,
            severity=DisasterSeverity.CRITICAL.value,
            status=DisasterStatus.ACTIVE.value,
            latitude=12.9716,
            longitude=77.5946,
            location="Bangalore Urban",
            created_by_id=cls.authority.id,
        )
        cls.db.add(cls.disaster)
        cls.db.commit()
        cls.db.refresh(cls.disaster)

    @classmethod
    def tearDownClass(cls):
        try:
            cls.db.query(HazardZone).delete()
            cls.db.query(Shelter).delete()
            cls.db.query(Disaster).delete()
            cls.db.query(User).filter(User.id.in_([cls.authority.id, cls.citizen.id])).delete(synchronize_session=False)
            cls.db.commit()
        finally:
            cls.db.close()

    def setUp(self):
        # Clean test tables between runs
        self.db.query(HazardZone).delete()
        self.db.query(Shelter).delete()
        self.db.commit()

    # -------------------------------------------------------------
    # 1. Coordinate Validation Tests
    # -------------------------------------------------------------

    def test_exposure_rejects_out_of_range_coordinates(self):
        bad_lats = [-90.1, 90.1, 100.0]
        bad_lons = [-180.1, 180.1, 200.0]

        for lat in bad_lats:
            resp_post = self.client.post("/api/v1/hazards/exposure", json={"latitude": lat, "longitude": 77.59})
            self.assertEqual(resp_post.status_code, 422)
            resp_get = self.client.get(f"/api/v1/hazards/exposure?latitude={lat}&longitude=77.59")
            self.assertEqual(resp_get.status_code, 422)

        for lon in bad_lons:
            resp_post = self.client.post("/api/v1/hazards/exposure", json={"latitude": 12.97, "longitude": lon})
            self.assertEqual(resp_post.status_code, 422)
            resp_get = self.client.get(f"/api/v1/hazards/exposure?latitude=12.97&longitude={lon}")
            self.assertEqual(resp_get.status_code, 422)

    def test_shelter_recommend_rejects_out_of_range_coordinates(self):
        resp_bad_lat = self.client.get("/api/v1/shelters/recommend?latitude=95.0&longitude=77.59")
        self.assertEqual(resp_bad_lat.status_code, 422)

        resp_bad_lon = self.client.get("/api/v1/shelters/recommend?latitude=12.97&longitude=185.0")
        self.assertEqual(resp_bad_lon.status_code, 422)

    # -------------------------------------------------------------
    # 2. Shelter Creation vs Separate Verification Tests
    # -------------------------------------------------------------

    def test_shelter_creation_defaults_to_unverified(self):
        payload = {
            "name": "Koramangala Community Center",
            "description": "Safe indoor sports complex shelter",
            "latitude": 12.9352,
            "longitude": 77.6245,
            "location": "Koramangala 4th Block",
            "total_capacity": 200,
            "current_occupancy": 30,
        }
        res = self.client.post("/api/v1/shelters", headers=self.authority_headers, json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertFalse(data["verified"], "New shelter must default to verified=False")
        shelter_id = data["id"]

        # Public cannot see unverified shelter in listing
        pub_list = self.client.get("/api/v1/shelters").json()
        self.assertEqual(len(pub_list), 0)

        # Public GET by ID returns 404 for unverified shelter
        pub_detail = self.client.get(f"/api/v1/shelters/{shelter_id}")
        self.assertEqual(pub_detail.status_code, 404)

        # Authority can see unverified shelter in listing and detail
        auth_list = self.client.get("/api/v1/shelters", headers=self.authority_headers).json()
        self.assertEqual(len(auth_list), 1)

        # Authority verifies shelter via dedicated verification endpoint
        verify_res = self.client.patch(
            f"/api/v1/shelters/{shelter_id}/verify",
            headers=self.authority_headers,
            json={"verified": True},
        )
        self.assertEqual(verify_res.status_code, 200)
        self.assertTrue(verify_res.json()["verified"])

        # Public CAN now see verified shelter
        pub_list_after = self.client.get("/api/v1/shelters").json()
        self.assertEqual(len(pub_list_after), 1)
        self.assertEqual(pub_list_after[0]["id"], shelter_id)

        pub_detail_after = self.client.get(f"/api/v1/shelters/{shelter_id}")
        self.assertEqual(pub_detail_after.status_code, 200)
        self.assertEqual(pub_detail_after.json()["name"], "Koramangala Community Center")

    def test_citizen_cannot_verify_or_delete_shelter(self):
        # Create shelter as authority
        payload = {
            "name": "Indiranagar Club Hall",
            "description": "Equipped relief shelter",
            "latitude": 12.9784,
            "longitude": 77.6408,
            "location": "Indiranagar 100ft Road",
            "total_capacity": 150,
            "current_occupancy": 0,
        }
        res = self.client.post("/api/v1/shelters", headers=self.authority_headers, json=payload)
        shelter_id = res.json()["id"]

        # Citizen attempts verify -> 403
        resp_verify = self.client.patch(
            f"/api/v1/shelters/{shelter_id}/verify",
            headers=self.citizen_headers,
            json={"verified": True},
        )
        self.assertEqual(resp_verify.status_code, 403)

        # Citizen attempts delete -> 403
        resp_del = self.client.delete(f"/api/v1/shelters/{shelter_id}", headers=self.citizen_headers)
        self.assertEqual(resp_del.status_code, 403)

        # Unauthenticated attempts delete -> 401
        resp_del_unauth = self.client.delete(f"/api/v1/shelters/{shelter_id}")
        self.assertEqual(resp_del_unauth.status_code, 401)

        # Authority deletes shelter -> 204
        resp_del_auth = self.client.delete(f"/api/v1/shelters/{shelter_id}", headers=self.authority_headers)
        self.assertEqual(resp_del_auth.status_code, 204)

    # -------------------------------------------------------------
    # 3. PostGIS Citizen Exposure Detection Tests
    # -------------------------------------------------------------

    def test_exposure_inside_verified_hazard_zone(self):
        # Create hazard zone (box: lon 77.5900 to 77.6000, lat 12.9700 to 12.9800)
        resp_hz = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Cubbon Park Inundation Zone",
                "severity": 4,
                "geometry": VALID_MULTIPOLYGON,
                "source": "State Disaster Management Authority",
            },
        )
        hz_id = resp_hz.json()["id"]

        # Point inside zone: lat 12.9750, lon 77.5950
        # While unverified, citizen exposure must NOT report exposure
        resp_exp_unverified = self.client.post(
            "/api/v1/hazards/exposure",
            json={"latitude": 12.9750, "longitude": 77.5950},
        )
        self.assertEqual(resp_exp_unverified.status_code, 200)
        data_unv = resp_exp_unverified.json()
        self.assertFalse(data_unv["is_exposed"], "Unverified hazard zones must NEVER expose citizens")
        self.assertEqual(len(data_unv["hazard_zones"]), 0)

        # Authority verifies hazard zone
        self.client.patch(
            f"/api/v1/hazards/{hz_id}/verify",
            headers=self.authority_headers,
            json={"verified": True},
        )

        # Check exposure via POST
        resp_exp = self.client.post(
            "/api/v1/hazards/exposure",
            json={"latitude": 12.9750, "longitude": 77.5950},
        )
        self.assertEqual(resp_exp.status_code, 200)
        data = resp_exp.json()
        self.assertTrue(data["is_exposed"])
        self.assertEqual(data["highest_severity"], 4)
        self.assertEqual(len(data["hazard_zones"]), 1)
        self.assertEqual(data["hazard_zones"][0]["name"], "Cubbon Park Inundation Zone")
        self.assertIn("Warning: You are inside", data["message"])

        # Check exposure via GET
        resp_exp_get = self.client.get("/api/v1/hazards/exposure?latitude=12.9750&longitude=77.5950")
        self.assertEqual(resp_exp_get.status_code, 200)
        self.assertTrue(resp_exp_get.json()["is_exposed"])

    def test_exposure_outside_verified_hazard_zone(self):
        # Create and verify hazard zone
        resp_hz = self.client.post(
            "/api/v1/hazards",
            headers=self.authority_headers,
            json={
                "disaster_id": str(self.disaster.id),
                "name": "Central Flooded Area",
                "severity": 3,
                "geometry": VALID_MULTIPOLYGON,
            },
        )
        hz_id = resp_hz.json()["id"]
        self.client.patch(f"/api/v1/hazards/{hz_id}/verify", headers=self.authority_headers, json={"verified": True})

        # Point clearly outside zone: lat 12.9000, lon 77.5000 (~12 km away)
        resp_exp = self.client.post(
            "/api/v1/hazards/exposure",
            json={"latitude": 12.9000, "longitude": 77.5000},
        )
        self.assertEqual(resp_exp.status_code, 200)
        data = resp_exp.json()
        self.assertFalse(data["is_exposed"])
        self.assertEqual(len(data["hazard_zones"]), 0)
        self.assertIsNotNone(data["nearest_hazard_distance_meters"])
        # Should be > 5,000 meters away
        self.assertGreater(data["nearest_hazard_distance_meters"], 5000)
        self.assertIn("outside all verified hazard zones", data["message"])

    # -------------------------------------------------------------
    # 4. PostGIS Nearest Verified Available Shelter Recommendation Tests
    # -------------------------------------------------------------

    def test_shelter_recommendation_ordering_and_filtering(self):
        # Citizen location: (lat 12.9716, lon 77.5946)

        # Shelter A: Closest (lat 12.9720, lon 77.5950) ~ 60m away, but UNVERIFIED
        res_a = self.client.post(
            "/api/v1/shelters",
            headers=self.authority_headers,
            json={
                "name": "Shelter A - Unverified Closest",
                "description": "Closest but unverified",
                "latitude": 12.9720,
                "longitude": 77.5950,
                "location": "Near Point",
                "total_capacity": 50,
                "current_occupancy": 0,
            },
        )
        shelter_a_id = res_a.json()["id"]

        # Shelter B: Second closest (lat 12.9750, lon 77.5980) ~ 500m away, VERIFIED but FULL
        res_b = self.client.post(
            "/api/v1/shelters",
            headers=self.authority_headers,
            json={
                "name": "Shelter B - Full",
                "description": "Verified but full",
                "latitude": 12.9750,
                "longitude": 77.5980,
                "location": "Mid Point",
                "total_capacity": 100,
                "current_occupancy": 100,  # FULL
            },
        )
        shelter_b_id = res_b.json()["id"]
        self.client.patch(f"/api/v1/shelters/{shelter_b_id}/verify", headers=self.authority_headers, json={"verified": True})

        # Shelter C: Third closest (lat 12.9800, lon 77.6000) ~ 1.1 km away, VERIFIED and AVAILABLE
        res_c = self.client.post(
            "/api/v1/shelters",
            headers=self.authority_headers,
            json={
                "name": "Shelter C - Available Winner",
                "description": "Verified and available",
                "latitude": 12.9800,
                "longitude": 77.6000,
                "location": "Farther Point",
                "total_capacity": 150,
                "current_occupancy": 50,
            },
        )
        shelter_c_id = res_c.json()["id"]
        self.client.patch(f"/api/v1/shelters/{shelter_c_id}/verify", headers=self.authority_headers, json={"verified": True})

        # Shelter D: Furthest (lat 13.0000, lon 77.6200) ~ 4 km away, VERIFIED and AVAILABLE
        res_d = self.client.post(
            "/api/v1/shelters",
            headers=self.authority_headers,
            json={
                "name": "Shelter D - Furthest Available",
                "description": "Verified and available",
                "latitude": 13.0000,
                "longitude": 77.6200,
                "location": "North Point",
                "total_capacity": 200,
                "current_occupancy": 10,
            },
        )
        shelter_d_id = res_d.json()["id"]
        self.client.patch(f"/api/v1/shelters/{shelter_d_id}/verify", headers=self.authority_headers, json={"verified": True})

        # Query recommendation for citizen at (12.9716, 77.5946)
        rec_resp = self.client.get("/api/v1/shelters/recommend?latitude=12.9716&longitude=77.5946")
        self.assertEqual(rec_resp.status_code, 200)
        data = rec_resp.json()

        # Recommended shelter MUST be Shelter C (Shelter A is unverified, Shelter B is full)
        self.assertIsNotNone(data["recommended_shelter"])
        rec = data["recommended_shelter"]
        self.assertEqual(rec["id"], shelter_c_id)
        self.assertEqual(rec["name"], "Shelter C - Available Winner")
        self.assertEqual(rec["available_capacity"], 100)
        self.assertGreater(rec["distance_meters"], 500)
        self.assertLess(rec["distance_meters"], 1500)

        # Available shelters list must contain C then D, neither A nor B
        avail_ids = [s["id"] for s in data["available_shelters"]]
        self.assertNotIn(shelter_a_id, avail_ids, "Unverified shelter A must not be recommended")
        self.assertNotIn(shelter_b_id, avail_ids, "Full shelter B must not be recommended")
        self.assertEqual(avail_ids, [shelter_c_id, shelter_d_id])
        self.assertLess(data["available_shelters"][0]["distance_meters"], data["available_shelters"][1]["distance_meters"])

    def test_recommendation_empty_when_no_shelter_available(self):
        # When no shelters exist or none are verified/available
        resp = self.client.get("/api/v1/shelters/recommend?latitude=12.9716&longitude=77.5946")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsNone(data["recommended_shelter"])
        self.assertIsNone(data["distance_meters"])
        self.assertEqual(len(data["available_shelters"]), 0)


if __name__ == "__main__":
    unittest.main()
