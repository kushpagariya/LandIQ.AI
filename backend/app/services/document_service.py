import os
import logging
from uuid import uuid4
from datetime import datetime
from pymongo.database import Database
from app.core.config import settings
from app.database.repository import MongoRepository

logger = logging.getLogger("landiq_backend")

def process_document_task(document_id: str, file_path: str, file_type: str, db_name: str):
    from app.database.session import client
    db = client[db_name]
    
    doc_repo = MongoRepository(db, "documents")
    try:
        from app.services.ocr_service import ocr_service
        ocr_text = ocr_service.run_ocr(file_path, file_type)
        extracted = ocr_service.extract_fields(ocr_text)
        
        doc_repo.update(document_id, {
            "status": "processed",
            "ocr_text": ocr_text,
            "extraction_metadata": extracted
        })
        
        owner_repo = MongoRepository(db, "ownership_records")
        owner_repo.collection.delete_many({"document_id": document_id})
        
        import math
        owners_list = extracted.get("owners", [])
        num_owners = len(owners_list)
        shares = []
        if num_owners > 0:
            base_share = math.floor(10000 / num_owners) / 100.0
            for i in range(num_owners - 1):
                shares.append(base_share)
            last_share = round(100.0 - sum(shares), 2)
            shares.append(last_share)
        
        doc_rec = doc_repo.get(document_id)
        if not doc_rec or "property_id" not in doc_rec:
            raise ValueError(f"Document {document_id} not found or missing property_id.")
        property_id = doc_rec["property_id"]
        
        for idx, owner_name in enumerate(owners_list):
            share = shares[idx]
            owner_repo.create({
                "id": str(uuid4()),
                "property_id": property_id,
                "document_id": document_id,
                "owner_name": owner_name,
                "share_percentage": share,
                "holding_type": "joint" if num_owners > 1 else "sole",
                "acquisition_date": None,
                "verification_metadata": {
                    "match_confidence": 1.0
                },
                "verification_status": "pending",
                "verified_at": None
            })
            
        logger.info(f"Background OCR processing completed for document {document_id}")
    except Exception as e:
        logger.error(f"Background OCR processing failed for document {document_id}: {e}")
        doc_repo.update(document_id, {"status": "failed"})

class DocumentService:
    def create_document(self, db: Database, property_id: str, file_name: str, file_type: str, file_path: str) -> dict:
        repo = MongoRepository(db, "documents")
        document_id = str(uuid4())
        uploaded_at = datetime.utcnow()
        
        doc_data = {
            "id": document_id,
            "property_id": property_id,
            "file_name": file_name,
            "file_type": file_type,
            "file_path": file_path,
            "status": "processing",
            "ocr_text": None,
            "extraction_metadata": None,
            "uploaded_at": uploaded_at
        }
        repo.create(doc_data)
        
        return {
            "document_id": document_id,
            "property_id": property_id,
            "file_name": file_name,
            "file_type": file_type,
            "status": "processing",
            "uploaded_at": uploaded_at
        }

document_service = DocumentService()
