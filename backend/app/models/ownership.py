from pydantic import BaseModel, Field
from datetime import datetime, date
from uuid import uuid4
from typing import Optional, Dict, Any

class OwnershipRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    property_id: str
    document_id: Optional[str] = None
    owner_name: str
    share_percentage: float = Field(..., ge=0.0, le=100.0)
    holding_type: str = "sole"
    acquisition_date: Optional[date] = None
    encumbrances: Optional[Dict[str, Any]] = None
    verification_metadata: Optional[Dict[str, Any]] = None
    match_info: Optional[Dict[str, Any]] = None
    verification_status: str = "pending"
    verified_at: Optional[datetime] = None
