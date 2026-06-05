import pytest
from app.database.session import client
from app.core.config import settings
from app.database.init_db import init_mongodb

@pytest.fixture(scope="session", autouse=True)
def test_db():
    # Store original URL
    original_url = settings.DATABASE_URL
    # Switch settings URL to use the test database
    settings.DATABASE_URL = "mongodb://localhost:27017/LandIQ_AI_test"
    
    # Drop test database if left over
    client.drop_database("LandIQ_AI_test")
    
    # Initialize indexes in the test database
    init_mongodb()
    
    yield client["LandIQ_AI_test"]
    
    # Drop test database after tests run
    client.drop_database("LandIQ_AI_test")
    # Restore original URL
    settings.DATABASE_URL = original_url
