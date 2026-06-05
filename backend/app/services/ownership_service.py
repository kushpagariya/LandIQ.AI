import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from pymongo.database import Database
from app.database.repository import MongoRepository

logger = logging.getLogger("landiq_backend")

class OwnershipService:
    def verify_ownership(self, property_id: str, db: Database) -> dict:
        doc_repo = MongoRepository(db, "documents")
        owner_repo = MongoRepository(db, "ownership_records")
        
        docs = doc_repo.list({"property_id": property_id})
        owners = owner_repo.list({"property_id": property_id})
        
        last_checked = datetime.utcnow()
        
        if not docs:
            return {
                "property_id": property_id,
                "verification_status": "pending",
                "mismatches_found": ["No documents uploaded yet for verification."],
                "matches": [],
                "last_checked": last_checked
            }
            
        doc_owner_names = []
        for doc in docs:
            ext_meta = doc.get("extraction_metadata") or {}
            doc_owner_names.extend(ext_meta.get("owners", []))
            
        mismatches_found = []
        matches = []
        
        # If no owner names exist in the ownership_records, seed from the input or documents
        if not owners:
            # If no records exist, we cannot perform comparisons. We return mismatch.
            mismatches_found.append("No owner names provided for comparison.")
            return {
                "property_id": property_id,
                "verification_status": "mismatch",
                "mismatches_found": mismatches_found,
                "matches": [],
                "last_checked": last_checked
            }
            
        # Compare names
        for owner in owners:
            provided_name = owner.get("owner_name")
            best_match = None
            best_similarity = 0.0
            
            for doc_name in doc_owner_names:
                sim = self._levenshtein_similarity(provided_name, doc_name)
                if sim > best_similarity:
                    best_similarity = sim
                    best_match = doc_name
                    
            if best_similarity >= 0.80:
                matches.append({
                    "provided_name": provided_name,
                    "document_name": best_match,
                    "match_confidence": round(best_similarity, 2)
                })
                # Update verification_status in database
                owner_repo.update(owner["id"], {
                    "verification_status": "verified",
                    "verified_at": last_checked,
                    "encumbrances": {
                        "match_confidence": round(best_similarity, 2)
                    }
                })
            else:
                mismatches_found.append(f"Owner '{provided_name}' not found in document OCR text.")
                owner_repo.update(owner["id"], {
                    "verification_status": "mismatch",
                    "verified_at": last_checked
                })
                
        # Check sum of shares
        total_share = sum(float(owner.get("share_percentage", 0.0)) for owner in owners)
        if abs(total_share - 100.0) > 0.01:
            mismatches_found.append(f"Sum of ownership share percentages ({total_share}%) does not equal 100%.")
            
        status = "mismatch" if mismatches_found else "verified"
        
        # Also update status of documents
        for doc in docs:
            doc_repo.update(doc["id"], {"status": "processed"})
            
        return {
            "property_id": property_id,
            "verification_status": status,
            "mismatches_found": mismatches_found,
            "matches": matches,
            "last_checked": last_checked
        }
        
    def _levenshtein_similarity(self, s1: str, s2: str) -> float:
        s1, s2 = s1.lower().strip(), s2.lower().strip()
        if not s1 or not s2:
            return 0.0
        if s1 == s2:
            return 1.0
            
        rows = len(s1) + 1
        cols = len(s2) + 1
        dist = [[0 for _ in range(cols)] for _ in range(rows)]
        
        for i in range(1, rows):
            dist[i][0] = i
        for j in range(1, cols):
            dist[0][j] = j
            
        for col in range(1, cols):
            for row in range(1, rows):
                if s1[row-1] == s2[col-1]:
                    cost = 0
                else:
                    cost = 1
                dist[row][col] = min(
                    dist[row-1][col] + 1,
                    dist[row][col-1] + 1,
                    dist[row-1][col-1] + cost
                )
                
        distance = dist[rows-1][cols-1]
        return 1.0 - (distance / max(len(s1), len(s2)))

ownership_service = OwnershipService()
