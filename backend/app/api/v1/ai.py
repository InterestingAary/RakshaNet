from fastapi import APIRouter, Depends, Header, HTTPException

from app.core.ai_config import API_KEY, MODEL_VERSION
from app.schemas.ai import AdvisoryResponse, RelocationRequest, ReportRequest, RiskRequest
from app.services.ai_service import assess_relocation, assess_risk, classify_report

router = APIRouter(prefix="/ai", tags=["ai-decision-support"])


def verify_ai_access(x_api_key: str | None = Header(default=None)):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Valid X-API-Key is required")


@router.get("/model-status")
def model_status(_auth: None = Depends(verify_ai_access)):
    return {
        "available": True,
        "model_version": MODEL_VERSION,
        "approach": "transparent weighted rules and keyword baseline",
        "dataset": "none; prototype is not trained on official disaster data",
        "advisory_only": True,
    }


@router.post("/risk-assessment", response_model=AdvisoryResponse)
def risk_assessment(request: RiskRequest, _auth: None = Depends(verify_ai_access)):
    return AdvisoryResponse(**assess_risk(request))


@router.post("/relocation-priority", response_model=AdvisoryResponse)
def relocation_priority(request: RelocationRequest, _auth: None = Depends(verify_ai_access)):
    return AdvisoryResponse(**assess_relocation(request))


@router.post("/classify-report", response_model=AdvisoryResponse)
def report_classification(request: ReportRequest, _auth: None = Depends(verify_ai_access)):
    return AdvisoryResponse(**classify_report(request))
