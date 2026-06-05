from typing import Any, Dict, List, Optional
from pymongo.database import Database

class MongoRepository:
    def __init__(self, db: Database, collection_name: str):
        self.collection = db[collection_name]

    def get(self, id: str) -> Optional[Dict[str, Any]]:
        result = self.collection.find_one({"id": id})
        if result:
            result.pop("_id", None)
        return result

    def get_by_field(self, field_name: str, value: Any) -> Optional[Dict[str, Any]]:
        result = self.collection.find_one({field_name: value})
        if result:
            result.pop("_id", None)
        return result

    def list(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if filters is None:
            filters = {}
        results = list(self.collection.find(filters))
        for res in results:
            res.pop("_id", None)
        return results

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Copy to avoid modifying the original dict
        doc = dict(data)
        self.collection.insert_one(doc)
        doc.pop("_id", None)
        return doc

    def update(self, id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        # Copy to avoid modifying the original dict
        doc = dict(data)
        result = self.collection.find_one_and_update(
            {"id": id},
            {"$set": doc},
            return_document=True
        )
        if result:
            result.pop("_id", None)
        return result

    def delete(self, id: str) -> bool:
        result = self.collection.delete_one({"id": id})
        return result.deleted_count > 0
