import logging
from pymongo import ASCENDING
from app.database.session import client
from app.core.config import settings

logger = logging.getLogger("landiq_backend")

def init_mongodb():
    db_name = settings.DATABASE_URL.split("/")[-1]
    if "?" in db_name:
        db_name = db_name.split("?")[0]
    db_name = db_name.replace(".", "_")
    if not db_name:
        db_name = "LandIQ_AI"
        
    db = client[db_name]
    logger.info(f"Initializing MongoDB database '{db_name}' collections and indexes...")

    try:
        # Users Indexes
        db.users.create_index("email", unique=True)

        # Properties Indexes
        db.properties.create_index("survey_number")
        db.properties.create_index("state")
        db.properties.create_index("district")
        db.properties.create_index("village")

        # Documents Indexes
        db.documents.create_index("property_id")

        # Ownership Records Indexes
        db.ownership_records.create_index("property_id")
        db.ownership_records.create_index("owner_name")

        # Predictions Indexes
        db.predictions.create_index("property_id")
        db.predictions.create_index("prediction_type")

        # Reports Indexes
        db.reports.create_index("property_id")

        # Audit Logs Indexes
        db.audit_logs.create_index("user_id")
        db.audit_logs.create_index("timestamp")

        logger.info("MongoDB collections and indexes initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB: {e}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_mongodb()
