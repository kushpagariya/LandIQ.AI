import time
import os
import pytest
from fastapi.testclient import TestClient
from main import app
from app.core.config import settings

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "healthy"
    assert "database" in json_data["services"]
    assert json_data["services"]["database"] == "connected"

def test_property_lifecycle_and_analysis(client) -> None:
    # 1. Create property
    payload = {
        "survey_number": "45/A/1",
        "state": "Maharashtra",
        "district": "Nashik",
        "taluka": "Sinnar",
        "village": "Chinchpada",
        "area_acre": 5.17,
        "soil_type": "Black_Red_Mixed",
        "soil_quality_score": 8,
        "land_type": "Agricultural",
        "irrigated": 1,
        "road_touch": 1,
        "road_width_ft": 10,
        "distance_to_highway_km": 22.8,
        "water_source": "Borewell",
        "number_of_owners": 7,
        "unknown_registrations": 2,
        "takeover_risk": 0,
        "avg_price_per_acre_nearby": 229000.00,
        "asking_price": 227000.00,
        "latitude": 19.8439,
        "longitude": 73.8194
    }
    
    resp_create = client.post("/api/v1/properties/", json=payload)
    assert resp_create.status_code == 201
    create_json = resp_create.json()
    assert "id" in create_json
    assert create_json["survey_number"] == "45/A/1"
    
    property_id = create_json["id"]
    
    # 2. Get property details
    resp_get = client.get(f"/api/v1/properties/{property_id}")
    assert resp_get.status_code == 200
    assert resp_get.json()["village"] == "Chinchpada"
    
    # 3. List properties
    resp_list = client.get("/api/v1/properties/")
    assert resp_list.status_code == 200
    props = resp_list.json()
    assert len(props) > 0
    assert any(p["id"] == property_id for p in props)
    
    # 4. Run Valuation Model
    resp_val = client.post(f"/api/v1/properties/{property_id}/valuation")
    assert resp_val.status_code == 200
    val_json = resp_val.json()
    assert val_json["estimated_market_value_inr"] > 0
    assert val_json["valuation_classification"] in ["undervalued", "overvalued", "fair"]
    
    # 5. Run Fraud Check
    resp_fraud = client.post(f"/api/v1/properties/{property_id}/fraud-check")
    assert resp_fraud.status_code == 200
    fraud_json = resp_fraud.json()
    assert "overall_fraud_risk" in fraud_json
    assert fraud_json["risk_score"] >= 0
    
    # 6. Retrieve Trust Score
    resp_trust = client.get(f"/api/v1/properties/{property_id}/trust-score")
    assert resp_trust.status_code == 200
    trust_json = resp_trust.json()
    assert trust_json["trust_score"] >= 0
    assert "rating_classification" in trust_json
    
    # 7. Document Upload and OCR verification
    mock_pdf_path = "test_ocr_suite.pdf"
    with open(mock_pdf_path, "wb") as f:
        f.write(b"%PDF-1.4\nSurvey Number: 45/A/1\nTotal Area: 1.83 Hectares\nOwners: Ramesh Tukaram Kalbhor, Suresh Tukaram Kalbhor\nLiabilities: None\n")
        
    try:
        with open(mock_pdf_path, "rb") as f:
            resp_upload = client.post(
                f"/api/v1/properties/{property_id}/documents",
                files={"file": ("7_12_extract.pdf", f, "application/pdf")},
                data={"file_type": "7_12_extract"}
            )
        assert resp_upload.status_code == 202
        upload_json = resp_upload.json()
        doc_id = upload_json["document_id"]
        
        # Wait for background task to complete
        time.sleep(1.0)
        
        resp_ocr = client.get(f"/api/v1/properties/{property_id}/documents/{doc_id}/ocr")
        assert resp_ocr.status_code == 200
        ocr_json = resp_ocr.json()
        assert ocr_json["status"] == "processed"
        assert ocr_json["extracted_fields"]["survey_number"] == "45/A/1"
        
        # Seed user context for verification
        from pymongo import MongoClient
        mc = MongoClient(settings.DATABASE_URL)
        db = mc.get_default_database()
        db.ownership_records.insert_many([
            {
                "id": "t1",
                "property_id": property_id,
                "document_id": None,
                "owner_name": "Ramesh Tukaram Kalbhor",
                "share_percentage": 50.0,
                "holding_type": "joint",
                "verification_status": "pending"
            },
            {
                "id": "t2",
                "property_id": property_id,
                "document_id": None,
                "owner_name": "Suresh Tukaram Kalbhor",
                "share_percentage": 50.0,
                "holding_type": "joint",
                "verification_status": "pending"
            }
        ])
        
        resp_verify = client.post(f"/api/v1/properties/{property_id}/verify-consistency")
        assert resp_verify.status_code == 200
        assert resp_verify.json()["verification_status"] in ["verified", "mismatch"]
        
    finally:
        if os.path.exists(mock_pdf_path):
            os.remove(mock_pdf_path)
            
    # 8. Generate Report
    resp_report = client.post(f"/api/v1/properties/{property_id}/report")
    assert resp_report.status_code == 200
    report_json = resp_report.json()
    assert report_json["status"] == "ready"
    assert "download_url" in report_json
    
    # 9. Download Report
    resp_download = client.get(f"/api/v1/properties/{property_id}/report/download")
    assert resp_download.status_code == 200
    assert resp_download.headers.get("content-type") == "application/pdf"
    assert len(resp_download.content) > 0

def test_unified_analyze_endpoint(client) -> None:
    payload = {
        "survey_number": "45/A/1",
        "state": "Maharashtra",
        "district": "Nashik",
        "taluka": "Sinnar",
        "village": "Chinchpada",
        "area_acre": 5.17,
        "soil_type": "Black_Red_Mixed",
        "soil_quality_score": 8,
        "land_type": "Agricultural",
        "irrigated": 1,
        "road_touch": 1,
        "road_width_ft": 10,
        "distance_to_highway_km": 22.8,
        "water_source": "Borewell",
        "number_of_owners": 7,
        "unknown_registrations": 2,
        "takeover_risk": 0,
        "avg_price_per_acre_nearby": 229000.00,
        "asking_price": 227000.00,
        "latitude": 19.8439,
        "longitude": 73.8194
    }
    
    resp_analyze = client.post("/api/v1/analyze", json=payload)
    assert resp_analyze.status_code == 200
    analyze_json = resp_analyze.json()
    assert "property_id" in analyze_json
    assert analyze_json["predicted_value_inr"] > 0
    assert analyze_json["price_classification"] in ["undervalued", "overvalued", "fair"]
    assert len(analyze_json["risk_flags"]) > 0
    assert analyze_json["trust_score"] >= 0
    assert "summary" in analyze_json