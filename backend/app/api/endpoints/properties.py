from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from pymongo.database import Database
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from uuid import uuid4
import os

from app.database.session import get_db, client
from app.database.repository import MongoRepository
from app.core.config import settings
from app.schemas.property import PropertyCreate, PropertyResponse, PropertyCreateResponse
from app.schemas.valuation import ValuationResponse
from app.schemas.fraud import FraudAnalysisResponse
from app.schemas.trust import TrustScoreResponse
from app.schemas.document import DocumentStatusResponse, OCRExtractionResponse
from app.schemas.report import ReportGenerationResponse
from app.services.property_service import property_service
from app.services.ml_service import ml_valuation_service
from app.services.fraud_service import fraud_service
from app.services.trust_service import trust_service
from app.services.document_service import document_service, process_document_task
from app.services.ownership_service import ownership_service
from app.services.report_service import report_service

router = APIRouter()

@router.post("/", response_model=PropertyCreateResponse, status_code=status.HTTP_201_CREATED)
def create_property(property_in: PropertyCreate, db: Database = Depends(get_db)):
    try:
        return property_service.create_property(db, property_in)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create property: {str(e)}"
        )

@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: UUID, db: Database = Depends(get_db)):
    prop = property_service.get_property(db, str(property_id))
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found."
        )
    return prop

@router.get("/", response_model=List[PropertyResponse])
def list_properties(db: Database = Depends(get_db)):
    try:
        return property_service.list_properties(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve properties: {str(e)}"
        )

@router.post("/{property_id}/valuation", response_model=ValuationResponse)
def calculate_valuation(property_id: UUID, db: Database = Depends(get_db)):
    prop = property_service.get_property(db, str(property_id))
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found."
        )
    
    try:
        result = ml_valuation_service.predict(prop)
        
        pred_repo = MongoRepository(db, "predictions")
        pred_id = str(uuid4())
        pred_data = {
            "id": pred_id,
            "property_id": str(property_id),
            "prediction_type": "valuation",
            "estimated_value": result["estimated_market_value_inr"],
            "confidence_score": result["confidence_score"],
            "details": {
                "valuation_classification": result["valuation_classification"],
                "price_per_acre_inr": result["price_per_acre_inr"]
            },
            "model_version": result["model_version"],
            "created_at": datetime.utcnow()
        }
        pred_repo.create(pred_data)
        
        return {
            "property_id": property_id,
            "estimated_market_value_inr": result["estimated_market_value_inr"],
            "price_per_acre_inr": result["price_per_acre_inr"],
            "valuation_classification": result["valuation_classification"],
            "confidence_score": result["confidence_score"],
            "model_version": result["model_version"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Valuation calculation failed: {str(e)}"
        )

@router.post("/{property_id}/fraud-check", response_model=FraudAnalysisResponse)
def run_fraud_check(property_id: UUID, db: Database = Depends(get_db)):
    prop = property_service.get_property(db, str(property_id))
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found."
        )
    
    try:
        result = fraud_service.check_fraud(prop, db)
        
        pred_repo = MongoRepository(db, "predictions")
        pred_id = str(uuid4())
        pred_data = {
            "id": pred_id,
            "property_id": str(property_id),
            "prediction_type": "fraud_risk",
            "estimated_value": None,
            "confidence_score": float(100 - result["risk_score"]) / 100.0,
            "details": {
                "overall_fraud_risk": result["overall_fraud_risk"],
                "risk_score": result["risk_score"],
                "triggered_rules": result["triggered_rules"],
                "indicators": result["indicators"]
            },
            "model_version": "fraud_rules_v1.0.0",
            "created_at": datetime.utcnow()
        }
        pred_repo.create(pred_data)
        
        return {
            "property_id": property_id,
            "overall_fraud_risk": result["overall_fraud_risk"],
            "risk_score": result["risk_score"],
            "triggered_rules": result["triggered_rules"],
            "indicators": result["indicators"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Fraud check calculation failed: {str(e)}"
        )

@router.get("/{property_id}/trust-score", response_model=TrustScoreResponse)
def get_trust_score(property_id: UUID, db: Database = Depends(get_db)):
    prop = property_service.get_property(db, str(property_id))
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found."
        )
    
    try:
        result = trust_service.calculate_trust_score(prop, db)
        return {
            "property_id": property_id,
            "trust_score": result["trust_score"],
            "rating_classification": result["rating_classification"],
            "breakdown": result["breakdown"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Trust score calculation failed: {str(e)}"
        )

@router.post("/{property_id}/documents", response_model=DocumentStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    property_id: UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    file_type: str = Form(...),
    db: Database = Depends(get_db)
):
    prop = property_service.get_property(db, str(property_id))
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found."
        )
        
    max_size = settings.MAX_FILE_SIZE_BYTES
    contents = await file.read(max_size + 1)
    if len(contents) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 10MB limit."
        )
    await file.seek(0)
    
    is_valid = False
    if contents.startswith(b"%PDF"):
        is_valid = True
    elif contents.startswith(b"\x89PNG\r\n\x1a\n"):
        is_valid = True
    elif contents.startswith(b"\xff\xd8\xff"):
        is_valid = True
        
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file signature. Only PDF, PNG, and JPEG files are allowed."
        )
        
    doc_dir = os.path.join(settings.UPLOAD_DIR, "documents")
    os.makedirs(doc_dir, exist_ok=True)
    
    file_uuid = str(uuid4())
    ext = os.path.splitext(file.filename)[1]
    saved_file_name = f"{file_uuid}{ext}"
    saved_file_path = os.path.join(doc_dir, saved_file_name)
    
    with open(saved_file_path, "wb") as f:
        f.write(contents[:len(contents)-1] if len(contents) > max_size else contents)
        
    doc_res = document_service.create_document(
        db=db,
        property_id=str(property_id),
        file_name=file.filename,
        file_type=file_type,
        file_path=saved_file_path
    )
    
    background_tasks.add_task(
        process_document_task,
        document_id=doc_res["document_id"],
        file_path=saved_file_path,
        file_type=file_type,
        db_name=db.name
    )
    
    return doc_res

