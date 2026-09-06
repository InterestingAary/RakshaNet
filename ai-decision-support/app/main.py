from fastapi import Depends, FastAPI, Header, HTTPException

from .config import API_KEY, MODEL_VERSION
from .schemas import AdvisoryResponse, RelocationRequest, ReportRequest, RiskRequest
from .services import assess_relocation, assess_risk, classify_report

app = FastAPI(title="RakshaNet AI Decision Support", version=MODEL_VERSION)


def require_api_key(x_api_key: str | None = Header(default=None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Valid X-API-Key is required")


def response(payload: dict) -> AdvisoryResponse:
    return AdvisoryResponse(**payload)


@app.get("/ai/model-status", dependencies=[Depends(require_api_key)])
def model_status():
    return {"available": True, "model_version": MODEL_VERSION, "approach": "transparent weighted rules and keyword baseline", "dataset": "none; prototype is not trained on official disaster data", "advisory_only": True}


@app.post("/ai/risk-assessment", response_model=AdvisoryResponse, dependencies=[Depends(require_api_key)])
def risk_assessment(request: RiskRequest):
    return response(assess_risk(request))


@app.post("/ai/relocation-priority", response_model=AdvisoryResponse, dependencies=[Depends(require_api_key)])
def relocation_priority(request: RelocationRequest):
    return response(assess_relocation(request))


@app.post("/ai/classify-report", response_model=AdvisoryResponse, dependencies=[Depends(require_api_key)])
def report_classification(request: ReportRequest):
    return response(classify_report(request))