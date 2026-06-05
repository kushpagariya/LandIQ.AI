from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4
from typing import Optional, Dict, Any

class Prediction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    property_id: str
    prediction_type: str
    estimated_value: Optional[float] = None
    confidence_score: float
    details: Dict[str, Any]
    model_version: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
