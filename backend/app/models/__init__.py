from app.models.user import User
from app.models.property import Property
from app.models.document import Document
from app.models.ownership import OwnershipRecord
from app.models.prediction import Prediction
from app.models.report import Report
from app.models.audit_log import AuditLog

__all__ = [
    "User",
    "Property",
    "Document",
    "OwnershipRecord",
    "Prediction",
    "Report",
    "AuditLog"
]