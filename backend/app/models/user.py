from pydantic import BaseModel, Field
from datetime import datetime, timezone
from uuid import uuid4

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    email: str
    password_hash: str
    full_name: str
    role: str = "buyer"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
