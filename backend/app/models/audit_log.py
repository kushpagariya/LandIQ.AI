from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4
from typing import Optional, Dict, Any

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: Optional[str] = None
    action: str
    target_table: str
    target_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    changes: Optional[Dict[str, Any]] = None
