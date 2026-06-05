import os
import logging
from uuid import uuid4
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from pymongo.database import Database

from app.core.config import settings
from app.database.repository import MongoRepository
from app.services.ml_service import ml_valuation_service
from app.services.fraud_service import fraud_service
from app.services.trust_service import trust_service

logger = logging.getLogger("landiq_backend")

INR_PER_LAKH = 100000.0

class ReportGenerationError(Exception):
    pass

class ReportService:
    def generate_report(self, property_id: str, db: Database) -> dict:
        prop_repo = MongoRepository(db, "properties")
        report_repo = MongoRepository(db, "reports")
        
        prop = prop_repo.get(property_id)
        if not prop:
            raise ValueError(f"Property with ID {property_id} not found.")
            
        # 1. Aggregate all data
        val_res = ml_valuation_service.predict(prop)
        fraud_res = fraud_service.check_fraud(prop, db)
        trust_res = trust_service.calculate_trust_score(prop, db)
        
        risk_flags = []
        for ind in fraud_res["indicators"]:
            if ind["status"] in ["warning", "high_risk"]:
                risk_flags.append(f"{ind['name']}: {ind['description']}")
        if prop.get("takeover_risk") == 1:
            risk_flags.append("Takeover Risk: High takeover risk flagged on this property.")
            
        est_val_lakhs = val_res["estimated_market_value_inr"] / INR_PER_LAKH
        trust_rating = trust_res["rating_classification"].replace("_", " ")
        trust_score = trust_res["trust_score"]
        
        reasons_list = list(fraud_res.get("triggered_reasons", []))
        if prop.get("takeover_risk") == 1:
            reasons_list.append("high takeover risk")
            
        reasons_str = " but exhibits minor risks due to " + ", ".join(reasons_list) if reasons_list else " and exhibits no major risks."
        summary = f"The property in {prop['village']}, {prop['taluka']}, {prop['district']}, is valued at approximately ₹{est_val_lakhs:.2f} Lakhs. It has a {trust_rating} trust rating ({trust_score}/100){reasons_str}."

        # 2. Render HTML using Jinja2
        templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
        env = Environment(loader=FileSystemLoader(templates_dir))
        template = env.get_template("property_report.html")
        
        html_content = template.render(
            prop=prop,
            val=val_res,
            fraud=fraud_res,
            trust=trust_res,
            risk_flags=risk_flags,
            summary=summary
        )
        
        # 3. Create PDF file path
        report_id = str(uuid4())
        reports_dir = os.path.join(settings.UPLOAD_DIR, "reports")
        os.makedirs(reports_dir, exist_ok=True)
        pdf_path = os.path.join(reports_dir, f"{report_id}.pdf")
        
        # 4. Compile HTML to PDF using WeasyPrint
        logger.info(f"Compiling PDF report to {pdf_path}...")
        try:
            HTML(string=html_content).write_pdf(pdf_path)
            logger.info("PDF report compiled successfully.")
        except Exception as e:
            logger.error(
                f"WeasyPrint failed: HTML(string=html_content).write_pdf({pdf_path}) "
                f"raised exception: {str(e)}. Context: html_content hash={hash(html_content)}"
            )
            if os.path.exists(pdf_path):
                try:
                    os.remove(pdf_path)
                except Exception:
                    pass
            # Create Database record with failed status
            report_data = {
                "id": report_id,
                "property_id": property_id,
                "file_path": pdf_path,
                "status": "failed",
                "trust_score": trust_res["trust_score"],
                "created_at": datetime.utcnow(),
                "expired_at": None
            }
            report_repo.create(report_data)
            raise ReportGenerationError(f"WeasyPrint PDF compilation failed: {str(e)}")
        
        # 5. Create Database record
        report_data = {
            "id": report_id,
            "property_id": property_id,
            "file_path": pdf_path,
            "status": "ready",
            "trust_score": trust_res["trust_score"],
            "created_at": datetime.utcnow(),
            "expired_at": None
        }
        report_repo.create(report_data)
        
        download_url = f"/api/v1/properties/{property_id}/report/download"
        
        return {
            "report_id": report_id,
            "property_id": property_id,
            "status": "ready",
            "download_url": download_url,
            "generated_at": datetime.utcnow()
        }

report_service = ReportService()
