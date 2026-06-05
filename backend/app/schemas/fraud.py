from pydantic import BaseModel, Field
from uuid import UUID
from typing import List

class FraudIndicator(BaseModel):
    name: str
    status: str = Field(..., description="clear | warning | high_risk")
    description: str

class FraudAnalysisResponse(BaseModel):
    property_id: UUID
    overall_fraud_risk: str = Field(..., description="low | medium | high")
    risk_score: int = Field(..., ge=0, le=100)
    triggered_rules: List[str]
    indicators: List[FraudIndicator]
