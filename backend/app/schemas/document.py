from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Dict, Any

class DocumentStatusResponse(BaseModel):
    document_id: UUID
    property_id: UUID
    file_name: str
    file_type: str
    status: str = Field(..., description="uploaded | processing | processed | failed")
    uploaded_at: datetime

class OCRExtractionResponse(BaseModel):
    document_id: UUID
    status: str
    ocr_confidence: float = Field(..., ge=0.0, le=1.0)
    file_type: str
    extracted_fields: Dict[str, Any]
