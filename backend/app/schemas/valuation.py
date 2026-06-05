from pydantic import BaseModel, Field
from uuid import UUID

class ValuationResponse(BaseModel):
    property_id: UUID
    estimated_market_value_inr: float
    price_per_acre_inr: float
    valuation_classification: str = Field(..., description="undervalued | fair | overvalued")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    model_version: str
