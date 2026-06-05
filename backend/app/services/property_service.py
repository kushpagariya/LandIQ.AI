import logging
from uuid import uuid4
from datetime import datetime
from typing import Optional, List
from pymongo.database import Database
from app.database.repository import MongoRepository
from app.schemas.property import PropertyCreate

logger = logging.getLogger("landiq_backend")

class PropertyService:
    def create_property(self, db: Database, property_in: PropertyCreate) -> dict:
        repo = MongoRepository(db, "properties")
        property_id = str(uuid4())
        created_at = datetime.utcnow()
        
        prop_data = property_in.dict()
        prop_data["id"] = property_id
        prop_data["user_id"] = "00000000-0000-0000-0000-000000000000"  # Mock default user context
        prop_data["created_at"] = created_at
        prop_data["updated_at"] = created_at
        
        repo.create(prop_data)
        
        return {
            "id": property_id,
            "survey_number": property_in.survey_number,
            "status": "pending_documents",
            "created_at": created_at
        }

    def get_property(self, db: Database, property_id: str) -> Optional[dict]:
        repo = MongoRepository(db, "properties")
        return repo.get(property_id)

    def list_properties(self, db: Database) -> List[dict]:
        repo = MongoRepository(db, "properties")
        return repo.list()

property_service = PropertyService()
