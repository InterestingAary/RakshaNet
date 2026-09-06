# RakshaNet AI Implementation Summary

## Implemented capabilities

- Explainable habitation risk assessment.
- Relocation-priority assessment with transparent shelter capacity arithmetic.
- Citizen incident classification using a lightweight keyword baseline.
- Confidence, missing/stale data warnings, model version, timestamp, and human-review flags on every prediction.

## Files and APIs

The service lives in `app/`: `schemas.py` contains validation contracts, `services.py` contains inference, `config.py` contains thresholds/versioning, and `main.py` exposes:

- `POST /ai/risk-assessment`
- `POST /ai/relocation-priority`
- `POST /ai/classify-report`
- `GET /ai/model-status`

Set `RAKSHANET_API_KEY` to require the same value in `X-API-Key`. Since the inspected workspace had no authentication system, the local prototype leaves authentication disabled when that variable is unset.

## Model and dataset status

This is a rule-based prototype, not a trained ML model. It uses weighted hazard/exposure/accessibility rules and keyword matching. No dataset was present in the inspected workspace, and no synthetic or official disaster data has been claimed. The weights require validation against labelled, authoritative data before operational use.

## Response and review workflow

Responses are advisory. `PENDING_REVIEW` is returned for reports, and high-risk, low-confidence, stale, or unsuitable-shelter results require human review. The API does not issue evacuation orders, close roads, reject reports, or treat images as ground truth. Original citizen reports should be persisted by the owning backend separately from these predictions.

## Example request

```json
{
  "habitation_id": "HAB-001",
  "hazard_severity": 0.8,
  "hazard_zone_intersection": true,
  "population": 500,
  "vulnerable_population": 140,
  "available_shelter_capacity": 80,
  "estimated_relocation_demand": 150,
  "road_accessibility": 0.4
}
```

## Run and test

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
pytest
```

## Evaluation and limitations

No accuracy, precision, recall, F1, or calibration results are reported because there is no labelled dataset. Tests cover validation, high/low evidence paths, capacity shortage/unknown states, report verification, model versioning, and the absence of automatic evacuation behavior. Future work is authoritative data integration, calibrated supervised models, route/shelter suitability integration, audit persistence, authorized override endpoints, and evaluation with false-negative monitoring for P1/P2 cases.

The evaluation entry point is `python -m app.training.evaluate_models`; it reports that metrics are unavailable when no labelled dataset is provided and never fabricates scores.