from fastapi import APIRouter
from app.api.endpoints import properties, analysis

api_router = APIRouter()
api_router.include_router(properties.router, prefix="/properties", tags=["properties"])
api_router.include_router(analysis.router, tags=["analysis"])
