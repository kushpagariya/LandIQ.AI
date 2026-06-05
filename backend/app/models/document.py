from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4
from typing import Optional, Dict, Any

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    property_id: str
    file_name: str
    file_type: str
    file_path: str
    status: str = "uploaded"
    ocr_text: Optional[str] = None
    extraction_metadata: Optional[Dict[str, Any]] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
