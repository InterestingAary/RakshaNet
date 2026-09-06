import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models.disaster import Disaster, DisasterSeverity, DisasterStatus, DisasterType
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import ROLE_CITIZEN, User
from app.schemas.relocation import RelocationRecommendation


class FakeRelocationSession:
    def __init__(self, shelters=None, disasters=None):
        self.shelters = {shelter.id: shelter for shelter in shelters or []}
        self.disasters = {disaster.id: disaster for disaster in disasters or []}

    def get(self, model, item_id):
        if model.__name__ == "Disaster":
            return self.disasters.get(item_id)
        return self.shelters.get(item_id)

    def scalars(self, statement):
        items = list(self.shelters.values())
        if getattr(statement, "whereclause", None) is not None:
            items = [item for item in items if item.status == ShelterStatus.ACTIVE]
        return _ScalarResult(items)

    def add(self, obj):
        obj.id = obj.id or uuid4()
        if isinstance(obj, Disaster):
            self.disasters[obj.id] = obj
        elif isinstance(obj, Shelter):
            self.shelters[obj.id] = obj

    def commit(self):
        return None

    def refresh(self, obj):
        obj.created_at = obj.created_at or datetime.now(timezone.utc)
        obj.updated_at = obj.updated_at or datetime.now(timezone.utc)


class _ScalarResult:
    def __init__(self, items):
        self.items = list(items)

    def all(self):
        return self.items


class RelocationTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session = FakeRelocationSession()
        app.dependency_overrides[get_db] = lambda: self.session

    def tearDown(self):
        app.dependency_overrides.clear()

    def make_user(self, role=ROLE_CITIZEN, active=True):
        return User(
            id=uuid4(),
            full_name="Test User",
            email="citizen@example.com",
            phone=None,
            hashed_password=hash_password("password123"),
            role=role,
            is_active=active,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def make_shelter(
        self,
        owner_id,
        *,
        name="Shelter",
        latitude=20.0,
        longitude=85.0,
        total_capacity=50,
        current_occupancy=0,
        status=ShelterStatus.ACTIVE,
    ):
        return Shelter(
            id=uuid4(),
            name=name,
            description="Emergency shelter",
            latitude=latitude,
            longitude=longitude,
            location="District center",
            total_capacity=total_capacity,
            current_occupancy=current_occupancy,
            status=status,
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def make_disaster(self, owner_id, status=DisasterStatus.ACTIVE):
        return Disaster(
            id=uuid4(),
            title="Flood emergency",
            description="Standing water in city core",
            disaster_type=DisasterType.FLOOD,
            severity=DisasterSeverity.HIGH,
            status=status,
            latitude=20.3,
            longitude=85.2,
            location="City center",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def authenticate_as(self, user):
        app.dependency_overrides[get_current_user] = lambda: user

    def test_relocation_requires_authentication(self):
        response = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 401)

    def test_recommend_returns_nearest_available_shelter(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)
        nearer = self.make_shelter(citizen.id, name="Near Shelter", latitude=20.0, longitude=85.0, total_capacity=30, current_occupancy=10)
        farther = self.make_shelter(citizen.id, name="Far Shelter", latitude=20.1, longitude=85.2, total_capacity=40, current_occupancy=5)
        self.session = FakeRelocationSession([nearer, farther])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 20.02, "longitude": 85.02},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["shelter_name"], "Near Shelter")
        self.assertEqual(response.json()["available_capacity"], 20)
        self.assertIn("distance_km", response.json())

    def test_full_shelter_is_excluded(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)
        full = self.make_shelter(citizen.id, name="Full Shelter", latitude=20.0, longitude=85.0, total_capacity=10, current_occupancy=10)
        available = self.make_shelter(citizen.id, name="Open Shelter", latitude=20.2, longitude=85.2, total_capacity=50, current_occupancy=5)
        self.session = FakeRelocationSession([full, available])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["shelter_name"], "Open Shelter")

    def test_no_available_shelter_returns_404(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)
        full = self.make_shelter(citizen.id, name="Full Shelter", latitude=20.0, longitude=85.0, total_capacity=10, current_occupancy=10)
        inactive = self.make_shelter(citizen.id, name="Inactive Shelter", latitude=20.1, longitude=85.1, total_capacity=50, current_occupancy=0, status=ShelterStatus.INACTIVE)
        self.session = FakeRelocationSession([full, inactive])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 404)

    def test_invalid_latitude_and_longitude_are_rejected(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)

        bad_lat = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 91, "longitude": 85.0},
        )
        bad_lon = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 20.0, "longitude": 181},
        )

        self.assertEqual(bad_lat.status_code, 422)
        self.assertEqual(bad_lon.status_code, 422)

    def test_unknown_disaster_returns_404(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)
        shelter = self.make_shelter(citizen.id, latitude=20.0, longitude=85.0)
        self.session = FakeRelocationSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 20.0, "longitude": 85.0, "disaster_id": str(uuid4())},
        )

        self.assertEqual(response.status_code, 404)

    def test_response_schema_matches_contract(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)
        shelter = self.make_shelter(citizen.id, name="Contract Shelter", latitude=20.0, longitude=85.0, total_capacity=25, current_occupancy=5)
        self.session = FakeRelocationSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/recommend",
            json={"latitude": 20.01, "longitude": 85.01},
        )

        self.assertEqual(response.status_code, 200)
        validated = RelocationRecommendation.model_validate(response.json())
        self.assertEqual(validated.shelter_name, "Contract Shelter")
        self.assertEqual(validated.available_capacity, 20)

    def test_route_calculation_with_avoidance(self):
        citizen = self.make_user()
        self.authenticate_as(citizen)
        shelter = self.make_shelter(citizen.id, latitude=20.05, longitude=85.05)
        self.session = FakeRelocationSession([shelter])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/route",
            json={
                "origin_latitude": 20.0,
                "origin_longitude": 85.0,
                "destination_latitude": 20.05,
                "destination_longitude": 85.05,
                "avoid_hazards": True,
                "avoid_blocked_roads": True,
            },
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "SUCCESS")
        self.assertGreater(data["distance_km"], 0)
        self.assertIn("geometry", data)
        self.assertEqual(data["geometry"]["type"], "LineString")
        self.assertGreaterEqual(len(data["geometry"]["coordinates"]), 2)

