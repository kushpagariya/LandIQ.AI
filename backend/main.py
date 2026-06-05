import logging
from datetime import datetime, timezone
from fastapi import FastAPI, Depends
from pymongo.database import Database
from app.core.config import settings
from app.core.logging import setup_logging
from app.database.session import get_db

# Setup logging
setup_logging()
logger = logging.getLogger("landiq_backend")

app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG,
    version="1.0.0"
)

# Startup event to load model and resources
@app.on_event("startup")
def startup_event():
    logger.info("Starting up LandIQ AI Backend...")
    app.state.db_connected = False
    try:
        # Check database connection on startup
        db = next(get_db())
        db.command("ping")
        app.state.db_connected = True
        logger.info("MongoDB database connected successfully.")
        
        # Initialize collections and indexes
        from app.database.init_db import init_mongodb
        init_mongodb()
    except Exception as e:
        logger.error(f"Database connection failed during startup: {e}")

    # Valuation model will be loaded by our ML service when first requested or on startup
    from app.services.ml_service import ml_valuation_service
    try:
        ml_valuation_service.load_model()
        app.state.valuation_model_loaded = True
        logger.info("Valuation model loaded successfully.")
    except Exception as e:
        app.state.valuation_model_loaded = False
        logger.error(f"Valuation model loading failed: {e}")

    # OCR pipeline initialization
    from app.services.ocr_service import ocr_service
    try:
        ocr_service.initialize()
        app.state.ocr_ready = True
        logger.info("OCR engine ready.")
    except Exception as e:
        app.state.ocr_ready = False
        logger.error(f"OCR engine initialization failed: {e}")

@app.get("/health")
def health_check(db: Database = Depends(get_db)) -> dict:
    db_status = "disconnected"
    try:
        db.command("ping")
        db_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")

    valuation_loaded = getattr(app.state, "valuation_model_loaded", False)
    ocr_ready = getattr(app.state, "ocr_ready", False)

    status = "healthy" if db_status == "connected" else "unhealthy"

    return {
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "database": db_status,
            "ocr_engine": "ready" if ocr_ready else "not_ready",
            "valuation_model": "loaded" if valuation_loaded else "not_loaded"
        }
    }

@app.get("/")
def root() -> dict:
    return {
        "message": f"{settings.PROJECT_NAME} is running.",
        "env": settings.ENV,
        "debug": settings.DEBUG
    }

# Include API Router
from app.api.router import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)