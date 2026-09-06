import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.v1.auth import get_current_user
from app.api.v1.shelters import get_optional_user
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User
from app.schemas.shelter import ShelterResponse


class FakeShelterSession:
    def __init__(self, shelters=None):
        self.shelters = {shelter.id: shelter for shelter in shelters or []}

    def add(self, shelter):
        shelter.id = shelter.id or uuid4()
        self.shelters[shelter.id] = shelter

    def commit(self):
        return None

    def refresh(self, shelter):
        shelter.status = shelter.status or ShelterStatus.ACTIVE
        if getattr(shelter, "verified", None) is None:
            shelter.verified = False
        shelter.created_at = shelter.created_at or datetime.now(timezone.utc)
        shelter.updated_at = shelter.updated_at or datetime.now(timezone.utc)

    def get(self, model, item_id):
        return self.shelters.get(item_id)

    def scalars(self, statement):
        items = list(self.shelters.values())
        whereclause = getattr(statement, "whereclause", None)
        if whereclause is not None:
            # Check if whereclause requires verified and active
            clause_str = str(whereclause)
            if "shelters.verified" in clause_str:
                items = [item for item in items if getattr(item, "verified", False) and item.status == ShelterStatus.ACTIVE]
            elif "shelters.status" in clause_str:
                items = [item for item in items if item.status == ShelterStatus.ACTIVE]
        return _ScalarResult(items)


class _ScalarResult:
    def __init__(self, items):
        self.items = list(items)

    def all(self):
        return self.items


class ShelterTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session = FakeShelterSession()
        app.dependency_overrides[get_db] = lambda: self.session

    def tearDown(self):
        app.dependency_overrides.clear()

    def make_user(self, role=ROLE_CITIZEN, active=True):
        return User(
            id=uuid4(),
            full_name="Test User",
            email="test@example.com",
            phone=None,
            hashed_password=hash_password("password123"),
            role=role,
            is_active=active,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def make_shelter(self, owner_id, status=ShelterStatus.ACTIVE, total_capacity=100, current_occupancy=25, verified=True):
        return Shelter(
            id=uuid4(),
            name="School Shelter",
            description="Community emergency shelter",
            latitude=22.5,
            longitude=88.3,
            location="District center",
            total_capacity=total_capacity,
            current_occupancy=current_occupancy,
            status=status,
            verified=verified,
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def authenticate_as(self, user):
        app.dependency_overrides[get_current_user] = lambda: user
        app.dependency_overrides[get_optional_user] = lambda: user

    def test_authority_can_create_shelter(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        response = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "School Shelter",
                "description": "Community emergency shelter",
                "latitude": 22.5,
                "longitude": 88.3,
                "location": "District center",
                "total_capacity": 100,
                "current_occupancy": 25,
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["created_by_id"], str(authority.id))
        self.assertEqual(response.json()["status"], "ACTIVE")
        self.assertNotIn("hashed_password", response.json())

    def test_citizen_cannot_create_shelter(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)

        response = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "School Shelter",
                "description": "Community emergency shelter",
                "latitude": 22.5,
                "longitude": 88.3,
                "location": "District center",
                "total_capacity": 100,
                "current_occupancy": 25,
            },
        )

        self.assertEqual(response.status_code, 403)

    def test_authority_can_list_all_shelters(self):
        authority = self.make_user(ROLE_AUTHORITY)
        active = self.make_shelter(authority.id, ShelterStatus.ACTIVE)
        inactive = self.make_shelter(authority.id, ShelterStatus.INACTIVE)
        self.session = FakeShelterSession([active, inactive])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        listing = self.client.get("/api/v1/shelters")

        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 2)

    def test_citizen_can_list_active_shelters_only(self):
        citizen = self.make_user()
        active = self.make_shelter(citizen.id, ShelterStatus.ACTIVE)
        inactive = self.make_shelter(citizen.id, ShelterStatus.INACTIVE)
        self.session = FakeShelterSession([active, inactive])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(citizen)

        listing = self.client.get("/api/v1/shelters")

        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 1)
        self.assertEqual(listing.json()[0]["status"], "ACTIVE")

    def test_citizen_cannot_see_inactive_shelter(self):
        citizen = self.make_user()
        shelter = self.make_shelter(citizen.id, ShelterStatus.INACTIVE)
        self.session = FakeShelterSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(citizen)

        response = self.client.get(f"/api/v1/shelters/{shelter.id}")

        self.assertEqual(response.status_code, 404)

    def test_authority_can_retrieve_inactive_shelter(self):
        authority = self.make_user(ROLE_AUTHORITY)
        shelter = self.make_shelter(authority.id, ShelterStatus.INACTIVE)
        self.session = FakeShelterSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.get(f"/api/v1/shelters/{shelter.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "INACTIVE")

    def test_citizen_can_retrieve_active_shelter(self):
        citizen = self.make_user()
        shelter = self.make_shelter(citizen.id, ShelterStatus.ACTIVE)
        self.session = FakeShelterSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(citizen)

        response = self.client.get(f"/api/v1/shelters/{shelter.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], str(shelter.id))

    def test_authority_can_update_shelter(self):
        authority = self.make_user(ROLE_AUTHORITY)
        shelter = self.make_shelter(authority.id, ShelterStatus.ACTIVE)
        self.session = FakeShelterSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.patch(
            f"/api/v1/shelters/{shelter.id}",
            json={"name": "Updated Shelter", "current_occupancy": 30},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "Updated Shelter")
        self.assertEqual(response.json()["current_occupancy"], 30)

    def test_citizen_cannot_update_shelter(self):
        citizen = self.make_user()
        shelter = self.make_shelter(citizen.id, ShelterStatus.ACTIVE)
        self.session = FakeShelterSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(citizen)

        response = self.client.patch(
            f"/api/v1/shelters/{shelter.id}",
            json={"name": "Attempted change"},
        )

        self.assertEqual(response.status_code, 403)

    def test_shelter_endpoints_require_authentication(self):
        shelter_id = uuid4()

        self.assertEqual(self.client.post("/api/v1/shelters", json={}).status_code, 401)
        self.assertEqual(self.client.patch(f"/api/v1/shelters/{shelter_id}", json={}).status_code, 401)
        self.assertEqual(self.client.delete(f"/api/v1/shelters/{shelter_id}").status_code, 401)

    def test_invalid_uuid_returns_422(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        response = self.client.get("/api/v1/shelters/not-a-uuid")

        self.assertEqual(response.status_code, 422)

    def test_missing_shelter_returns_404(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        response = self.client.get(f"/api/v1/shelters/{uuid4()}")

        self.assertEqual(response.status_code, 404)

    def test_blank_name_and_description_are_rejected(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        invalid_name = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "   ",
                "description": "Valid description",
                "latitude": 12.0,
                "longitude": 77.0,
                "location": "Town center",
                "total_capacity": 50,
                "current_occupancy": 10,
            },
        )
        invalid_description = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "Valid name",
                "description": "   ",
                "latitude": 12.0,
                "longitude": 77.0,
                "location": "Town center",
                "total_capacity": 50,
                "current_occupancy": 10,
            },
        )

        self.assertEqual(invalid_name.status_code, 422)
        self.assertEqual(invalid_description.status_code, 422)

    def test_invalid_latitude_and_longitude_are_rejected(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        bad_lat = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "Valid name",
                "description": "Valid description",
                "latitude": 91,
                "longitude": 0,
                "location": "Town center",
                "total_capacity": 50,
                "current_occupancy": 10,
            },
        )
        bad_lon = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "Valid name",
                "description": "Valid description",
                "latitude": 12.0,
                "longitude": 181,
                "location": "Town center",
                "total_capacity": 50,
                "current_occupancy": 10,
            },
        )

        self.assertEqual(bad_lat.status_code, 422)
        self.assertEqual(bad_lon.status_code, 422)

    def test_zero_and_negative_capacity_are_rejected(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        zero_capacity = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "Valid name",
                "description": "Valid description",
                "latitude": 12.0,
                "longitude": 77.0,
                "location": "Town center",
                "total_capacity": 0,
                "current_occupancy": 0,
            },
        )
        negative_capacity = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "Valid name",
                "description": "Valid description",
                "latitude": 12.0,
                "longitude": 77.0,
                "location": "Town center",
                "total_capacity": -5,
                "current_occupancy": 0,
            },
        )

        self.assertEqual(zero_capacity.status_code, 422)
        self.assertEqual(negative_capacity.status_code, 422)

    def test_negative_occupancy_and_over_capacity_are_rejected(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        negative = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "Valid name",
                "description": "Valid description",
                "latitude": 12.0,
                "longitude": 77.0,
                "location": "Town center",
                "total_capacity": 50,
                "current_occupancy": -1,
            },
        )
        over_capacity = self.client.post(
            "/api/v1/shelters",
            json={
                "name": "Valid name",
                "description": "Valid description",
                "latitude": 12.0,
                "longitude": 77.0,
                "location": "Town center",
                "total_capacity": 50,
                "current_occupancy": 51,
            },
        )

        self.assertEqual(negative.status_code, 422)
        self.assertEqual(over_capacity.status_code, 422)

    def test_capacity_reduction_below_occupancy_is_rejected(self):
        authority = self.make_user(ROLE_AUTHORITY)
        shelter = self.make_shelter(authority.id, ShelterStatus.ACTIVE, total_capacity=100, current_occupancy=80)
        self.session = FakeShelterSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.patch(
            f"/api/v1/shelters/{shelter.id}",
            json={"total_capacity": 50},
        )

        self.assertEqual(response.status_code, 409)

    def test_available_capacity_calculation_and_response_excludes_sensitive_data(self):
        authority = self.make_user(ROLE_AUTHORITY)
        shelter = self.make_shelter(authority.id, ShelterStatus.ACTIVE, total_capacity=100, current_occupancy=25)
        response = ShelterResponse.model_validate(shelter)

        self.assertEqual(response.available_capacity, 75)
        self.assertEqual(response.total_capacity - response.current_occupancy, response.available_capacity)
        self.assertNotIn("hashed_password", response.model_dump())

        full = self.make_shelter(authority.id, ShelterStatus.ACTIVE, total_capacity=10, current_occupancy=10)
        full_response = ShelterResponse.model_validate(full)
        self.assertEqual(full_response.available_capacity, 0)

    def test_shelter_data_persists_correctly(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        payload = {
            "name": "School Shelter",
            "description": "Community emergency shelter",
            "latitude": 22.5,
            "longitude": 88.3,
            "location": "District center",
            "total_capacity": 120,
            "current_occupancy": 55,
        }
        response = self.client.post("/api/v1/shelters", json=payload)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["available_capacity"], 65)
        self.assertEqual(response.json()["status"], "ACTIVE")
        self.assertEqual(response.json()["created_by_id"], str(authority.id))


if __name__ == "__main__":
    unittest.main()
