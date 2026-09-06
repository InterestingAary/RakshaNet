from sqlalchemy import func
from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models.user import User, ROLE_AUTHORITY, ROLE_CITIZEN
from app.models.disaster import Disaster, DisasterType, DisasterSeverity, DisasterStatus
from app.models.shelter import Shelter, ShelterStatus
from app.models.hazard_zone import HazardZone
from app.models.blocked_road import BlockedRoad, BlockedRoadStatus, BlockageType, BlockageSeverity, BlockedRoadAuditLog, AuditAction
from app.models.incident import Incident, IncidentType, IncidentSeverity, IncidentStatus

def seed():
    db = SessionLocal(bind=engine)
    try:
        # 1. Authority Users
        auth1 = db.query(User).filter_by(email="authority@rakshanet.gov.in").first()
        if not auth1:
            auth1 = User(
                full_name="Lt. A. Mehta",
                email="authority@rakshanet.gov.in",
                hashed_password=hash_password("auth123!"),
                role=ROLE_AUTHORITY,
                is_active=True,
            )
            db.add(auth1)

        auth2 = db.query(User).filter_by(email="auth-3301@rakshanet.gov.in").first()
        if not auth2:
            auth2 = User(
                full_name="Lt. A. Mehta",
                email="auth-3301@rakshanet.gov.in",
                hashed_password=hash_password("password123"),
                role=ROLE_AUTHORITY,
                is_active=True,
            )
            db.add(auth2)

        # Citizen User
        cit1 = db.query(User).filter_by(email="citizen@example.com").first()
        if not cit1:
            cit1 = User(
                full_name="S. Rao (CIT-1042)",
                email="citizen@example.com",
                hashed_password=hash_password("citizen123!"),
                role=ROLE_CITIZEN,
                is_active=True,
            )
            db.add(cit1)

        db.commit()

        # 2. Active Disaster
        disaster = db.query(Disaster).filter_by(status=DisasterStatus.ACTIVE).first()
        if not disaster:
            disaster = Disaster(
                title="Flood Emergency — Vijayawada Riverfront",
                description="Rising water levels in Krishna River basin affecting Patamata, Bandar & Vijayawada East sectors.",
                disaster_type=DisasterType.FLOOD,
                severity=DisasterSeverity.CRITICAL,
                status=DisasterStatus.ACTIVE,
                latitude=16.5062,
                longitude=80.6480,
                created_by_id=auth1.id,
            )
            db.add(disaster)
            db.commit()
            db.refresh(disaster)

        # 3. Shelters
        shelter_data = [
            ("Shelter A", "Patamata Relief Point", 16.5062, 80.6480, 1000, 830, True),
            ("Shelter B", "Auto Nagar School Campus", 16.5000, 80.6475, 800, 728, True),
            ("Shelter C", "Vijayawada East Community Hall", 16.5165, 80.6352, 1200, 450, True),
            ("Shelter D", "Bandar Bus Depot", 16.5137, 80.6192, 600, 311, True),
        ]
        for name, desc, lat, lon, cap, occ, ver in shelter_data:
            s = db.query(Shelter).filter_by(name=name).first()
            if not s:
                geom_pt = func.ST_SetSRID(func.ST_MakePoint(lon, lat), 4326)
                s = Shelter(
                    name=name,
                    description=desc,
                    latitude=lat,
                    longitude=lon,
                    geom=geom_pt,
                    total_capacity=cap,
                    current_occupancy=occ,
                    status=ShelterStatus.ACTIVE,
                    verified=ver,
                    created_by_id=auth1.id,
                )
                db.add(s)
        db.commit()

        # 4. Verified Hazard Zone
        hz = db.query(HazardZone).filter_by(name="Krishna River Low-Lying Flood Belt").first()
        if not hz:
            geojson_str = '{"type":"MultiPolygon","coordinates":[[[[80.62,16.49],[80.66,16.49],[80.66,16.52],[80.62,16.52],[80.62,16.49]]]]}'
            hz = HazardZone(
                disaster_id=disaster.id,
                name="Krishna River Low-Lying Flood Belt",
                severity=5,
                geometry=func.ST_SetSRID(func.ST_GeomFromGeoJSON(geojson_str), 4326),
                source="District Emergency Operations Cell",
                verified=True,
            )
            db.add(hz)
            db.commit()

        # 5. Blocked Road and Audit Log
        road = db.query(BlockedRoad).filter_by(road_name="MG Road, Bandar (Route B)").first()
        if not road:
            geom_pt = func.ST_SetSRID(func.ST_MakePoint(80.6350, 16.5100), 4326)
            road = BlockedRoad(
                road_name="MG Road, Bandar (Route B)",
                disaster_id=disaster.id,
                latitude=16.5100,
                longitude=80.6350,
                geom=geom_pt,
                blockage_type=BlockageType.FLOODED.value,
                severity=BlockageSeverity.FULL_CLOSURE.value,
                status=BlockedRoadStatus.VERIFIED.value,
                description="Severe waterlogging on Route B east connector. Impassable for light vehicles.",
                verified=True,
                reported_by_id=cit1.id,
                verified_by_id=auth1.id,
            )
            db.add(road)
            db.flush()

            audit1 = BlockedRoadAuditLog(
                blocked_road_id=road.id,
                changed_by_id=cit1.id,
                action=AuditAction.REPORTED.value,
                previous_status=None,
                new_status=BlockedRoadStatus.REPORTED.value,
                notes="Citizen CIT-4821 reported flooded route near Bandar junction",
            )
            audit2 = BlockedRoadAuditLog(
                blocked_road_id=road.id,
                changed_by_id=auth1.id,
                action=AuditAction.VERIFIED.value,
                previous_status=BlockedRoadStatus.REPORTED.value,
                new_status=BlockedRoadStatus.VERIFIED.value,
                notes="Authority verified road blockage. Traffic diverted to Route D.",
            )
            db.add_all([audit1, audit2])
            db.commit()

        # 6. Incidents
        inc = db.query(Incident).filter_by(title="Flooded Route — MG Road").first()
        if not inc:
            inc = Incident(
                title="Flooded Route — MG Road",
                description="Deep flood water blocking Route B connector. 27 citizens affected.",
                incident_type=IncidentType.FLOOD,
                severity=IncidentSeverity.CRITICAL,
                status=IncidentStatus.OPEN,
                latitude=16.5100,
                longitude=80.6350,
                created_by_id=cit1.id,
            )
            db.add(inc)
            db.commit()

        print("Database seed completed successfully.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