@router.get("/{property_id}/documents/{document_id}/ocr", response_model=OCRExtractionResponse)
def get_ocr_status(property_id: UUID, document_id: UUID, db: Database = Depends(get_db)):
    doc_repo = MongoRepository(db, "documents")
    doc = doc_repo.get(str(document_id))
    if not doc or doc.get("property_id") != str(property_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found for property {property_id}."
        )
        
    ext_meta = doc.get("extraction_metadata") or {}
    
    return {
        "document_id": document_id,
        "status": doc.get("status"),
        "ocr_confidence": 0.95 if doc.get("status") == "processed" else 0.0,
        "file_type": doc.get("file_type"),
        "extracted_fields": ext_meta
    }

@router.post("/{property_id}/verify-consistency")
def verify_ownership_consistency(property_id: UUID, db: Database = Depends(get_db)):
    prop = property_service.get_property(db, str(property_id))
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found."
        )
        
    try:
        return ownership_service.verify_ownership(str(property_id), db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ownership verification failed: {str(e)}"
        )

@router.post("/{property_id}/report", response_model=ReportGenerationResponse)
def generate_report(property_id: UUID, db: Database = Depends(get_db)):
    prop = property_service.get_property(db, str(property_id))
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found."
        )
        
    try:
        return report_service.generate_report(str(property_id), db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )

@router.get("/{property_id}/report/download", response_class=FileResponse)
def download_report_pdf(property_id: UUID, db: Database = Depends(get_db)):
    report_repo = MongoRepository(db, "reports")
    reports = report_repo.list({"property_id": str(property_id)})
    if not reports:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No report found for property {property_id}. Generate it first using POST."
        )
    
    # Sort in python (created_at is datetime)
    reports.sort(key=lambda x: x.get("created_at"), reverse=True)
    latest_report = reports[0]
    
    file_path = latest_report.get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Compiled PDF report file not found on disk."
        )
        
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=f"LandIQ_Report_{property_id}.pdf"
    )
