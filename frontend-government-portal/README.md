# Vijayawada OmniTriage — Government Emergency Command Center

**OMNITRIAGE** is the specialized Government & Incident Command Operations Portal for RakshaNet, tailored for the Vijayawada Emergency Evacuation & Relocation Intelligence System (Krishna Riverfront Zone).

## Operational Capabilities

- **District Command Dashboard**: Real-time operational overview with KPIs (critical population, available capacity, active blockages, rescue units).
- **Disaster Events Management**: Monitoring active emergencies (e.g. Krishna River flood events, severe cyclones) with official instructions and activation timestamps.
- **Live Tactical Map**: SVG-based tactical routing, visual hazard zones, evacuation vectors (Route A, B, C, D), and blockage status indicators.
- **Shelter Operations**: Real-time physical and effective capacity tracking, accessibility filters (medical support, wheelchair, elderly, children), and shelter coordinator contacts.
- **OmniTriage / Priority Cases**: Multi-factor citizen vulnerability triage scoring (medical criticality, mobility limitations, age bracket, hazard proximity, priority levels P1–P4).
- **Incident & Blockage Review**: Incident verification workflow with image/drone evidence review and priority tasking.
- **Response Team Dispatch**: Tracking NDRF, SDRF, Medical Corps, and Urban Search & Rescue teams with live assignments.
- **Timeline & Audit Trail**: Operational event log recording system activations, route blockages, and shelter updates.

## Architecture

- **Stack**: Standalone Vanilla HTML5, CSS3, and ES6 JavaScript.
- **Zero-Dependency**: No Node.js build step or package dependencies required. Can run offline directly from disk, on emergency field tablets, or served via any lightweight HTTP daemon.
- **Demo Mode**: Built-in interactive demo mode for training and operational drills.

## Running Locally

To run with Python HTTP server:

```bash
cd frontend-government-portal
python -m http.server 3001
```

Or open `index.html` directly in any modern web browser.