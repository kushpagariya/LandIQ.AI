from pymongo import MongoClient
from typing import Generator
from app.core.config import settings

client = MongoClient(settings.DATABASE_URL)

def get_db() -> Generator:
    # Extract db name from connection string, default to "LandIQ_AI"
    db_name = settings.DATABASE_URL.split("/")[-1]
    if "?" in db_name:
        db_name = db_name.split("?")[0]
    
    # Replace dot with underscore for MongoDB compatibility
    db_name = db_name.replace(".", "_")
    
    if not db_name:
        db_name = "LandIQ_AI"
    
    db = client[db_name]
    try:
        yield db
    finally:
        pass
