import logging
from typing import Dict, List, Any, Optional
from pymongo.database import Database
from app.database.repository import MongoRepository

logger = logging.getLogger("landiq_backend")

class FraudService:
    def check_fraud(self, property_data: dict, db: Database) -> dict:
        property_id = property_data.get("id")
        
        doc_repo = MongoRepository(db, "documents")
        owner_repo = MongoRepository(db, "ownership_records")
        
        docs = doc_repo.list({"property_id": property_id}) if property_id else []
        owners = owner_repo.list({"property_id": property_id}) if property_id else []
        
        risk_score = 0
        triggered_rules = []
        indicators = []
        
        # Rule FR-01: Area Mismatch
        has_7_12 = False
        area_mismatch = False
        for doc in docs:
            if doc.get("file_type") == "7_12_extract":
                has_7_12 = True
                ext_meta = doc.get("extraction_metadata") or {}
                doc_area_hectares = ext_meta.get("total_area_hectares")
                if doc_area_hectares:
                    # 1 Hectare = 2.47105 Acres
                    doc_area_acres = doc_area_hectares * 2.47105
                    prop_area = float(property_data.get("area_acre", 0.0))
                    deviation = abs(doc_area_acres - prop_area) / max(prop_area, 0.001)
                    if deviation > 0.05:
                        area_mismatch = True
                        
        if area_mismatch:
            risk_score += 30
            triggered_rules.append("FR-01")
            indicators.append({
                "name": "Area Mismatch",
                "status": "high_risk",
                "description": "Document extracted area differs from user input by > 5%"
            })
        else:
            indicators.append({
                "name": "Area Mismatch",
                "status": "clear",
                "description": "Area in 7/12 matches survey area."
            })
            
        # Rule FR-02: Owner Name Mismatch
        name_mismatch = False
        if docs and owners:
            doc_owner_names = []
            for doc in docs:
                ext_meta = doc.get("extraction_metadata") or {}
                doc_owner_names.extend(ext_meta.get("owners", []))
                
            for owner in owners:
                owner_name = owner.get("owner_name")
                matched = False
                for doc_owner in doc_owner_names:
                    similarity = self._levenshtein_similarity(owner_name, doc_owner)
                    if similarity >= 0.8:
                        matched = True
                        break
                if not matched:
                    name_mismatch = True
                    break
        
        if name_mismatch:
            risk_score += 25
            triggered_rules.append("FR-02")
            indicators.append({
                "name": "Owner Name Mismatch",
                "status": "high_risk",
                "description": "Primary owner names not found in OCR text (similarity < 0.8)"
            })
        else:
            indicators.append({
                "name": "Owner Name Mismatch",
                "status": "clear",
                "description": "Owner names match document OCR."
            })
            
        # Rule FR-03: Multiple Joint Owners
        num_owners = int(property_data.get("number_of_owners", 1))
        if num_owners >= 5:
            risk_score += 15
            triggered_rules.append("FR-03")
            indicators.append({
                "name": "Multiple Joint Owners",
                "status": "warning",
                "description": f"High number of joint owners ({num_owners})"
            })
        else:
            indicators.append({
                "name": "Multiple Joint Owners",
                "status": "clear",
                "description": "Number of joint owners is within normal limits."
            })
            
        # Rule FR-04: Missing Mandatory Docs
        if not has_7_12:
            risk_score += 30
            triggered_rules.append("FR-04")
            indicators.append({
                "name": "Missing Mandatory Docs",
                "status": "high_risk",
                "description": "7/12 Extract or Title Deed not uploaded"
            })
        else:
            indicators.append({
                "name": "Missing Mandatory Docs",
                "status": "clear",
                "description": "Mandatory documents are uploaded."
            })
            
        # Rule FR-05: Share Balance Check
        share_mismatch = False
        if owners:
            total_share = sum(float(owner.get("share_percentage", 0.0)) for owner in owners)
            if abs(total_share - 100.0) > 0.01:
                share_mismatch = True
                
        if share_mismatch:
            risk_score += 20
            triggered_rules.append("FR-05")
            indicators.append({
                "name": "Share Balance Check",
                "status": "warning",
                "description": "Sum of ownership share percentages does not equal 100%"
            })
        else:
            indicators.append({
                "name": "Share Balance Check",
                "status": "clear",
                "description": "Ownership shares equal 100%."
            })
            
        risk_score = min(100, risk_score)
        
        overall_risk = "low"
        if risk_score >= 60:
            overall_risk = "high"
        elif risk_score >= 30:
            overall_risk = "medium"
            
        rule_reasons = {
            "FR-01": "document extracted area mismatch",
            "FR-02": "owner name mismatch",
            "FR-03": "multiple joint owners",
            "FR-04": "missing mandatory documents",
            "FR-05": "share balance mismatch"
        }
        triggered_reasons = [rule_reasons.get(r, r) for r in triggered_rules]
            
        return {
            "property_id": property_id,
            "overall_fraud_risk": overall_risk,
            "risk_score": risk_score,
            "triggered_rules": triggered_rules,
            "triggered_reasons": triggered_reasons,
            "indicators": indicators
        }
        
    def _levenshtein_similarity(self, s1: str, s2: str) -> float:
        if s1 is None:
            s1 = ""
        if s2 is None:
            s2 = ""
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

fraud_service = FraudService()
