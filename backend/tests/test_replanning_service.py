import unittest
from datetime import datetime, timezone
from uuid import uuid4

from app.models.disaster import Disaster, DisasterSeverity, DisasterStatus, DisasterType
from app.models.incident import Incident, IncidentSeverity, IncidentStatus, IncidentType
from app.models.report import Report, ReportStatus, ReportType
from app.models.shelter import Shelter, ShelterStatus
from app.models.user import User
from app.services.replanning import build_relocation_recommendation


class FakeReplanningSession:
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


class ReplanningServiceTests(unittest.TestCase):
    def make_user(self):
        return User(
            id=uuid4(),
            full_name="Planner User",
            email="planner@example.com",
            phone=None,
            hashed_password="hashed-password",
            role="CITIZEN",
            is_active=True,
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
            title="Flood emergency",
            description="Overflowing drainage",
            disaster_type=DisasterType.FLOOD,
            severity=DisasterSeverity.HIGH,
            status=status,
            latitude=20.3,
            longitude=85.3,
            location="City center",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )

    def make_incident(self, owner_id, **kwargs):
        defaults = dict(
            id=uuid4(),
            title="Road blockage",
            description="High severity incident",
            incident_type=IncidentType.FLOOD,
            severity=IncidentSeverity.HIGH,
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
            title="Unsafe route",
            description="Open report near route",
            report_type=ReportType.SAFETY,
            status=ReportStatus.OPEN,
            latitude=20.02,
            longitude=85.02,
            location="Route corridor",
            created_by_id=owner_id,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        defaults.update(kwargs)
        return Report(**defaults)

    def test_service_returns_nearest_eligible_shelter(self):
        user = self.make_user()
        near = self.make_shelter(user.id, name="Near Shelter", latitude=20.0, longitude=85.0, total_capacity=25, current_occupancy=5)
        far = self.make_shelter(user.id, name="Far Shelter", latitude=20.1, longitude=85.1, total_capacity=40, current_occupancy=5)
        session = FakeReplanningSession(shelters=[near, far])

        recommendation = build_relocation_recommendation(session, 20.01, 85.01)

        self.assertEqual(recommendation["shelter_name"], "Near Shelter")
        self.assertEqual(recommendation["available_capacity"], 20)
        self.assertIn("risk_flags", recommendation)

    def test_full_shelter_is_excluded(self):
        user = self.make_user()
        full = self.make_shelter(user.id, name="Full Shelter", latitude=20.0, longitude=85.0, total_capacity=10, current_occupancy=10)
        open_shelter = self.make_shelter(user.id, name="Open Shelter", latitude=20.2, longitude=85.2, total_capacity=50, current_occupancy=5)
        session = FakeReplanningSession(shelters=[full, open_shelter])

        recommendation = build_relocation_recommendation(session, 20.0, 85.0)

        self.assertEqual(recommendation["shelter_name"], "Open Shelter")

    def test_inactive_shelter_is_excluded(self):
        user = self.make_user()
        inactive = self.make_shelter(user.id, name="Inactive Shelter", status=ShelterStatus.INACTIVE)
        active = self.make_shelter(user.id, name="Active Shelter", latitude=20.2, longitude=85.2)
        session = FakeReplanningSession(shelters=[inactive, active])

        recommendation = build_relocation_recommendation(session, 20.0, 85.0)

        self.assertEqual(recommendation["shelter_name"], "Active Shelter")

    def test_capacity_changes_are_reflected_immediately(self):
        user = self.make_user()
        shelter = self.make_shelter(user.id, name="Changing Shelter", total_capacity=20, current_occupancy=19)
        session = FakeReplanningSession(shelters=[shelter])

        recommendation = build_relocation_recommendation(session, 20.0, 85.0)

        self.assertEqual(recommendation["available_capacity"], 1)

    def test_nearby_severe_incident_increases_risk(self):
        user = self.make_user()
        shelter = self.make_shelter(user.id, name="Risky Shelter", latitude=20.0, longitude=85.0, total_capacity=20, current_occupancy=0)
        safer = self.make_shelter(user.id, name="Safer Shelter", latitude=20.3, longitude=85.3, total_capacity=20, current_occupancy=0)
        incident = self.make_incident(user.id, latitude=20.01, longitude=85.01, severity=IncidentSeverity.CRITICAL, status=IncidentStatus.OPEN)
        session = FakeReplanningSession(shelters=[shelter, safer], incidents=[incident])

        recommended = build_relocation_recommendation(session, 20.0, 85.0)

        self.assertEqual(recommended["shelter_name"], "Risky Shelter")
        self.assertGreater(recommended["risk_score"], 0)
        self.assertIn("nearby_incident", recommended["risk_flags"])

    def test_nearby_open_report_increases_risk(self):
        user = self.make_user()
        shelter = self.make_shelter(user.id, name="Reported Shelter", latitude=20.0, longitude=85.0, total_capacity=20, current_occupancy=0)
        alternate = self.make_shelter(user.id, name="Clean Shelter", latitude=20.2, longitude=85.2, total_capacity=20, current_occupancy=0)
        report = self.make_report(user.id, latitude=20.01, longitude=85.01, status=ReportStatus.OPEN)
        session = FakeReplanningSession(shelters=[shelter, alternate], reports=[report])

        recommended = build_relocation_recommendation(session, 20.0, 85.0)

        self.assertEqual(recommended["shelter_name"], "Reported Shelter")
        self.assertGreater(recommended["risk_score"], 0)
        self.assertIn("nearby_open_report", recommended["risk_flags"])

    def test_no_eligible_shelters_raises_value_error(self):
        user = self.make_user()
        full = self.make_shelter(user.id, name="Full Shelter", total_capacity=10, current_occupancy=10)
        inactive = self.make_shelter(user.id, name="Inactive Shelter", status=ShelterStatus.INACTIVE)
        session = FakeReplanningSession(shelters=[full, inactive])

        with self.assertRaises(ValueError):
            build_relocation_recommendation(session, 20.0, 85.0)

    def test_invalid_or_inactive_disaster_behavior_is_preserved(self):
        user = self.make_user()
        shelter = self.make_shelter(user.id, latitude=20.0, longitude=85.0)
        missing_disaster = uuid4()
        inactive_disaster = self.make_disaster(user.id, status=DisasterStatus.CANCELLED)
        session = FakeReplanningSession(shelters=[shelter], disasters=[inactive_disaster])

        with self.assertRaises(ValueError):
            build_relocation_recommendation(session, 20.0, 85.0, disaster_id=missing_disaster)

        with self.assertRaises(ValueError):
            build_relocation_recommendation(session, 20.0, 85.0, disaster_id=inactive_disaster.id)

    def test_ranking_is_deterministic(self):
        user = self.make_user()
        shelter_a = self.make_shelter(user.id, name="Alpha", latitude=20.0, longitude=85.0, total_capacity=20, current_occupancy=0)
        shelter_b = self.make_shelter(user.id, name="Beta", latitude=20.0, longitude=85.0, total_capacity=20, current_occupancy=0)
        session = FakeReplanningSession(shelters=[shelter_a, shelter_b])

        first = build_relocation_recommendation(session, 20.0, 85.0)
        second = build_relocation_recommendation(session, 20.0, 85.0)

        self.assertEqual(first["shelter_name"], second["shelter_name"])

    def test_phase_7_distance_contract_is_preserved(self):
        user = self.make_user()
        near = self.make_shelter(user.id, name="Nearest", latitude=20.0, longitude=85.0, total_capacity=20, current_occupancy=0)
        far = self.make_shelter(user.id, name="Farther", latitude=20.2, longitude=85.2, total_capacity=20, current_occupancy=0)
        session = FakeReplanningSession(shelters=[near, far])

        recommendation = build_relocation_recommendation(session, 20.01, 85.01)

        self.assertEqual(recommendation["shelter_name"], "Nearest")
        self.assertLess(recommendation["distance_km"], 2)
