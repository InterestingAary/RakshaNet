import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models.disaster import Disaster, DisasterSeverity, DisasterStatus, DisasterType
from app.models.incident import Incident, IncidentSeverity, IncidentStatus, IncidentType
from app.models.report import Report, ReportStatus, ReportType
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import ROLE_CITIZEN, User
from app.schemas.replanning import ReplanningRecommendation


class FakeRefreshSession:
    def __init__(self, shelters=None, incidents=None, reports=None, disasters=None):
        self.shelters = {shelter.id: shelter for shelter in shelters or []}
        self.incidents = {incident.id: incident for incident in incidents or []}
        self.reports = {report.id: report for report in reports or []}
        self.disasters = {disaster.id: disaster for disaster in disasters or []}

    def get(self, model, item_id):
        if model is Disaster:
            return self.disasters.get(item_id)
        return None

    def scalars(self, statement):
        if statement is None:
            return _ScalarResult([])
        if "shelters" in str(statement):
            items = list(self.shelters.values())
            if getattr(statement, "whereclause", None) is not None:
                items = [item for item in items if item.status == ShelterStatus.ACTIVE]
            return _ScalarResult(items)
        if "incidents" in str(statement):
            return _ScalarResult(list(self.incidents.values()))
        if "reports" in str(statement):
            return _ScalarResult(list(self.reports.values()))
        return _ScalarResult([])


class _ScalarResult:
    def __init__(self, items):
        self.items = list(items)

    def all(self):
        return self.items


class RelocationRefreshTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session = FakeRefreshSession()
        app.dependency_overrides[get_db] = lambda: self.session

    def tearDown(self):
        app.dependency_overrides.clear()

    def make_user(self, role=ROLE_CITIZEN, active=True):
        return User(
            id=uuid4(),
            full_name="Test User",
            email="user@example.com",
            phone=None,
            hashed_password=hash_password("password123"),
            role=role,
            is_active=active,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def make_shelter(self, owner_id, **kwargs):
        defaults = dict(
            id=uuid4(),
            name="Shelter A",
            description="Emergency shelter",
            latitude=20.0,
            longitude=85.0,
            location="District center",
            total_capacity=50,
            current_occupancy=0,
            status=ShelterStatus.ACTIVE,
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        defaults.update(kwargs)
        return Shelter(**defaults)

    def make_disaster(self, owner_id, status=DisasterStatus.ACTIVE):
        return Disaster(
            id=uuid4(),
            title="Storm alert",
            description="Weather emergency",
            disaster_type=DisasterType.CYCLONE,
            severity=DisasterSeverity.HIGH,
            status=status,
            latitude=20.2,
            longitude=85.2,
            location="City center",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def make_incident(self, owner_id, **kwargs):
        defaults = dict(
            id=uuid4(),
            title="Blocked route",
            description="High severity incident",
            incident_type=IncidentType.FLOOD,
            severity=IncidentSeverity.CRITICAL,
            status=IncidentStatus.OPEN,
            latitude=20.01,
            longitude=85.01,
            location="Near shelter",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        defaults.update(kwargs)
        return Incident(**defaults)

    def make_report(self, owner_id, **kwargs):
        defaults = dict(
            id=uuid4(),
            title="Unsafe approach",
            description="Report near shelter",
            report_type=ReportType.SAFETY,
            status=ReportStatus.OPEN,
            latitude=20.02,
            longitude=85.02,
            location="Approach road",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        defaults.update(kwargs)
        return Report(**defaults)

    def authenticate_as(self, user):
        app.dependency_overrides[get_current_user] = lambda: user

    def test_refresh_requires_authentication(self):
        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 401)

    def test_refresh_returns_current_recommendation(self):
        user = self.make_user()
        self.authenticate_as(user)
        near = self.make_shelter(user.id, name="Near Shelter", latitude=20.0, longitude=85.0, total_capacity=20, current_occupancy=2)
        far = self.make_shelter(user.id, name="Far Shelter", latitude=20.2, longitude=85.2, total_capacity=20, current_occupancy=0)
        self.session = FakeRefreshSession(shelters=[near, far])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.01, "longitude": 85.01},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["shelter_name"], "Near Shelter")
        self.assertEqual(response.json()["available_capacity"], 18)

    def test_refresh_excludes_full_and_inactive_shelters(self):
        user = self.make_user()
        self.authenticate_as(user)
        full = self.make_shelter(user.id, name="Full Shelter", latitude=20.0, longitude=85.0, total_capacity=10, current_occupancy=10)
        inactive = self.make_shelter(user.id, name="Inactive Shelter", latitude=20.1, longitude=85.1, total_capacity=10, current_occupancy=0, status=ShelterStatus.INACTIVE)
        active = self.make_shelter(user.id, name="Open Shelter", latitude=20.3, longitude=85.3, total_capacity=15, current_occupancy=2)
        self.session = FakeRefreshSession(shelters=[full, inactive, active])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["shelter_name"], "Open Shelter")

    def test_refresh_uses_current_capacity(self):
        user = self.make_user()
        self.authenticate_as(user)
        shelter = self.make_shelter(user.id, name="Capacity Shelter", latitude=20.0, longitude=85.0, total_capacity=10, current_occupancy=9)
        self.session = FakeRefreshSession(shelters=[shelter])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["available_capacity"], 1)

    def test_refresh_includes_risk_from_incident_and_report(self):
        user = self.make_user()
        self.authenticate_as(user)
        shelter = self.make_shelter(user.id, name="Risky Shelter", latitude=20.0, longitude=85.0, total_capacity=20, current_occupancy=0)
        safer = self.make_shelter(user.id, name="Safer Shelter", latitude=20.3, longitude=85.3, total_capacity=20, current_occupancy=0)
        incident = self.make_incident(user.id, latitude=20.01, longitude=85.01, severity=IncidentSeverity.CRITICAL, status=IncidentStatus.OPEN)
        report = self.make_report(user.id, latitude=20.02, longitude=85.02, status=ReportStatus.OPEN)
        self.session = FakeRefreshSession(shelters=[shelter, safer], incidents=[incident], reports=[report])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 200)
        self.assertGreater(response.json()["risk_score"], 0)
        self.assertIn("nearby_incident", response.json()["risk_flags"])

    def test_refresh_validates_active_disaster(self):
        user = self.make_user()
        self.authenticate_as(user)
        shelter = self.make_shelter(user.id, latitude=20.0, longitude=85.0)
        self.session = FakeRefreshSession(shelters=[shelter], disasters=[])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.0, "longitude": 85.0, "disaster_id": str(uuid4())},
        )

        self.assertEqual(response.status_code, 404)

    def test_refresh_rejects_invalid_coordinates(self):
        user = self.make_user()
        self.authenticate_as(user)

        bad_lat = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 91, "longitude": 85.0},
        )
        bad_lon = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.0, "longitude": 181},
        )

        self.assertEqual(bad_lat.status_code, 422)
        self.assertEqual(bad_lon.status_code, 422)

    def test_refresh_returns_404_when_no_eligible_shelter_exists(self):
        user = self.make_user()
        self.authenticate_as(user)
        shelter = self.make_shelter(user.id, latitude=20.0, longitude=85.0, total_capacity=10, current_occupancy=10)
        self.session = FakeRefreshSession(shelters=[shelter])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.0, "longitude": 85.0},
        )

        self.assertEqual(response.status_code, 404)

    def test_refresh_response_matches_schema(self):
        user = self.make_user()
        self.authenticate_as(user)
        shelter = self.make_shelter(user.id, name="Schema Shelter", latitude=20.0, longitude=85.0, total_capacity=15, current_occupancy=3)
        self.session = FakeRefreshSession(shelters=[shelter])
        app.dependency_overrides[get_db] = lambda: self.session

        response = self.client.post(
            "/api/v1/relocation/refresh",
            json={"latitude": 20.01, "longitude": 85.01},
        )

        self.assertEqual(response.status_code, 200)
        validated = ReplanningRecommendation.model_validate(response.json())
        self.assertEqual(validated.shelter_name, "Schema Shelter")
        self.assertEqual(validated.available_capacity, 12)
