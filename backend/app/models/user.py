from pydantic import BaseModel, Field
from datetime import datetime
from uuid import uuid4

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    email: str
    password_hash: str
    full_name: str
    role: str = "buyer"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
