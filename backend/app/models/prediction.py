from pydantic import BaseModel, Field, validator
from datetime import datetime
from uuid import uuid4
from typing import Optional, Dict, Any

class Prediction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    property_id: str
    prediction_type: str
    estimated_value: Optional[float] = None
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    details: Dict[str, Any]
    model_version: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @validator("confidence_score")
    def validate_confidence_score(cls, v):
        if not (0.0 <= v <= 1.0):
            raise ValueError("confidence_score must be between 0.0 and 1.0")
        return v
