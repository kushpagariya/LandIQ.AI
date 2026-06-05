# LandIQ AI - Backend Implementation Plan

This document outlines the backend architecture, database schema, API design, service layer organization, Machine Learning pipelines, and development roadmap for the LandIQ AI platform, optimized for a hackathon MVP.

---

## 1. MVP Implementation Status Flags

To maintain absolute transparency and distinguish between what is realistically built for the hackathon and what remains conceptual, the following flags are used throughout this document:

* **`[REAL]`**: Features fully backed by working code, models, or datasets (e.g., FastAPI, PostgreSQL, RandomForestRegressor, Nashik dataset).
* **`[SIMULATED]`**: Features simulated for the MVP using deterministic rules, heuristics, or mock data (e.g., ownership consistency checking, rule-based fraud detection, GIS coordinates metadata, mock user context).
* **`[FUTURE]`**: Production roadmap features that are not implemented for the hackathon (e.g., JWT Auth, Neo4j graphs, Isolation Forest anomaly models, satellite segmentation).

---

## 2. System Architecture

LandIQ AI utilizes a layered, monolithic architecture optimized for the FastAPI framework, structured to facilitate clean separation of concerns, high performance, and rapid hackathon execution.

### Backend Folder Structure

The backend codebase strictly follows this directory layout:
```text
backend/
├── main.py
├── requirements.txt
├── app/
│   ├── api/          # [REAL] API routes and routers
│   ├── services/     # [REAL] Business logic and orchestration
│   ├── schemas/      # [REAL] Pydantic validation schemas
│   ├── models/       # [REAL] SQLAlchemy database models
│   ├── database/     # [REAL] PostgreSQL session management
│   ├── core/         # [REAL] Config settings
│   └── utils/        # [REAL] Helper modules (PDF rendering)
├── ml/
│   ├── valuation/    # [REAL] Random Forest Valuation Engine
│   ├── fraud/        # [SIMULATED] Rule-Based Fraud Rules
│   ├── ocr/          # [REAL / PARTIAL] Local EasyOCR/Tesseract Pipeline
│   └── datasets/     # [REAL] Lands_of_Nashik.csv and splits
└── tests/            # [REAL] Pytest test suite
```

### Request Lifecycle and Data Flow

The flow below represents the request lifecycle. Note that authentication is bypassed or mocked for the MVP:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Application
    participant Router as API Router (FastAPI)
    participant Service as Service Layer
    participant ML as ML Engine (Inference)
    participant DB as Database (PostgreSQL/SQLAlchemy)
    participant Storage as Local File Storage
    
    User->>Router: POST /api/v1/analyze (Property details)
    Router->>Service: ValuationService.calculate_value()
    Service->>ML: FeatureBuilder -> Valuation Model
    ML-->>Service: Estimated Value & Confidence Score
    Service->>Service: FraudService.run_rules() (Rule-based)
    Service->>Service: TrustScoreEngine.calculate()
    Service->>DB: Save Property & Predictions
    DB-->>Service: Saved Data
    Service-->>Router: Return Combined Predictions & Trust Scores
    Router-->>User: 200 OK (Dashboard JSON payload)
    
    Note over Router, Storage: Simplified Document & Report Flow
    User->>Router: POST /api/v1/properties/{id}/documents (with file)
    Router->>Service: UploadService.save_document()
    Service->>Storage: Save file locally
    Service->>DB: Create Document record
    Router->>Service: Trigger OCR Consistency check
    Service->>ML: Run Local OCR Engine
    ML-->>Service: Extracted Text
    Service->>Service: Compare Extracted Names with User Details
    Service->>DB: Save Ownership Verification status
    Router-->>User: 202 Accepted (Verification Status)
```

### Component Interaction Diagram

```mermaid
graph TD
    subgraph Client Layer
        Web[React / Vite Frontend]
    end

    subgraph API Layer (app/api/)
        Router[FastAPI APIRouter]
        BypassAuth[Mock Auth Context [SIMULATED]]
    end

    subgraph Service Layer (app/services/)
        DocSvc[Document Service [REAL]]
        ValSvc[Valuation Service [REAL]]
        FraudSvc[Rule-Based Fraud Service [SIMULATED]]
        TrustSvc[Trust Score Engine [REAL]]
        RepSvc[Report Service [REAL]]
    end

    subgraph ML Pipeline Layer (ml/)
        OCR[OCR Engine EasyOCR/Tesseract [REAL]]
        ValModel[Random Forest Valuation Model [REAL]]
        FraudModel[Rule-Based Fraud Engine [SIMULATED]]
    end

    subgraph Data Layer
        DB[(PostgreSQL Database [REAL])]
        Storage[(Local File Storage [REAL])]
    end

    Web -->|HTTP Requests| Router
    Router --> BypassAuth
    BypassAuth --> Router
    Router --> DocSvc
    Router --> ValSvc
    Router --> FraudSvc
    Router --> TrustSvc
    Router --> RepSvc

    DocSvc --> OCR
    ValSvc --> ValModel
    FraudSvc --> FraudModel

    DocSvc --> DB
    ValSvc --> DB
    FraudSvc --> DB
    TrustSvc --> DB
    RepSvc --> DB

    DocSvc --> Storage
    RepSvc --> Storage
