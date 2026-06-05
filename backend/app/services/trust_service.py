import logging
from typing import Dict, Any
from pymongo.database import Database
from app.services.fraud_service import fraud_service
from app.services.ml_service import ml_valuation_service
from app.database.repository import MongoRepository

logger = logging.getLogger("landiq_backend")

class TrustService:
    def calculate_trust_score(self, property_data: dict, db: Database) -> dict:
        property_id = property_data.get("id")
        
        doc_repo = MongoRepository(db, "documents")
        owner_repo = MongoRepository(db, "ownership_records")
        
        docs = doc_repo.list({"property_id": property_id}) if property_id else []
        owners = owner_repo.list({"property_id": property_id}) if property_id else []
        
        # 1. Document Consistency Score (S_doc)
        s_doc = 0
        if docs:
            has_mismatch = False
            has_verified = False
            has_fuzzy = False
            
            for owner in owners:
                status = owner.get("verification_status")
                if status == "mismatch":
                    has_mismatch = True
                    break
                elif status == "verified":
                    has_verified = True
                    encumbrances = owner.get("encumbrances") or {}
                    similarity = encumbrances.get("match_confidence", 1.0)
                    if similarity < 1.0:
                        has_fuzzy = True
            
            if has_mismatch:
                s_doc = 0
            elif has_verified:
                s_doc = 70 if has_fuzzy else 100
            else:
                s_doc = 70  # uploaded but pending validation fuzzy fallback
        else:
            s_doc = 0
            
        # 2. Fraud Risk Score (S_fraud)
        fraud_result = fraud_service.check_fraud(property_data, db)
        fraud_score = fraud_result["risk_score"]
        s_fraud = 100 - fraud_score
        
        # 3. Valuation Confidence Score (S_val)
        try:
            val_result = ml_valuation_service.predict(property_data)
            confidence = val_result["confidence_score"]
        except Exception as e:
            logger.warning(f"Error predicting in trust calculation: {e}")
            confidence = 0.8
        s_val = int(confidence * 100)
        
        # 4. Data Completeness Score (S_data)
        optional_fields = ["asking_price", "latitude", "longitude"]
        provided_count = 0
        for field in optional_fields:
            if property_data.get(field) is not None:
                provided_count += 1
        s_data = int((provided_count / len(optional_fields)) * 100)
        
        # Trust Score calculation
        trust_score_val = (0.35 * s_doc) + (0.30 * s_fraud) + (0.20 * s_val) + (0.15 * s_data)
        trust_score = int(round(trust_score_val))
        
        if trust_score >= 90:
            classification = "highly_trustworthy"
        elif trust_score >= 75:
            classification = "trustworthy"
        elif trust_score >= 50:
            classification = "moderate"
        else:
            classification = "high_risk"
            
        return {
            "property_id": property_id,
            "trust_score": trust_score,
            "rating_classification": classification,
            "breakdown": {
                "document_verification": int(s_doc),
                "valuation_confidence": int(s_val),
                "fraud_risk_factor": int(s_fraud),
                "data_completeness": int(s_data)
            }
        }

trust_service = TrustService()
