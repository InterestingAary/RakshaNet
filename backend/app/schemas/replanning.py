from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ReplanningRecommendation(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    shelter_id: UUID
    shelter_name: str
    distance_km: float
    available_capacity: int
    risk_flags: list[str]
    risk_score: int
    recommendation_reason: str
    latitude: float
    longitude: float
    disaster_id: UUID | None = None
