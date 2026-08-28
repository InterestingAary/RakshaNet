import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.api.v1.auth import get_current_user
from app.api.v1.incidents import create_incident, get_incident, update_incident
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models.incident import Incident, IncidentSeverity, IncidentStatus, IncidentType
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User
from app.schemas.incident import IncidentCreate, IncidentResponse, IncidentUpdate


class FakeIncidentSession:
    def __init__(self, incidents=None):
        self.incidents = {incident.id: incident for incident in incidents or []}

    def add(self, incident):
        incident.id = incident.id or uuid4()
        self.incidents[incident.id] = incident

    def commit(self):
        return None

    def refresh(self, incident):
        incident.status = incident.status or IncidentStatus.OPEN
        incident.created_at = incident.created_at or datetime.now(timezone.utc)
        incident.updated_at = incident.updated_at or datetime.now(timezone.utc)

    def get(self, model, item_id):
        return self.incidents.get(item_id)

    def scalars(self, _statement):
        return _ScalarResult(self.incidents.values())


class _ScalarResult:
    def __init__(self, items):
        self.items = list(items)

    def all(self):
        return self.items


class IncidentTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session = FakeIncidentSession()
        app.dependency_overrides[get_db] = lambda: self.session

    def tearDown(self):
        app.dependency_overrides.clear()

    def make_user(self, role=ROLE_CITIZEN):
        return User(
            id=uuid4(),
            full_name="Test User",
            email="test@example.com",
            phone=None,
            hashed_password=hash_password("password123"),
            role=role,
            is_active=True,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def make_incident(self, owner_id):
        return Incident(
            id=uuid4(),
            title="Flood warning",
            description="Water level is rising",
            incident_type=IncidentType.FLOOD,
            severity=IncidentSeverity.HIGH,
            status=IncidentStatus.OPEN,
            latitude=20.3,
            longitude=85.8,
            location="Central district",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def authenticate_as(self, user):
        app.dependency_overrides[get_current_user] = lambda: user

    def test_authenticated_user_can_create_incident(self):
        user = self.make_user()
        self.authenticate_as(user)
        payload = {
            "title": "Flood warning",
            "description": "Water level is rising",
            "incident_type": "FLOOD",
            "severity": "HIGH",
            "latitude": 20.3,
            "longitude": 85.8,
            "location": "Central district",
        }

        response = self.client.post("/api/v1/incidents", json=payload)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["created_by_id"], str(user.id))
        self.assertEqual(response.json()["status"], "OPEN")
        self.assertNotIn("hashed_password", response.json())

    def test_incident_endpoints_require_authentication(self):
        incident_id = uuid4()

        self.assertEqual(self.client.post("/api/v1/incidents", json={}).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/incidents").status_code, 401)
        self.assertEqual(self.client.get(f"/api/v1/incidents/{incident_id}").status_code, 401)
        self.assertEqual(self.client.patch(f"/api/v1/incidents/{incident_id}", json={}).status_code, 401)

    def test_authenticated_user_can_list_and_retrieve_incidents(self):
        user = self.make_user()
        incident = self.make_incident(user.id)
        self.session = FakeIncidentSession([incident])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(user)

        listing = self.client.get("/api/v1/incidents")
        retrieved = self.client.get(f"/api/v1/incidents/{incident.id}")

        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 1)
        self.assertEqual(retrieved.status_code, 200)
        self.assertEqual(retrieved.json()["id"], str(incident.id))
        self.assertNotIn("hashed_password", retrieved.json())

    def test_creator_can_update_own_incident(self):
        user = self.make_user()
        incident = self.make_incident(user.id)
        self.session = FakeIncidentSession([incident])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(user)

        response = self.client.patch(
            f"/api/v1/incidents/{incident.id}",
            json={"severity": "CRITICAL", "status": "IN_PROGRESS"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["severity"], "CRITICAL")
        self.assertEqual(response.json()["status"], "IN_PROGRESS")

    def test_authority_can_update_another_users_incident(self):
        authority = self.make_user(ROLE_AUTHORITY)
        owner = self.make_user()
        incident = self.make_incident(owner.id)
        self.session = FakeIncidentSession([incident])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.patch(
            f"/api/v1/incidents/{incident.id}",
            json={"status": "RESOLVED"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "RESOLVED")

    def test_citizen_cannot_update_another_users_incident(self):
        owner = self.make_user()
        other_citizen = self.make_user()
        incident = self.make_incident(owner.id)
        self.session = FakeIncidentSession([incident])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(other_citizen)

        response = self.client.patch(
            f"/api/v1/incidents/{incident.id}",
            json={"title": "Unauthorized change"},
        )

        self.assertEqual(response.status_code, 403)

    def test_invalid_incident_data_returns_422(self):
        self.authenticate_as(self.make_user())

        response = self.client.post(
            "/api/v1/incidents",
            json={
                "title": "",
                "description": "Invalid coordinates",
                "incident_type": "UNKNOWN",
                "severity": "HIGH",
                "latitude": 100,
                "longitude": 181,
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_invalid_incident_id_returns_422(self):
        self.authenticate_as(self.make_user())

        response = self.client.get("/api/v1/incidents/not-a-uuid")

        self.assertEqual(response.status_code, 422)

    def test_nonexistent_incident_returns_404(self):
        self.authenticate_as(self.make_user())

        response = self.client.get(f"/api/v1/incidents/{uuid4()}")

        self.assertEqual(response.status_code, 404)

    def test_direct_update_rejects_unauthorized_user(self):
        owner = self.make_user()
        other_user = self.make_user()
        incident = self.make_incident(owner.id)

        with self.assertRaises(HTTPException) as error:
            update_incident(
                incident.id,
                IncidentUpdate(title="No access"),
                other_user,
                FakeIncidentSession([incident]),
            )

        self.assertEqual(error.exception.status_code, 403)

    def test_incident_response_schema_has_no_user_sensitive_fields(self):
        user = self.make_user()
        incident = self.make_incident(user.id)
        self.session = FakeIncidentSession([incident])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(user)
        response = self.client.get(f"/api/v1/incidents/{incident.id}")
        self.assertEqual(response.status_code, 200)

        validated = IncidentResponse.model_validate(incident)
        self.assertNotIn("hashed_password", response.json())
        self.assertEqual(validated.created_by_id, user.id)


if __name__ == "__main__":
    unittest.main()
