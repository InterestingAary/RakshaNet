# RakshaNet

**RakshaNet** is an offline-first, disaster-response and evacuation platform built for citizens, emergency authorities, and district first-responders.

Developed by team **GridMinds** for **Smart India Hackathon (SIH) 2026**.

---

## Consolidated Architecture

The repository consolidates the complete functionality contributed across all project modules into a single unified platform:

```
RakshaNet/
├── backend/                        # Complete FastAPI backend
│   ├── alembic/                    # Database migrations (PostGIS-enabled)
│   ├── app/
│   │   ├── api/v1/                 # Endpoints: auth, disasters, hazards, shelters,
│   │   │                           # incidents, reports, relocation, blocked-roads, ai
│   │   ├── core/                   # Security, JWT auth, database engine, AI config
│   │   ├── models/                 # SQLAlchemy models with PostGIS Geometry columns
│   │   ├── schemas/                # Pydantic validation contracts
│   │   ├── services/               # Replanning, hazard exposure, routing engine, AI service
│   │   └── training/               # Model evaluation & testing utilities
│   └── tests/                      # 144 unit and integration tests (100% passing)
│
├── frontend-citizen-portal/         # Next.js 16 Citizen & Authority Application
│   ├── app/
│   │   ├── citizen/                # Citizen Emergency Portal (map, exposure, shelters, routing)
│   │   └── authority/              # Authority Dashboard (disasters, hazards, blocked roads, AI)
│   ├── components/                 # Map layers (Leaflet), triage tables, KPI metrics, AI panel
│   ├── context/                    # DisasterContext, AuthContext, DemoContext, LocationContext
│   ├── hooks/                      # useCitizenExposure, useBlockedRoads, useShelters, useRoute
│   └── services/                   # apiClient, authService, shelterService, aiService, etc.
│
├── frontend-government-portal/      # Vijayawada OmniTriage Command Center
│   ├── index.html                  # Standalone emergency operations UI (zero build step)
│   ├── styles.css                  # Dark-mode command center design system
│   └── script.js                   # District triage scoring, SVG tactical vectors, event timeline
│
├── maps-and-routes/                # Tactical Geospatial & Routing Sandbox
│   ├── src/components/             # ControlHub, MapViewer, tactical hazard avoidance
│   └── src/pages/api/route.ts      # OpenRouteService (ORS) integration with avoid_polygons
│
├── ai-decision-support/            # AI Decision Support Prototype & Documentation
│   ├── AI_IMPLEMENTATION_SUMMARY.md # Model explainability and limitations documentation
│   └── evaluate_models.py          # Data evaluation & metrics integrity script
│
├── docker-compose.yml              # PostgreSQL 15 + PostGIS 3.4 container configuration
└── README.md                       # Master platform documentation
```

---

## Core Capabilities

### 1. Backend (FastAPI + PostGIS)
- **Role-Based Access Control**: JWT Bearer tokens with Citizen, Authority, and SuperAdmin privileges.
- **PostGIS Spatial Queries**: MultiPolygon hazard zone containment, nearest-shelter calculations using spatial indices, and distance algorithms.
- **Hazard Zone Lifecycle**: Separate creation and authority verification workflows; unverified hazards are never exposed publicly.
- **Shelter Capacity Tracking**: Real-time occupancy, effective capacity management, accessibility flags (medical, wheelchair, elderly).
- **Blocked-Road Reporting & Verification**: Citizen road obstacle reporting, authority verification/rejection/clearance, and append-only audit trail logging.
- **Dynamic Replanning & Avoidance Routing**: Routes around active verified hazards and verified blocked roads with OpenRouteService polygon avoidance or deterministic fallback.
- **AI Decision Support**: Explainable habitation risk assessment, relocation priority ranking (P1–P4), and incident report triage with human-in-the-loop flags.

### 2. Citizen Portal (`/citizen`)
- **Real-Time Emergency Map**: Interactive Leaflet map displaying verified shelters, hazard boundaries, user location, and blocked roads.
- **Citizen Exposure Warnings**: Real-time PostGIS-backed exposure warnings when user coordinates enter or approach active hazard zones.
- **Nearest Verified Shelter Recommendation**: Deterministic nearest-available shelter matching with real-time capacity and navigation paths.
- **Incident & Blocked Road Reporting**: Quick reporting form with location auto-fill and category tagging.
- **Offline Honesty & Demo Mode**: Explicit visual badges for offline state; never fabricates live updates when disconnected.

### 3. Authority Dashboard (`/authority`)
- **Operational KPI Cards**: Active disaster status, verified shelter occupancy, open incidents, and blockage count.
- **Disaster Event Management**: Lifecycle controls to create, activate, and resolve district emergencies.
- **Blocked-Road Verification**: Authority review queue with evidence inspection, verification, clearance, and audit history.
- **AI Decision Support Console**: Interactive habitation risk assessment, relocation priority evaluation, and report classification.

### 4. Government OmniTriage Command Center (`frontend-government-portal`)
- Standalone zero-dependency command center for field deployments, district emergency cells (DEOC), and NDMA operators.
- Multi-factor vulnerability triage (medical criticality, mobility restrictions, age brackets).

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- Docker (for PostgreSQL/PostGIS)

### 1. Start the Database
```bash
docker-compose up -d
```

### 2. Run Database Migrations
```bash
cd backend
python -m alembic upgrade head
```

### 3. Start Backend Server
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation is available at `http://localhost:8000/docs`.

### 4. Start Citizen & Authority Portal
```bash
cd frontend-citizen-portal
npm install
npm run dev
```
Access at `http://localhost:3000`:
- Citizen Portal: `http://localhost:3000/citizen`
- Authority Dashboard: `http://localhost:3000/authority`

### 5. Launch Government OmniTriage Command Center
```bash
cd frontend-government-portal
python -m http.server 3001
```
Access at `http://localhost:3001`.

---

## Verification & Testing

### Backend Test Suite
Run all 144 unit and integration tests:
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Lint & Production Build
```bash
cd frontend-citizen-portal
npm run lint
npm run build
```

### Migration Integrity
```bash
cd backend
python -m alembic current
python -m alembic heads
```

---

## Preserved Reference Branches

All original feature and team branches are retained as backups:
- `sourajit-backend` (commit `c177050`)
- `frontend/citizen-portal` (commit `2657e24`)
- `frontend-government-portal` (commit `30705d0`)
- `Maps-&-routes` (commit `46e4656`)
- `ai-decision-support` (commit `3c516f4`)

---

## Team & Contributors (GridMinds — SIH 2026)

- **Lead & Primary Architect:** Aryan Mittal ([@InterestingAary](https://github.com/InterestingAary))
- **Team Contributors:**
  - Sourajit Balabantaray ([@Sourajit-balabantaray](https://github.com/Sourajit-balabantaray)) — Backend & Routing Modules
  - GridMinds SIH Team Members — UI/UX, Maps, Decision Support & Research