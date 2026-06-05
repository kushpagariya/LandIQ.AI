from pydantic import BaseModel, Field
from uuid import UUID
from typing import Dict

class TrustScoreResponse(BaseModel):
    property_id: UUID
    trust_score: int = Field(..., ge=0, le=100)
    rating_classification: str = Field(..., description="high_risk | moderate | trustworthy | highly_trustworthy")
    breakdown: Dict[str, int]
