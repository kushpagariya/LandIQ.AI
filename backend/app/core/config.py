# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings
# pyrefly: ignore [missing-import]
from pydantic import Field
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "LandIQ AI Backend"
    API_V1_STR: str = "/api/v1"
    
    ENV: str = Field("development", env="ENV")
    DEBUG: bool = Field(True, env="DEBUG")
    
    # Database
    DATABASE_URL: str = Field(
        "mongodb://localhost:27017/LandIQ.AI", 
        env="DATABASE_URL"
    )
    
    # Security (Bypassed / Constant in MVP)
    SECRET_KEY: str = Field("local_testing_secret_key_hackathon_2026", env="SECRET_KEY")
    
    # File Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
    ALLOWED_MIME_TYPES: List[str] = ["application/pdf", "image/png", "image/jpeg"]
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024 # 10MB
    
    # ML Models
    VALUATION_MODEL_PATH: str = Field("ml/valuation/models/land_price_model.pkl", env="VALUATION_MODEL_PATH")
    VALUATION_ENCODERS_DIR: str = Field("ml/valuation/encoders", env="VALUATION_ENCODERS_DIR")
    FRAUD_RULES_PATH: str = Field("ml/fraud/rules.json", env="FRAUD_RULES_PATH")
    
    OCR_LANGUAGES: List[str] = ["en", "mr"] # English, Marathi

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
