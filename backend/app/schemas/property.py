from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PropertyBase(BaseModel):
    survey_number: str = Field(..., description="Indian land registry survey/khasra number")
    state: str = Field(..., description="State name (e.g., Maharashtra)")
    district: str = Field(..., description="District name (e.g., Nashik)")
    taluka: str = Field(..., description="Sub-district / Taluka")
    village: str = Field(..., description="Village / Gram Panchayat")
    area_acre: float = Field(..., gt=0, description="Total area in acres")
    soil_type: str = Field(..., description="Soil classification type (e.g. Black, Red, Black_Red_Mixed)")
    soil_quality_score: int = Field(..., ge=1, le=10, description="Soil quality score from 1 to 10")
    land_type: str = Field(..., description="Land classification type (e.g. Agricultural, Residential, Commercial)")
    irrigated: int = Field(..., ge=0, le=1, description="Irrigation status (1=Yes, 0=No)")
    road_touch: int = Field(..., ge=0, le=1, description="Road touch status (1=Yes, 0=No)")
    road_width_ft: int = Field(..., ge=0, description="Road width in feet")
    distance_to_highway_km: float = Field(..., ge=0, description="Distance to highway in KM")
    water_source: str = Field(..., description="Primary water source (e.g. Borewell, River, Well, Canal, None)")
    number_of_owners: int = Field(..., ge=1, description="Number of legal owners")
    unknown_registrations: int = Field(..., ge=0, description="Number of unknown registrations")
    takeover_risk: int = Field(..., ge=0, le=1, description="Takeover risk (1=Yes, 0=No)")
    avg_price_per_acre_nearby: float = Field(..., ge=0, description="Average price per acre nearby in INR")
    asking_price: Optional[float] = Field(None, ge=0, description="Quoted land price in INR")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class PropertyCreate(PropertyBase):
    @field_validator('state')
    @classmethod
    def validate_state(cls, v: str) -> str:
        allowed_states = {"Maharashtra"}
        if v not in allowed_states:
            raise ValueError(f"State '{v}' is not supported for verification during hackathon MVP.")
        return v

class PropertyResponse(PropertyBase):
    id: UUID
    user_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AnalyzeResponse(BaseModel):
    property_id: UUID
    predicted_value_inr: float
    price_classification: str
    confidence_score: float
    risk_flags: List[str]
    trust_score: int
    summary: str

class PropertyCreateResponse(BaseModel):
    id: UUID
    survey_number: str
    status: str
    created_at: datetime

