from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4
from typing import Optional

class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    property_id: str
    file_path: str
    status: str = "generating"
    trust_score: int = Field(..., ge=0, le=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expired_at: Optional[datetime] = None
