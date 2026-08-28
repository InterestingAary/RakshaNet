import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.v1.auth import get_current_user
from app.api.v1.disasters import update_disaster
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models.disaster import (
    Disaster,
    DisasterSeverity,
    DisasterStatus,
    DisasterType,
)
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User
from app.schemas.disaster import DisasterResponse, DisasterUpdate


class FakeSession:
    def __init__(self, disasters=None):
        self.disasters = {disaster.id: disaster for disaster in disasters or []}

    def add(self, disaster):
        disaster.id = disaster.id or uuid4()
        self.disasters[disaster.id] = disaster

    def commit(self):
        return None

    def refresh(self, disaster):
        disaster.status = disaster.status or DisasterStatus.DRAFT
        disaster.created_at = disaster.created_at or datetime.now(timezone.utc)
        disaster.updated_at = disaster.updated_at or datetime.now(timezone.utc)

    def get(self, model, item_id):
        return self.disasters.get(item_id)

    def scalars(self, _statement):
        items = self.disasters.values()
        if _statement.whereclause is not None:
            items = [item for item in items if item.status == DisasterStatus.ACTIVE]
        return _ScalarResult(items)


class _ScalarResult:
    def __init__(self, items):
        self.items = list(items)

    def all(self):
        return self.items


class DisasterTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session = FakeSession()
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

    def make_disaster(self, owner_id, status=DisasterStatus.ACTIVE):
        return Disaster(
            id=uuid4(),
            title="Flood emergency",
            description="Water level is rising",
            disaster_type=DisasterType.FLOOD,
            severity=DisasterSeverity.HIGH,
            status=status,
            latitude=20.3,
            longitude=85.8,
            location="Central district",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def authenticate_as(self, user):
        app.dependency_overrides[get_current_user] = lambda: user

    def test_authority_can_create_draft_disaster(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        response = self.client.post(
            "/api/v1/disasters",
            json={
                "title": "Flood emergency",
                "description": "Water level is rising",
                "disaster_type": "FLOOD",
                "severity": "HIGH",
                "latitude": 20.3,
                "longitude": 85.8,
                "location": "Central district",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["created_by_id"], str(authority.id))
        self.assertEqual(response.json()["status"], "DRAFT")
        self.assertNotIn("hashed_password", response.json())

    def test_citizen_cannot_create_or_update_disaster(self):
        citizen = self.make_user()
        disaster = self.make_disaster(self.make_user(ROLE_AUTHORITY).id)
        self.session = FakeSession([disaster])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(citizen)

        create_response = self.client.post(
            "/api/v1/disasters",
            json={
                "title": "Flood emergency",
                "description": "Water level is rising",
                "disaster_type": "FLOOD",
                "severity": "HIGH",
                "latitude": 20.3,
                "longitude": 85.8,
            },
        )
        update_response = self.client.patch(
            f"/api/v1/disasters/{disaster.id}",
            json={"status": "RESOLVED"},
        )

        self.assertEqual(create_response.status_code, 403)
        self.assertEqual(update_response.status_code, 403)

    def test_disaster_endpoints_require_authentication(self):
        disaster_id = uuid4()

        self.assertEqual(self.client.post("/api/v1/disasters", json={}).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/disasters").status_code, 401)
        self.assertEqual(self.client.get(f"/api/v1/disasters/{disaster_id}").status_code, 401)
        self.assertEqual(self.client.patch(f"/api/v1/disasters/{disaster_id}", json={}).status_code, 401)

    def test_citizen_can_list_and_retrieve_only_active_disasters(self):
        citizen = self.make_user()
        active = self.make_disaster(citizen.id, DisasterStatus.ACTIVE)
        draft = self.make_disaster(citizen.id, DisasterStatus.DRAFT)
        self.session = FakeSession([active, draft])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(citizen)

        listing = self.client.get("/api/v1/disasters")
        active_response = self.client.get(f"/api/v1/disasters/{active.id}")
        draft_response = self.client.get(f"/api/v1/disasters/{draft.id}")

        self.assertEqual(listing.status_code, 200)
        self.assertEqual([item["id"] for item in listing.json()], [str(active.id)])
        self.assertEqual(active_response.status_code, 200)
        self.assertEqual(draft_response.status_code, 404)

    def test_authority_can_list_and_retrieve_all_disasters(self):
        authority = self.make_user(ROLE_AUTHORITY)
        active = self.make_disaster(authority.id, DisasterStatus.ACTIVE)
        draft = self.make_disaster(authority.id, DisasterStatus.DRAFT)
        self.session = FakeSession([active, draft])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        listing = self.client.get("/api/v1/disasters")
        retrieved = self.client.get(f"/api/v1/disasters/{draft.id}")

        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 2)
        self.assertEqual(retrieved.status_code, 200)
        self.assertEqual(retrieved.json()["status"], "DRAFT")

    def test_authority_can_activate_and_resolve_disaster(self):
        authority = self.make_user(ROLE_AUTHORITY)
        disaster = self.make_disaster(authority.id, DisasterStatus.DRAFT)
        self.session = FakeSession([disaster])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        activate = self.client.patch(
            f"/api/v1/disasters/{disaster.id}",
            json={"status": "ACTIVE"},
        )
        resolve = self.client.patch(
            f"/api/v1/disasters/{disaster.id}",
            json={"status": "RESOLVED"},
        )

        self.assertEqual(activate.status_code, 200)
        self.assertEqual(resolve.status_code, 200)
        self.assertEqual(resolve.json()["status"], "RESOLVED")

    def test_invalid_status_transition_returns_conflict(self):
        authority = self.make_user(ROLE_AUTHORITY)
        disaster = self.make_disaster(authority.id, DisasterStatus.RESOLVED)
        self.session = FakeSession([disaster])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.patch(
            f"/api/v1/disasters/{disaster.id}",
            json={"status": "ACTIVE"},
        )

        self.assertEqual(response.status_code, 409)

    def test_invalid_data_and_ids_are_rejected(self):
        authority = self.make_user(ROLE_AUTHORITY)
        self.authenticate_as(authority)

        invalid_data = self.client.post(
            "/api/v1/disasters",
            json={
                "title": "",
                "description": "Bad coordinates",
                "disaster_type": "UNKNOWN",
                "severity": "HIGH",
                "latitude": 100,
                "longitude": 181,
            },
        )
        invalid_id = self.client.get("/api/v1/disasters/not-a-uuid")
        missing = self.client.get(f"/api/v1/disasters/{uuid4()}")

        self.assertEqual(invalid_data.status_code, 422)
        self.assertEqual(invalid_id.status_code, 422)
        self.assertEqual(missing.status_code, 404)

    def test_response_schema_excludes_sensitive_fields(self):
        authority = self.make_user(ROLE_AUTHORITY)
        disaster = self.make_disaster(authority.id)
        validated = DisasterResponse.model_validate(disaster)

        self.assertEqual(validated.created_by_id, authority.id)
        self.assertNotIn("hashed_password", validated.model_dump())
        self.assertNotIn("hashed_password", disaster.__table__.columns)

    def test_direct_update_rejects_missing_owner_authority(self):
        citizen = self.make_user()
        authority = self.make_user(ROLE_AUTHORITY)
        disaster = self.make_disaster(authority.id)

        response = update_disaster(
            disaster.id,
            DisasterUpdate(title="Updated"),
            authority,
            FakeSession([disaster]),
        )

        self.assertEqual(response.title, "Updated")
        self.assertNotEqual(response.created_by_id, citizen.id)


if __name__ == "__main__":
    unittest.main()
