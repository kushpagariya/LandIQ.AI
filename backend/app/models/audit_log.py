from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from uuid import uuid4
from typing import Optional, Dict, Any
import hashlib
import base64
from app.core.config import settings
from pymongo.database import Database

def anonymize_ip(ip: Optional[str]) -> Optional[str]:
    if not ip:
        return None
    
    store_ips = getattr(settings, "STORE_IP_ADDRESSES", True)
    user_consent = getattr(settings, "USER_CONSENT_GIVEN", True)
    if not store_ips or not user_consent:
        return None
    
    # Deterministic hash to anonymize PII
    salt = getattr(settings, "SECRET_KEY", "default_salt")
    hashed = hashlib.sha256(f"{ip}_{salt}".encode()).hexdigest()[:16]
    
    # Encryption wrapper simulation
    encrypted = base64.b64encode(hashed.encode()).decode()
    return f"ENC:{encrypted}"

def purge_old_audit_logs(db: Database):
    from app.database.repository import MongoRepository
    retention_days = getattr(settings, "DATA_RETENTION_DAYS", 90)
    cutoff = datetime.utcnow() - timedelta(days=retention_days)
    audit_repo = MongoRepository(db, "audit_logs")
    audit_repo.collection.delete_many({"timestamp": {"$lt": cutoff}})

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: Optional[str] = None
    action: str
    target_table: str
    target_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    changes: Optional[Dict[str, Any]] = None

    def __init__(self, **data):
        if "ip_address" in data:
            data["ip_address"] = anonymize_ip(data["ip_address"])
        super().__init__(**data)
