import unittest
from datetime import datetime, timezone
from uuid import uuid4

from fastapi.testclient import TestClient

from app.api.v1.auth import get_current_user
from app.core.database import get_db
from app.core.security import hash_password
from app.main import app
from app.models.report import Report, ReportStatus, ReportType
from app.models.user import ROLE_AUTHORITY, ROLE_CITIZEN, User
from app.schemas.report import ReportResponse


class FakeReportSession:
    def __init__(self, reports=None):
        self.reports = {report.id: report for report in reports or []}

    def add(self, report):
        report.id = report.id or uuid4()
        self.reports[report.id] = report

    def commit(self):
        return None

    def refresh(self, report):
        report.status = report.status or ReportStatus.OPEN
        report.created_at = report.created_at or datetime.now(timezone.utc)
        report.updated_at = report.updated_at or datetime.now(timezone.utc)

    def get(self, model, item_id):
        return self.reports.get(item_id)

    def scalars(self, _statement):
        return _ScalarResult(self.reports.values())


class _ScalarResult:
    def __init__(self, items):
        self.items = list(items)

    def all(self):
        return self.items


class ReportTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.session = FakeReportSession()
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

    def make_report(self, owner_id, status=ReportStatus.OPEN, report_type=ReportType.SAFETY):
        return Report(
            id=uuid4(),
            title="Broken Streetlight",
            description="Streetlight is out on Main Street",
            report_type=report_type,
            status=status,
            latitude=22.3,
            longitude=88.4,
            location="Main Street",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def authenticate_as(self, user):
        app.dependency_overrides[get_current_user] = lambda: user

    def test_authenticated_citizen_can_create_report(self):
        citizen = self.make_user(ROLE_CITIZEN)
        self.authenticate_as(citizen)

        response = self.client.post(
            "/api/v1/reports",
            json={
                "title": "Broken Streetlight",
                "description": "Streetlight is out on Main Street",
                "report_type": "SAFETY",
                "latitude": 22.3,
                "longitude": 88.4,
                "location": "Main Street",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["created_by_id"], str(citizen.id))
        self.assertEqual(response.json()["status"], "OPEN")
        self.assertNotIn("hashed_password", response.json())

    def test_unauthenticated_user_receives_401(self):
        report_id = uuid4()

        self.assertEqual(self.client.post("/api/v1/reports", json={}).status_code, 401)
        self.assertEqual(self.client.get("/api/v1/reports").status_code, 401)
        self.assertEqual(self.client.get(f"/api/v1/reports/{report_id}").status_code, 401)
        self.assertEqual(self.client.patch(f"/api/v1/reports/{report_id}", json={}).status_code, 401)

    def test_authority_can_access_reports(self):
        authority = self.make_user(ROLE_AUTHORITY)
        report = self.make_report(authority.id)
        self.session = FakeReportSession([report])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        listing = self.client.get("/api/v1/reports")
        retrieved = self.client.get(f"/api/v1/reports/{report.id}")

        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 1)
        self.assertEqual(retrieved.status_code, 200)
        self.assertEqual(retrieved.json()["id"], str(report.id))

    def test_citizen_cannot_modify_another_users_report(self):
        owner = self.make_user(ROLE_CITIZEN)
        other = self.make_user(ROLE_CITIZEN)
        report = self.make_report(owner.id)
        self.session = FakeReportSession([report])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(other)

        response = self.client.patch(
            f"/api/v1/reports/{report.id}",
            json={"title": "Unauthorized change"},
        )

        self.assertEqual(response.status_code, 403)

    def test_authority_can_update_moderate_a_report(self):
        authority = self.make_user(ROLE_AUTHORITY)
        report = self.make_report(uuid4())
        self.session = FakeReportSession([report])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.patch(
            f"/api/v1/reports/{report.id}",
            json={"status": "UNDER_REVIEW"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "UNDER_REVIEW")

    def test_list_and_get_by_id_work(self):
        citizen = self.make_user(ROLE_CITIZEN)
        report = self.make_report(citizen.id)
        self.session = FakeReportSession([report])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(citizen)

        listing = self.client.get("/api/v1/reports")
        retrieved = self.client.get(f"/api/v1/reports/{report.id}")

        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()), 1)
        self.assertEqual(retrieved.status_code, 200)
        self.assertEqual(retrieved.json()["title"], report.title)

    def test_missing_report_returns_404(self):
        citizen = self.make_user(ROLE_CITIZEN)
        self.authenticate_as(citizen)

        response = self.client.get(f"/api/v1/reports/{uuid4()}")

        self.assertEqual(response.status_code, 404)

    def test_invalid_uuid_returns_422(self):
        citizen = self.make_user(ROLE_CITIZEN)
        self.authenticate_as(citizen)

        response = self.client.get("/api/v1/reports/not-a-uuid")

        self.assertEqual(response.status_code, 422)

    def test_invalid_payload_returns_422(self):
        citizen = self.make_user(ROLE_CITIZEN)
        self.authenticate_as(citizen)

        response = self.client.post(
            "/api/v1/reports",
            json={
                "title": "",
                "description": "k",
                "report_type": "UNKNOWN",
                "latitude": 91,
                "longitude": 181,
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_blank_text_is_rejected(self):
        citizen = self.make_user(ROLE_CITIZEN)
        self.authenticate_as(citizen)

        response = self.client.post(
            "/api/v1/reports",
            json={
                "title": "   ",
                "description": "Valid description",
                "report_type": "SAFETY",
                "latitude": 12,
                "longitude": 77,
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_invalid_coordinates_are_rejected(self):
        citizen = self.make_user(ROLE_CITIZEN)
        self.authenticate_as(citizen)

        response = self.client.post(
            "/api/v1/reports",
            json={
                "title": "Valid title",
                "description": "Valid description",
                "report_type": "SAFETY",
                "latitude": -91,
                "longitude": 200,
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_response_schema_does_not_expose_sensitive_fields(self):
        citizen = self.make_user(ROLE_CITIZEN)
        report = self.make_report(citizen.id)
        validated = ReportResponse.model_validate(report)

        self.assertEqual(validated.created_by_id, citizen.id)
        self.assertNotIn("hashed_password", validated.model_dump())

    def test_created_by_id_is_taken_from_authenticated_user(self):
        citizen = self.make_user(ROLE_CITIZEN)
        self.authenticate_as(citizen)

        response = self.client.post(
            "/api/v1/reports",
            json={
                "title": "Water issue",
                "description": "The water line is leaking",
                "report_type": "WATER",
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["created_by_id"], str(citizen.id))

    def test_invalid_status_transition_returns_409(self):
        authority = self.make_user(ROLE_AUTHORITY)
        report = self.make_report(uuid4(), status=ReportStatus.RESOLVED)
        self.session = FakeReportSession([report])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.patch(
            f"/api/v1/reports/{report.id}",
            json={"status": "OPEN"},
        )

        self.assertEqual(response.status_code, 409)

    def test_valid_status_transitions_work(self):
        authority = self.make_user(ROLE_AUTHORITY)
        report = self.make_report(uuid4(), status=ReportStatus.OPEN)
        self.session = FakeReportSession([report])
        app.dependency_overrides[get_db] = lambda: self.session
        self.authenticate_as(authority)

        response = self.client.patch(
            f"/api/v1/reports/{report.id}",
            json={"status": "UNDER_REVIEW"},
        )
        resolved = self.client.patch(
            f"/api/v1/reports/{report.id}",
            json={"status": "RESOLVED"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(resolved.status_code, 200)
        self.assertEqual(resolved.json()["status"], "RESOLVED")


if __name__ == "__main__":
    unittest.main()
