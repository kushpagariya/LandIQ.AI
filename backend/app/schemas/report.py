from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ReportGenerationResponse(BaseModel):
    report_id: UUID
    property_id: UUID
    status: str
    download_url: str
    generated_at: datetime
