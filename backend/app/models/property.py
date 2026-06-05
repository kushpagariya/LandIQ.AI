from pydantic import BaseModel, Field
from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional

class Property(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: Optional[str] = None
    survey_number: str
    state: str
    district: str
    taluka: str
    village: str
    area_acre: float
    soil_type: str
    soil_quality_score: int
    land_type: str
    irrigated: int
    road_touch: int
    road_width_ft: int
    distance_to_highway_km: float
    water_source: str
    number_of_owners: int
    unknown_registrations: int
    takeover_risk: int
    avg_price_per_acre_nearby: float
    asking_price: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
