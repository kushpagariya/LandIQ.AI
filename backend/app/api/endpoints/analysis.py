from fastapi import APIRouter, Depends, HTTPException, status, Request
from pymongo.database import Database
from datetime import datetime
from uuid import uuid4
from app.database.session import get_db
from app.database.repository import MongoRepository
from app.schemas.property import PropertyCreate, AnalyzeResponse
from app.services.property_service import property_service
from app.services.ml_service import ml_valuation_service
from app.services.fraud_service import fraud_service
from app.services.trust_service import trust_service

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse, status_code=status.HTTP_200_OK)
def analyze_property(property_in: PropertyCreate, request: Request, db: Database = Depends(get_db)):
    try:
        # 1. Create the property record in database
        prop_create_res = property_service.create_property(db, property_in)
        property_id = prop_create_res["id"]
        
        # Retrieve the newly created property dict
        prop = property_service.get_property(db, property_id)
        if not prop:
            raise Exception("Failed to retrieve created property from database.")
            
        # 2. Run Valuation prediction
        val_res = ml_valuation_service.predict(prop)
        
        # Log valuation prediction to DB
        pred_repo = MongoRepository(db, "predictions")
        val_pred_id = str(uuid4())
        pred_repo.create({
            "id": val_pred_id,
            "property_id": property_id,
            "prediction_type": "valuation",
            "estimated_value": val_res["estimated_market_value_inr"],
            "confidence_score": val_res["confidence_score"],
            "details": {
                "valuation_classification": val_res["valuation_classification"],
                "price_per_acre_inr": val_res["price_per_acre_inr"]
            },
            "model_version": val_res["model_version"],
            "created_at": datetime.utcnow()
        })
        
        # 3. Run Fraud rules check
        fraud_res = fraud_service.check_fraud(prop, db)
        
        # Log fraud risk prediction to DB
        fraud_pred_id = str(uuid4())
        pred_repo.create({
            "id": fraud_pred_id,
            "property_id": property_id,
            "prediction_type": "fraud_risk",
            "estimated_value": None,
            "confidence_score": float(100 - fraud_res["risk_score"]) / 100.0,
            "details": {
                "overall_fraud_risk": fraud_res["overall_fraud_risk"],
                "risk_score": fraud_res["risk_score"],
                "triggered_rules": fraud_res["triggered_rules"],
                "indicators": fraud_res["indicators"]
            },
            "model_version": "fraud_rules_v1.0.0",
            "created_at": datetime.utcnow()
        })
        
        # 4. Calculate trust score
        trust_res = trust_service.calculate_trust_score(prop, db)
        
        # 5. Build risk flags
        risk_flags = []
        for ind in fraud_res["indicators"]:
            if ind["status"] in ["warning", "high_risk"]:
                risk_flags.append(f"{ind['name']}: {ind['description']}")
        if prop.get("takeover_risk") == 1:
            risk_flags.append("Takeover Risk: High takeover risk flagged on this property.")
            
        # 6. Generate Summary
        est_val_lakhs = val_res["estimated_market_value_inr"] / 100000.0
        val_class = val_res["valuation_classification"]
        trust_rating = trust_res["rating_classification"].replace("_", " ")
        trust_score = trust_res["trust_score"]
        
        reasons_list = []
        if "FR-04" in fraud_res["triggered_rules"]:
            reasons_list.append("missing mandatory documents")
        if "FR-03" in fraud_res["triggered_rules"]:
            reasons_list.append("multiple joint owners")
        if prop.get("takeover_risk") == 1:
            reasons_list.append("high takeover risk")
            
        reasons_str = " but exhibits minor risks due to " + ", ".join(reasons_list) if reasons_list else " and exhibits no major risks."
        
        summary = f"The property in {prop['village']}, Nashik, is valued at approximately ₹{est_val_lakhs:.2f} Lakhs. It has a {trust_rating} trust rating ({trust_score}/100){reasons_str}."
        
        # 7. Log Audit Trail
        audit_repo = MongoRepository(db, "audit_logs")
        audit_repo.create({
            "id": str(uuid4()),
            "user_id": "00000000-0000-0000-0000-000000000000",
            "action": "RUN_ANALYSIS",
            "target_table": "properties",
            "target_id": property_id,
            "timestamp": datetime.utcnow(),
            "ip_address": request.client.host if request.client else "127.0.0.1",
            "changes": {
                "predicted_value_inr": val_res["estimated_market_value_inr"],
                "trust_score": trust_score,
                "overall_fraud_risk": fraud_res["overall_fraud_risk"]
            }
        })
        
        return {
            "property_id": property_id,
            "predicted_value_inr": val_res["estimated_market_value_inr"],
            "price_classification": val_res["valuation_classification"],
            "confidence_score": val_res["confidence_score"],
            "risk_flags": risk_flags,
            "trust_score": trust_score,
            "summary": summary
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis calculation failed: {str(e)}"
        )
