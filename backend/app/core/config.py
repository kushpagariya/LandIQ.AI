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
    SECRET_KEY: str = Field("CHANGE_ME_IN_PRODUCTION", env="SECRET_KEY")
    
    # Compliance & Audit Retention settings
    STORE_IP_ADDRESSES: bool = Field(True, env="STORE_IP_ADDRESSES")
    USER_CONSENT_GIVEN: bool = Field(True, env="USER_CONSENT_GIVEN")
    DATA_RETENTION_DAYS: int = Field(90, env="DATA_RETENTION_DAYS")
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.ENV != "development":
            if not self.SECRET_KEY or self.SECRET_KEY == "CHANGE_ME_IN_PRODUCTION":
                raise ValueError("SECRET_KEY must be explicitly set to a secure value in non-development environments")
    
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