```

---

## 3. Backend Development & MVP Roadmap

To ensure demo readiness and hackathon success, backend features are prioritized to deliver a working end-to-end flow.

### MVP Phase Prioritization

| Priority | Feature Area | Status | Focus & Deliverables | Rationale for Hackathon Success |
| :--- | :--- | :--- | :--- | :--- |
| **Priority 1** | **Core Infrastructure** | `[REAL]` | FastAPI Setup, PostgreSQL DB, and property migrations. | Baseline setup for relational database and API structure. |
| **Priority 2** | **Unified Analyze Endpoint** | `[REAL]` | `POST /api/v1/analyze` integration endpoint. | Powers the main dashboard in a single call for React frontend. |
| **Priority 3** | **ML Valuation Engine** | `[REAL]` | RandomForestRegressor inference, persistence, Nashik Village encoders. | Core intelligence of the platform. Serves pricing estimations. |
| **Priority 4** | **Trust Score Engine** | `[REAL]` | Score aggregation service using weighted formula. | Combines valuation confidence, data completeness, and fraud checks. |
| **Priority 5** | **Simplified PDF Report** | `[REAL]` | PDF generation via HTML template (WeasyPrint) synchronously. | High-quality downloadable artifact to showcase to judges. |
| **Priority 6** | **OCR Ingestion Pipeline** | `[REAL / PARTIAL]` | Local EasyOCR/Tesseract text extraction from docs. | Processes land records to extract basic property descriptors. |
| **Priority 7** | **Ownership Consistency Check**| `[SIMULATED]` | Levenshtein distance string matching against OCR text. | Bypasses government registry APIs. Compares doc text with inputs. |
| **Priority 8** | **Fraud Check Rules** | `[SIMULATED]` | Deterministic business rules (area mismatch, owner count). | Captures risks using simple conditional logic instead of ML models. |
| **Priority 9** | **GIS Intelligence** | `[SIMULATED]` | Coordinates metadata, nearby references, highway distance. | Enriches dashboard using coordinate math and static references. |
| **Priority 10**| **Security & Auth** | `[FUTURE]` | JWT Authentication, RBAC, Multi-user management. | Bypassed in MVP to speed up integration and avoid demo blocks. |
| **Priority 11**| **Advanced ML & GIS** | `[FUTURE]` | Isolation Forest, Neo4j, satellite segmentations. | Future roadmap items; excluded from hackathon build. |

---

## 4. Database Design

We use PostgreSQL for all relational storage. Below is the detailed schema layout.

### Entity-Relationship Details

```mermaid
erDiagram
    USERS ||--o{ PROPERTIES : creates
    PROPERTIES ||--o{ DOCUMENTS : contains
    PROPERTIES ||--o{ OWNERSHIP_RECORDS : holds
    PROPERTIES ||--o{ PREDICTIONS : evaluates
    PROPERTIES ||--o{ REPORTS : generates
    DOCUMENTS ||--o{ OWNERSHIP_RECORDS : checks
```

### Table Definitions

#### 1. Table: `users` `[FUTURE / MOCKED]`
Tracks platform users. During the MVP, authentication is bypassed, and all records are mapped to a default mock user context.
* **Fields**:
  * `id` (`UUID`, PK): Primary identifier. Defaults to `gen_random_uuid()`.
  * `email` (`VARCHAR(255)`, Unique, Indexed): User email.
  * `password_hash` (`VARCHAR(255)`): Hashed credentials (unused in MVP).
  * `full_name` (`VARCHAR(255)`): User's legal name.
  * `role` (`VARCHAR(50)`): System role (`buyer`, `investor`, `admin`).
  * `created_at` (`TIMESTAMP WITH TIME ZONE`): Defaults to `CURRENT_TIMESTAMP`.

#### 2. Table: `properties` `[REAL]`
Stores geographic, administrative, and feature details for the target land.
* **Fields**:
  * `id` (`UUID`, PK): Primary identifier.
  * `user_id` (`UUID`, FK -> `users.id`, Nullable): Creator of this evaluation.
  * `survey_number` (`VARCHAR(100)`, Indexed): Survey / khasra number.
  * `state` (`VARCHAR(100)`, Indexed): State name (constrained to "Maharashtra" in MVP).
  * `district` (`VARCHAR(100)`, Indexed): District name (constrained to "Nashik" in MVP).
  * `taluka` (`VARCHAR(100)`): Sub-district name.
  * `village` (`VARCHAR(100)`, Indexed): Village name.
  * `area_acre` (`NUMERIC(10, 4)`): Total area of the parcel in acres.
  * `soil_type` (`VARCHAR(100)`): Soil category (e.g., "Black", "Red", "Black_Red_Mixed").
  * `soil_quality_score` (`INTEGER`): Score from 1-10.
  * `land_type` (`VARCHAR(100)`): Type of land (e.g., "Agricultural", "Residential", "Commercial").
  * `irrigated` (`INTEGER`): 1 if irrigated, 0 otherwise.
  * `road_touch` (`INTEGER`): 1 if road touch, 0 otherwise.
  * `road_width_ft` (`INTEGER`): Road width in feet.
  * `distance_to_highway_km` (`NUMERIC(10, 2)`): Distance to highway in KM.
  * `water_source` (`VARCHAR(100)`): Water source (e.g., "Borewell", "River", "Well", "Canal", "None").
  * `number_of_owners` (`INTEGER`): Number of legal owners.
  * `unknown_registrations` (`INTEGER`): Number of unknown registrations.
  * `takeover_risk` (`INTEGER`): Takeover risk score (0 or 1).
  * `avg_price_per_acre_nearby` (`NUMERIC(15, 2)`): Average price per acre nearby.
  * `asking_price` (`NUMERIC(15, 2)`, Nullable): Asking price in INR.
  * `latitude` (`NUMERIC(9, 6)`, Nullable): Latitude.
  * `longitude` (`NUMERIC(9, 6)`, Nullable): Longitude.
  * `created_at` (`TIMESTAMP WITH TIME ZONE`): Defaults to `CURRENT_TIMESTAMP`.

#### 3. Table: `documents` `[REAL]`
Stores documents uploaded for OCR scanning and consistency checking.
* **Fields**:
  * `id` (`UUID`, PK): Primary identifier.
  * `property_id` (`UUID`, FK -> `properties.id`): Associated property.
  * `file_name` (`VARCHAR(255)`): File name in local storage.
  * `file_type` (`VARCHAR(50)`): Document classification (`7_12_extract`, `sale_deed`, `title_certificate`).
  * `file_path` (`VARCHAR(512)`): Local disk path.
  * `status` (`VARCHAR(50)`): Lifecycle (`uploaded`, `processing`, `processed`, `failed`).
  * `ocr_text` (`TEXT`, Nullable): Raw text output from EasyOCR/Tesseract.
  * `extraction_metadata` (`JSONB`, Nullable): Extracted fields (names, area).
  * `uploaded_at` (`TIMESTAMP WITH TIME ZONE`): Defaults to `CURRENT_TIMESTAMP`.

#### 4. Table: `ownership_records` `[SIMULATED / REAL]`
Holds owner name listings extracted from land documents for local consistency checking. Bypasses government registry links.
* **Fields**:
  * `id` (`UUID`, PK): Primary identifier.
  * `property_id` (`UUID`, FK -> `properties.id`): Associated property.
  * `document_id` (`UUID`, FK -> `documents.id`, Nullable): Source document.
  * `owner_name` (`VARCHAR(255)`, Indexed): Name of the landowner.
  * `share_percentage` (`NUMERIC(5, 2)`): Split ownership value (0 - 100.00).
  * `holding_type` (`VARCHAR(50)`): Ownership category (`sole`, `joint`, `power_of_attorney`).
  * `acquisition_date` (`DATE`, Nullable): Date ownership was acquired.
  * `encumbrances` (`JSONB`, Nullable): Liabilities or mortgages associated with the owner (mocked).
  * `verification_status` (`VARCHAR(50)`): Consistency check status (`pending`, `verified`, `mismatch`).
  * `verified_at` (`TIMESTAMP WITH TIME ZONE`, Nullable): Timestamp of consistency check.

#### 5. Table: `predictions` `[REAL]`
Captures machine learning valuation outputs and risk inference calculations.
* **Fields**:
  * `id` (`UUID`, PK): Primary identifier.
  * `property_id` (`UUID`, FK -> `properties.id`): Target property.
  * `prediction_type` (`VARCHAR(50)`, Indexed): Prediction type (`valuation`, `fraud_risk`).
  * `estimated_value` (`NUMERIC(15, 2)`, Nullable): Midpoint price prediction in INR.
  * `confidence_score` (`NUMERIC(5, 4)`): Confidence bounds (0.0 to 1.0).
  * `details` (`JSONB`): Prediction parameters, feature weights, and risk flags.
  * `model_version` (`VARCHAR(50)`): Version hash of the active model.
  * `created_at` (`TIMESTAMP WITH TIME ZONE`): Defaults to `CURRENT_TIMESTAMP`.

#### 6. Table: `reports` `[REAL]`
Logs compiled PDF summary files.
* **Fields**:
  * `id` (`UUID`, PK): Primary identifier.
  * `property_id` (`UUID`, FK -> `properties.id`): Evaluated property.
  * `file_path` (`VARCHAR(512)`): File location of the compiled PDF.
  * `status` (`VARCHAR(50)`): Status (`generating`, `ready`, `failed`).
  * `trust_score` (`INTEGER`): Final composite score generated (0 - 100).
  * `created_at` (`TIMESTAMP WITH TIME ZONE`): Defaults to `CURRENT_TIMESTAMP`.
  * `expired_at` (`TIMESTAMP WITH TIME ZONE`, Nullable): Unused in MVP (expiration logic disabled).

#### 7. Table: `audit_logs` `[REAL]`
Simple log table for tracking operations.
* **Fields**:
  * `id` (`BIGSERIAL`, PK): Sequential auto-incrementing ID.
  * `user_id` (`UUID`, FK -> `users.id`, Nullable): Trigger user.
  * `action` (`VARCHAR(100)`): Activity (`CREATE_PROPERTY`, `RUN_ANALYSIS`).
  * `target_table` (`VARCHAR(100)`): Impacted table.
  * `target_id` (`UUID`, Nullable): Primary key of target resource.
  * `timestamp` (`TIMESTAMP WITH TIME ZONE`): Defaults to `CURRENT_TIMESTAMP`.
  * `ip_address` (`VARCHAR(45)`): IP of the client.
  * `changes` (`JSONB`, Nullable): Historical delta.

---

## 5. API Design

The API endpoints form the core REST interfaces for the FastAPI backend, utilizing the `app/api/` routing structure.

### API Specifications

#### 1. Unified Property Analysis (Preferred Integration Endpoint)
* **Route**: `POST /api/v1/analyze` `[REAL]`
* **Purpose**: Single endpoint to run the ML valuation, rule-based fraud check, trust scoring, and GIS retrieval in one request. Powers the main frontend dashboard.
* **Request Schema**: `PropertyCreate` (identical to `POST /api/v1/properties/`)
* **Response Schema (200 OK)**:
  ```json
  {
    "property_id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "predicted_value_inr": 1173590.00,
    "price_classification": "fair",
    "confidence_score": 0.92,
    "risk_flags": [
      "High number of joint owners (7)"
    ],
    "trust_score": 88,
    "summary": "The property in Chinchpada, Nashik, is valued at approximately ₹11.74 Lakhs. It has a high trust rating (88/100) but exhibits minor risk flags due to multiple joint owners."
  }
  ```

#### 2. System Health Check
* **Route**: `GET /health` `[REAL]`
* **Purpose**: Performance and database connectivity verification.
* **Response Schema (200 OK)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-06-05T22:11:30Z",
    "services": {
      "database": "connected",
      "ocr_engine": "ready",
      "valuation_model": "loaded"
    }
  }
  ```

#### 3. Create Property Record
* **Route**: `POST /api/v1/properties/` `[REAL]`
* **Purpose**: Instantiate a new property entity for evaluation.
* **Request Schema**:
  ```json
  {
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
  ```
* **Response Schema (201 Created)**:
  ```json
  {
    "id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "survey_number": "45/A/1",
    "status": "pending_documents",
    "created_at": "2026-06-05T22:11:30Z"
  }
  ```

#### 4. Upload Land Document
* **Route**: `POST /api/v1/properties/{property_id}/documents` `[REAL / PARTIAL]`
* **HTTP Method**: `POST` (Multipart Form Data)
* **Purpose**: Upload property documents (e.g., 7/12 extract) for OCR processing.
* **Request Payload**:
  * `file`: Binary file (PDF, PNG, JPEG, max size: 10MB)
  * `file_type`: String (`7_12_extract`, `sale_deed`)
* **Response Schema (202 Accepted)**:
  ```json
  {
    "document_id": "c1f7b8e2-9b2f-410a-ba6a-5431bf90234e",
    "property_id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "file_name": "7_12_extract_survey_45.pdf",
    "file_type": "7_12_extract",
    "status": "processing",
    "uploaded_at": "2026-06-05T22:11:32Z"
  }
  ```

#### 5. Read Document Processing & OCR Status
* **Route**: `GET /api/v1/properties/{property_id}/documents/{document_id}/ocr` `[REAL / PARTIAL]`
* **Purpose**: Fetch the status of OCR text extraction and view raw output.
* **Response Schema (200 OK)**:
  ```json
  {
    "document_id": "c1f7b8e2-9b2f-410a-ba6a-5431bf90234e",
    "status": "processed",
    "ocr_confidence": 0.892,
    "file_type": "7_12_extract",
    "extracted_fields": {
      "survey_number": "45/A/1",
      "total_area_hectares": 1.83,
      "owners": ["Ramesh Tukaram Kalbhor", "Suresh Tukaram Kalbhor"],
      "liabilities": "None"
    }
  }
  ```

#### 6. Verify Ownership Consistency (Simplified)
* **Route**: `POST /api/v1/properties/{property_id}/verify-consistency` `[SIMULATED]`
* **Purpose**: Run local consistency checks (comparing user inputs vs OCR text) using fuzzy spelling logic.
* **Response Schema (200 OK)**:
  ```json
  {
    "property_id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "verification_status": "verified",
    "mismatches_found": [],
    "matches": [
      {
        "provided_name": "Ramesh Tukaram Kalbhor",
        "document_name": "Ramesh Tukaram Kalbhor",
        "match_confidence": 1.0
      }
    ],
    "last_checked": "2026-06-05T22:11:35Z"
  }
  ```

#### 7. Calculate Land Valuation
* **Route**: `POST /api/v1/properties/{property_id}/valuation` `[REAL]`
* **Purpose**: Execute predictions using the RandomForestRegressor model.
* **Response Schema (200 OK)**:
  ```json
  {
    "property_id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "estimated_market_value_inr": 1173590.00,
    "price_per_acre_inr": 227000.00,
    "valuation_classification": "fair",
    "confidence_score": 0.92,
    "model_version": "val_random_forest_v1.0.0"
  }
  ```

#### 8. Fraud Risk Assessment
* **Route**: `POST /api/v1/properties/{property_id}/fraud-check` `[SIMULATED]`
* **Purpose**: Evaluate deterministic rules to flag land risk issues.
* **Response Schema (200 OK)**:
  ```json
  {
    "property_id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "overall_fraud_risk": "low",
    "risk_score": 15,
    "triggered_rules": [],
    "indicators": [
      {
        "name": "Area Mismatch",
        "status": "clear",
        "description": "Area in 7/12 matches survey area."
      }
    ]
  }
  ```

#### 9. Retrieve Combined Trust Score
* **Route**: `GET /api/v1/properties/{property_id}/trust-score` `[REAL]`
* **Purpose**: Fetch the aggregated trust score of the property.
* **Response Schema (200 OK)**:
  ```json
  {
    "property_id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "trust_score": 88,
    "rating_classification": "highly_trustworthy",
    "breakdown": {
      "document_verification": 95,
      "valuation_confidence": 92,
      "fraud_risk_factor": 85,
      "data_completeness": 80
    }
  }
  ```

#### 10. Generate PDF Report (Synchronous)
* **Route**: `POST /api/v1/properties/{property_id}/report` `[REAL]`
* **Purpose**: Generate and compile land parameters into a PDF document synchronously.
* **Response Schema (200 OK)**:
  ```json
  {
    "report_id": "d7b8e2a9-c2b4-4b53-90d2-43cf71a7d654",
    "property_id": "a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654",
    "status": "ready",
    "download_url": "/api/v1/properties/a9b7e3f8-c2b4-4b53-90d2-43cf71a7d654/report/download",
    "generated_at": "2026-06-05T22:11:40Z"
  }
  ```

#### 11. Download Report PDF
* **Route**: `GET /api/v1/properties/{property_id}/report/download` `[REAL]`
* **Purpose**: Stream the compiled PDF binary file to the client.
* **Response Schema (200 OK)**: Binary stream (`application/pdf`).

---

## 6. Pydantic Schemas

All schemas reside under `app/schemas/`.

### Schema Class Code Definitions

#### 1. File: `app/schemas/property.py`
```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class PropertyBase(BaseModel):
    survey_number: str = Field(..., description="Indian land registry survey/khasra number")
    state: str = Field(..., description="State name (e.g., Maharashtra)")
    district: str = Field(..., description="District name (e.g., Nashik)")
    taluka: str = Field(..., description="Sub-district / Taluka")
    village: str = Field(..., description="Village / Gram Panchayat")
    area_acre: float = Field(..., gt=0, description="Total area in acres")
    soil_type: str = Field(..., description="Soil classification type (e.g. Black, Red, Black_Red_Mixed)")
    soil_quality_score: int = Field(..., ge=1, le=10, description="Soil quality score from 1 to 10")
    land_type: str = Field(..., description="Land classification type (e.g. Agricultural, Residential, Commercial)")
    irrigated: int = Field(..., ge=0, le=1, description="Irrigation status (1=Yes, 0=No)")
    road_touch: int = Field(..., ge=0, le=1, description="Road touch status (1=Yes, 0=No)")
    road_width_ft: int = Field(..., ge=0, description="Road width in feet")
    distance_to_highway_km: float = Field(..., ge=0, description="Distance to highway in KM")
    water_source: str = Field(..., description="Primary water source (e.g. Borewell, River, Well, Canal, None)")
    number_of_owners: int = Field(..., ge=1, description="Number of legal owners")
    unknown_registrations: int = Field(..., ge=0, description="Number of unknown registrations")
    takeover_risk: int = Field(..., ge=0, le=1, description="Takeover risk (1=Yes, 0=No)")
    avg_price_per_acre_nearby: float = Field(..., ge=0, description="Average price per acre nearby in INR")
    asking_price: Optional[float] = Field(None, ge=0, description="Quoted land price in INR")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)

class PropertyCreate(PropertyBase):
    @field_validator('state')
    @classmethod
    def validate_state(cls, v: str) -> str:
        allowed_states = {"Maharashtra"}
        if v not in allowed_states:
            raise ValueError(f"State '{v}' is not supported for verification during hackathon MVP.")
        return v

class PropertyResponse(PropertyBase):
    id: UUID
    user_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AnalyzeResponse(BaseModel):
    property_id: UUID
    predicted_value_inr: float
    price_classification: str
    confidence_score: float
    risk_flags: List[str]
    trust_score: int
    summary: str
```

#### 2. File: `app/schemas/document.py`
```python
from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Dict, Any

class DocumentStatusResponse(BaseModel):
    document_id: UUID
    property_id: UUID
    file_name: str
    file_type: str
    status: str = Field(..., description="uploaded | processing | processed | failed")
    uploaded_at: datetime

class OCRExtractionResponse(BaseModel):
    document_id: UUID
    status: str
    ocr_confidence: float = Field(..., ge=0.0, le=1.0)
    file_type: str
    extracted_fields: Dict[str, Any]
```

#### 3. File: `app/schemas/valuation.py`
```python
from pydantic import BaseModel, Field
from uuid import UUID

class ValuationResponse(BaseModel):
    property_id: UUID
    estimated_market_value_inr: float
    price_per_acre_inr: float
    valuation_classification: str = Field(..., description="undervalued | fair | overvalued")
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    model_version: str
```

#### 4. File: `app/schemas/fraud.py`
```python
from pydantic import BaseModel, Field
from uuid import UUID
from typing import List

class FraudIndicator(BaseModel):
    name: str
    status: str = Field(..., description="clear | warning | high_risk")
    description: str

class FraudAnalysisResponse(BaseModel):
    property_id: UUID
    overall_fraud_risk: str = Field(..., description="low | medium | high")
    risk_score: int = Field(..., ge=0, le=100)
    triggered_rules: List[str]
    indicators: List[FraudIndicator]
```

#### 5. File: `app/schemas/trust.py`
```python
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Dict

class TrustScoreResponse(BaseModel):
    property_id: UUID
    trust_score: int = Field(..., ge=0, le=100)
    rating_classification: str = Field(..., description="high_risk | moderate | trustworthy | highly_trustworthy")
    breakdown: Dict[str, int]
```

#### 6. File: `app/schemas/report.py`
```python
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class ReportGenerationResponse(BaseModel):
    report_id: UUID
    property_id: UUID
    status: str
    download_url: str
    generated_at: datetime
```

---

## 7. SQLAlchemy Models

Implemented under `app/models/` using SQLAlchemy 2.0.

### ORM Entity Definitions

#### 1. File: `app/models/user.py` `[FUTURE / MOCKED]`
```python
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="buyer")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    properties = relationship("Property", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
```

#### 2. File: `app/models/property.py` `[REAL]`
```python
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.base import Base

class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    survey_number = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    taluka = Column(String(100), nullable=False)
    village = Column(String(100), nullable=False, index=True)
    area_acre = Column(Numeric(10, 4), nullable=False)
    soil_type = Column(String(100), nullable=False)
    soil_quality_score = Column(Integer, nullable=False)
    land_type = Column(String(100), nullable=False)
    irrigated = Column(Integer, nullable=False)
    road_touch = Column(Integer, nullable=False)
    road_width_ft = Column(Integer, nullable=False)
    distance_to_highway_km = Column(Numeric(10, 2), nullable=False)
    water_source = Column(String(100), nullable=False)
    number_of_owners = Column(Integer, nullable=False)
    unknown_registrations = Column(Integer, nullable=False)
    takeover_risk = Column(Integer, nullable=False)
    avg_price_per_acre_nearby = Column(Numeric(15, 2), nullable=False)
    asking_price = Column(Numeric(15, 2), nullable=True)
    latitude = Column(Numeric(9, 6), nullable=True)
    longitude = Column(Numeric(9, 6), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="properties")
    documents = relationship("Document", back_populates="property", cascade="all, delete-orphan")
    ownership_records = relationship("OwnershipRecord", back_populates="property", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="property", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="property", cascade="all, delete-orphan")
```

#### 3. File: `app/models/document.py` `[REAL]`
```python
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.base import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_path = Column(String(512), nullable=False)
    status = Column(String(50), nullable=False, default="uploaded")
    ocr_text = Column(Text, nullable=True)
    extraction_metadata = Column(JSONB, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    property = relationship("Property", back_populates="documents")
    ownership_records = relationship("OwnershipRecord", back_populates="document")
```

#### 4. File: `app/models/ownership.py` `[SIMULATED / REAL]`
```python
from sqlalchemy import Column, String, Numeric, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.base import Base

class OwnershipRecord(Base):
    __tablename__ = "ownership_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    owner_name = Column(String(255), nullable=False, index=True)
    share_percentage = Column(Numeric(5, 2), nullable=False)
    holding_type = Column(String(50), nullable=False, default="sole")
    acquisition_date = Column(Date, nullable=True)
    encumbrances = Column(JSONB, nullable=True)
    verification_status = Column(String(50), nullable=False, default="pending")
    verified_at = Column(DateTime(timezone=True), nullable=True)

    property = relationship("Property", back_populates="ownership_records")
    document = relationship("Document", back_populates="ownership_records")
```

#### 5. File: `app/models/prediction.py` `[REAL]`
```python
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.base import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    prediction_type = Column(String(50), nullable=False, index=True)
    estimated_value = Column(Numeric(15, 2), nullable=True)
    confidence_score = Column(Numeric(5, 4), nullable=False)
    details = Column(JSONB, nullable=False)
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    property = relationship("Property", back_populates="predictions")
```

#### 6. File: `app/models/report.py` `[REAL]`
```python
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database.base import Base

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(512), nullable=False)
    status = Column(String(50), nullable=False, default="generating")
    trust_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    expired_at = Column(DateTime(timezone=True), nullable=True)

    property = relationship("Property", back_populates="reports")
```

---

## 8. Service Layer Design

All business logic resides under `app/services/`.

### Core Services

#### 1. Document Services (`app/services/document_service.py`)
* **Upload Service** `[REAL]`: Saves uploaded PDF/image files to local directories and writes metadata records.
* **OCR Service** `[REAL / PARTIAL]`: Extracts raw text blocks using local EasyOCR or Tesseract.
* **Classification Service** `[SIMULATED]`: Uses simple keyword patterns to tag documents (e.g., searching "7/12" or "deed").
* **Extraction Service** `[SIMULATED / PARTIAL]`: Employs regex templates to pull survey number, area, and owners list from the raw OCR text output.

#### 2. Ownership Consistency Check Service (`app/services/ownership_service.py`)
* **Consistency Check Engine** `[SIMULATED]`:
  * *Responsibilities*: Compares spelling of names declared in the property creation step against names extracted from document OCR using Levenshtein distance thresholds (fuzzy matching). Checks if the sum of joint ownership shares equals 100%.
  * *Rule of Verification*: Bypasses live government registries. No external registry validation is performed.

#### 3. Valuation Services (`app/services/valuation_service.py`) `[REAL]`
* **Feature Builder**: Constructs a feature vector from property inputs (`Area_Acre`, `Soil_Quality_Score`, `Irrigated`, `Road_Touch`, `Road_Width_Ft`, `Distance_To_Highway_KM`, `Number_Of_Owners`, `Unknown_Registrations`, `Takeover_Risk`, `Avg_Price_Per_Acre_Nearby`). Uses persisted label encoders for categorical attributes (`Village`, `Taluka`, `Soil_Type`, `Land_Type`, `Water_Source`).
* **Valuation Service**: Loads the serialized Scikit-Learn `RandomForestRegressor` (`land_price_model.pkl`), executes inference to estimate `Price_Per_Acre`, computes total predicted value (`estimated_price_per_acre * area_acre`), classification boundaries, and writes prediction logs.
* **Price Classification**: Evaluates the ratio between `asking_price` and predicted price:
  * Ratio < 0.85: `undervalued`
  * Ratio > 1.15: `overvalued`
  * Otherwise: `fair`

#### 4. Fraud Services (`app/services/fraud_service.py`) `[SIMULATED]`
* **Rule Engine**: Evaluates a set of deterministic risk criteria. Bypasses isolation forest anomaly models and Neo4j graph checking.
* **Fraud Scoring**: Computes a total risk score (0-100) based on triggered rules.

#### 5. Trust Services (`app/services/trust_service.py`) `[REAL]`
* **Trust Score Engine**: Integrates sub-scores (valuation confidence, data completeness, fraud score, and document match status) using the weighted formula.

#### 6. Report Services (`app/services/report_service.py`) `[REAL]`
* **Report Generator**: Generates WeasyPrint PDF reports synchronously using a Jinja2 HTML template. Avoids job queues and expiration caching for MVP simplicity.

---

## 9. Machine Learning Architecture

The ML subsystem lives under `backend/ml/` and runs the inference engine for pricing calculations.

### Module 1: OCR Pipeline (`ml/ocr/`) `[REAL / PARTIAL]`
* **Input**: PDF, JPEG, or PNG document bytes.
* **Output**: Text blocks and extracted dictionary.
* **Pipeline**:
  1. Image conversion (300 DPI greyscale).
  2. OCR scan using local EasyOCR/Tesseract.
  3. Pattern matching using local regex scripts to identify names and area counts.
* **Fuzzy Match Engine**: Uses Levenshtein distance check to match name strings:
  $$\text{Similarity}(S_1, S_2) = 1.0 - \frac{\text{Distance}(S_1, S_2)}{\max(\text{len}(S_1), \text{len}(S_2))}$$
  Threshold for a valid name match is set at $\ge 0.80$.

### Module 2: Valuation Engine (`ml/valuation/`) `[REAL]`
The land valuation engine uses a **RandomForestRegressor** trained offline on `Lands_of_Nashik.csv` to predict `Price_Per_Acre`.

#### Training vs Inference Separation

* **Training Pipeline (Offline / Standalone)**:
  * Loads `Lands_of_Nashik.csv`.
  * Encodes text categories using `LabelEncoder`.
  * Splits datasets using an 80/20 train/test holdout.
  * Fits the `RandomForestRegressor` and serializes it to `land_price_model.pkl`. Saves label encoders separately to `ml/valuation/encoders/`.
* **Inference Pipeline (Online / FastAPI startup)**:
  * Loads `land_price_model.pkl` and encoders once during startup.
  * Encodes categorical strings using pre-loaded encoders. Unseen values trigger an out-of-vocabulary fallback mapping to the dataset mode category, along with a confidence deduction.
  * Returns estimated market value.

#### Confidence Score Design
The prediction confidence score is calculated dynamically based on global metrics, categorical encoder validity, and property details completeness:

* **Base Confidence**: Starts at `0.80`, reflecting the model validation R² and MAPE metrics.
* **Encoder Match / Out-of-Vocabulary Penalties**:
  * Unknown Village: $-0.15$
  * Unknown Taluka: $-0.10$
* **Completeness Penalties**:
  * Missing Soil Quality Score: $-0.05$
  * Missing Distance to Highway: $-0.05$
  * Missing Road Width: $-0.05$

$$\text{Valuation Confidence} = \max\left(0.10, 0.80 - \sum \text{Penalties}\right)$$

This transparent, rule-based approach is easy to explain to judges and provides defensible model-based bounds.

### Module 3: Fraud Detection Engine (`ml/fraud/`) `[SIMULATED]`
Fraud risk assessment for the MVP is strictly rule-based. Advanced algorithms (Neo4j graphs, isolation forests) are moved to the Future Scope.

| Rule ID | Indicator Name | Trigger Condition | Severity | Penalty |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Area Mismatch | Document extracted area differs from user input by > 5% | High | +30 points |
| **FR-02** | Owner Name Mismatch | Primary owner names not found in OCR text (similarity < 0.8) | High | +25 points |
| **FR-03** | Multiple Joint Owners | Number of legal owners listed is $\ge 5$ | Medium | +15 points |
| **FR-04** | Missing Mandatory Docs | 7/12 Extract or Title Deed not uploaded | High | +30 points |
| **FR-05** | Share Balance Check | Sum of ownership share percentages $\ne 100\%$ | Medium | +20 points |

$$\text{Fraud Risk Score} = \min\left(100, \sum \text{Triggered Penalties}\right)$$
* `low` risk: Score $< 30$
* `medium` risk: Score $30 - 59$
* `high` risk: Score $\ge 60$

---

## 10. Trust Score Engine

The Trust Score Engine aggregates valuation, document, completeness, and fraud indices into a single representative metric (0-100) for the frontend dashboard.

### Scoring Methodology

The score is calculated as a weighted sum:

$$\text{Trust Score} = w_1 \cdot S_{\text{doc}} + w_2 \cdot S_{\text{fraud}} + w_3 \cdot S_{\text{val}} + w_4 \cdot S_{\text{data}}$$

### Weights & Parameters

| Component | Status | Variable | Weight | Definition / Calculation |
| :--- | :--- | :--- | :--- | :--- |
| **Document Consistency** | `[SIMULATED]` | $w_1$ | 35% | Score ($S_{\text{doc}}$): 100 if owners/survey match exactly; 70 for fuzzy matches; 0 if missing. |
| **Fraud Risk Factor** | `[SIMULATED]` | $w_2$ | 30% | Score ($S_{\text{fraud}}$): Calculated as $100 - \text{Fraud Risk Score}$. |
| **Valuation Confidence** | `[REAL]` | $w_3$ | 20% | Score ($S_{\text{val}}$): Valuation Confidence mapped to 100 (e.g. 0.92 = 92). |
| **Data Completeness** | `[REAL]` | $w_4$ | 15% | Score ($S_{\text{data}}$): Percentage of optional fields supplied (e.g., latitude, asking price). |

### Trust Classification Scales
* **90 - 100**: Highly Trustworthy (`highly_trustworthy`)
* **75 - 89**: Trustworthy (`trustworthy`)
* **50 - 74**: Moderate Risk (`moderate`)
* **0 - 49**: High Risk (`high_risk`)

---

## 11. Report Generation

The report generation pipeline constructs a downloadable summary document detailing the valuation, ownership history, and fraud risks.

```mermaid
graph TD
    Trigger[POST /api/v1/properties/id/report] --> Fetch[Service aggregates data from Postgres]
    Fetch --> Context[Format context dictionary]
    Context --> Template[Load Jinja2 HTML/CSS Template]
    Template --> HTML[Rendered HTML string]
    HTML --> Weasy[WeasyPrint PDF Compiler]
    Weasy --> PDF[PDF binary output]
    Weasy --> Save[Write file to disk locally]
    Save --> DB[Create Report entry: status='ready']
    DB --> Success[Return download API endpoint link]
```

### Report Generation Details
1. **Compilation**: Triggered synchronously. Avoids job queues or task managers to guarantee execution speed and simplicity during live demos.
2. **Layout Rendering**: Data is injected into `app/templates/property_report.html` and styled using inline CSS.
3. **PDF Generation**: Compiled using the `weasyprint` library. PDF files are stored in the local `/backend/storage/reports/` directory.
4. **Caching**: Expiration workflows are disabled for the MVP. The system will compile and serve the latest compiled report upon request.

---

## 12. Configuration Management

Configuration settings are loaded dynamically using `pydantic-settings`.

### File: `app/core/config.py`
```python
from pydantic_settings import BaseSettings
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
        "postgresql://postgres:postgres@localhost:5432/landiq_db", 
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
```

---

## 13. Error Handling Strategy

FastAPI capturing middleware intercepts exceptions and standardizes responses.
* **Validation Errors (`422`)**: Captures missing fields and formats clear user-facing labels.
* **Database Errors (`500`)**: Logs integrity exceptions, masking raw SQL strings in client payloads.
* **OCR Parse Failure (`422`)**: Catches invalid document layouts and returns a warning code.

---

## 14. Testing Strategy

The repository follows a clean testing layout placed under `tests/`.

### Example Test Commands
```bash
# Run all tests
pytest -v

# Run ML model validation tests
pytest -v tests/ml/
```

---

## 15. Security Considerations

For the hackathon MVP, security checks are optimized to prevent blockers:
1. **File Upload Filters**: Enforce binary header magic checks (confirming PDF signatures) and limit files to 10MB to avoid system exhaustion.
2. **SQL Injection**: Prevent raw SQL queries by enforcing parameterization using SQLAlchemy's ORM compiler.
3. **Authentication Bypass**: Token verification middlewares are disabled or bypassed by default. A static default developer session is injected for all incoming requests, ensuring integration simplicity.

---

## 16. MVP Scope vs Future Scope

| Feature Area | MVP Scope (Hackathon) | Future Scope (Production) |
| :--- | :--- | :--- |
| **Authentication** | `[MOCKED]` Bypassed. Direct access to API routes using a constant user context. | `[FUTURE]` OAuth2, JWT authentication, RBAC role validation, password hashing. |
| **Valuation Engine** | `[REAL]` RandomForestRegressor trained offline on Nashik pricing dataset. village-level encoders. | `[FUTURE]` XGBoost, LightGBM, dynamic GIS-linked models updating from real-time sales registry feeds. |
| **Ownership Check**| `[SIMULATED]` Consistency checks matching document OCR names against property metadata. | `[FUTURE]` Real-time API integrations with state registries (Bhulekh portal, Kaveri engine). |
| **Fraud Detection** | `[SIMULATED]` Rule-based deductions (area deviation, owner share balance). | `[FUTURE]` Isolation Forest anomaly models, Neo4j Graph networks tracking title transfers. |
| **GIS Intelligence** | `[SIMULATED]` Coordinates distance checks, static village price reference lookups. | `[FUTURE]` Satellite imagery pipeline, parcel polygon boundary extraction, YOLO/DeepLab. |
| **Report Generation** | `[REAL]` Jinja2 template compiled to PDF synchronously using WeasyPrint. | `[FUTURE]` Serverless PDF workers, async task queues, email and sharing workflows. |

---

## 17. Realistic Build Plan

To guarantee hackathon success, development focuses strictly on high-impact MVP components, bypassing theoretical architecture.

### What Must Be Fully Working Before Submission

* **Property Creation**: Creating property data entries in PostgreSQL.
* **Analyze Endpoint (`POST /api/v1/analyze`)**: The core entry point for the React frontend, calculating value, fraud risk, and trust index in a single request.
* **Random Forest Prediction**: Real price predictions using `land_price_model.pkl` trained on Nashik data.
* **Confidence & Trust Score Engines**: Live calculation of confidence scores and trust scoring matrices using the weighted formulas.
* **PDF Report Compilation**: Direct synchronous rendering of PDF files using WeasyPrint.

### What Can Be Mocked / Simulated

* **Ownership Consistency checks**: Spell matches between user text and OCR text using fuzzy algorithms. No live database scraping of registry websites.
* **GIS Intelligence**: Nearby land value comparisons, location metadata, and road/highway distances (computed using simple coordinate bounds or mocked values).
* **Fraud Indicators**: Purely rule-based penalties configured in service scripts, rather than ML anomaly models.

### What Should Not Be Built

* **Neo4j DB and Graph Analytics**: Graph analysis is overengineered and will not be demoed.
* **Satellite Analytics, YOLO, and DeepLab**: Excluded due to the complexity of sourcing satellite imagery and segmenting polygons under time limits.
* **Isolation Forest**: ML-based anomaly models require clean, tagged fraud datasets that do not exist for the target Nashik villages.
* **JWT Authentication**: Increases integration complexity. Can be replaced with a default mock session to let judges explore the platform without sign-up flows.
* **Government Registry Integrations**: Excluded due to scraping protections (CAPTCHAs) and lack of official API endpoints.

---

## 18. Architecture Risk Review

This section outlines key technical risks for the MVP and their respective mitigation plans:

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Dataset Constraints (Nashik Only)** | Valuation requests for other regions will fail or yield incorrect predictions. | Hard-constrain district inputs in the frontend dropdown and schema validations to "Nashik" only. Display clear labels indicating Nashik region focus. |
| **Label Encoder Drift** | Unseen Village or Taluka names will trigger runtime model prediction crashes. | Implement an out-of-vocabulary handler in the inference pipeline that maps unseen values to the mode category and applies a confidence penalty. |
| **Lack of Registry Access** | Impossible to perform official land ownership checks during a live demo. | Frame the feature as an "Ownership Consistency Check" comparing OCR text vs user-supplied registry metadata. |
| **No Real Fraud Datasets** | Inability to train anomaly detection models for land fraud risks. | Implement a deterministic rule-based scorecard mapping logical risks (e.g. area size discrepancy) to risk points. |
| **Static GIS Data** | Inaccurate live distance calculations to highway references. | Pre-compile a static lookup of coordinate locations to Nashik highway nodes, and calculate distances using the Haversine formula locally. |
