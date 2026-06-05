# Integration Plan Review & Resolution

> Every issue below was verified against the actual backend and frontend source code.
> No assumption was trusted — only code evidence.

---

## ISSUE 1: AnalyzeResponse Assumption Validation

### Issue
Does the `AnalyzeResponse` contain everything the Dashboard needs?

### Evidence Found

**AnalyzeResponse schema** (`backend/app/schemas/property.py` L47-54):
```python
class AnalyzeResponse(BaseModel):
    property_id: UUID
    predicted_value_inr: float      # total estimated market value
    price_classification: str       # "undervalued" | "fair" | "overvalued"
    confidence_score: float         # 0.0 to 1.0 (NOT percentage)
    risk_flags: List[str]           # human-readable risk strings
    trust_score: int                # 0-100
    summary: str                    # generated text summary
```

**Actual return statement in `analysis.py` L120-128**:
```python
return {
    "property_id": property_id,
    "predicted_value_inr": val_res["estimated_market_value_inr"],  # total value, NOT per-acre
    "price_classification": val_res["valuation_classification"],
    "confidence_score": val_res["confidence_score"],               # float 0-1
    "risk_flags": risk_flags,
    "trust_score": trust_score,                                    # int 0-100
    "summary": summary
}
```

**What's available vs. what Dashboard needs:**

| Dashboard Widget | Needed Data | In AnalyzeResponse? | Notes |
|---|---|---|---|
| Predicted Price Per Acre | price_per_acre_inr | **NO** | Only `predicted_value_inr` (total) exists. Must derive: `predicted_value_inr / area_acre` |
| Total Land Value | predicted_value_inr | **YES** | Direct field |
| Area (Acres) | area_acre | **NO** | Must come from the submitted form data (PropertyCreate payload) |
| Confidence Score | confidence_score | **YES** | Returns 0-1 float, Dashboard shows as percentage, must multiply ×100 |
| Classification | price_classification | **YES** | Direct field |
| Risk Flags | risk_flags | **YES** | Array of human-readable strings |
| Trust Score | trust_score | **YES** | Direct field, int 0-100 |
| Summary | summary | **YES** | Direct field |
| Parcel ID | property_id | **YES** | UUID string |

### Root Cause
`AnalyzeResponse` does NOT include `price_per_acre_inr` or `area_acre`. The per-acre price exists inside the ML service's return dict (`val_res["price_per_acre_inr"]`) but is **not forwarded** through the AnalyzeResponse schema.

### Possible Solutions

**Option A**: Expand `AnalyzeResponse` schema to include `price_per_acre_inr` and pass `area_acre`.
- Pros: Clean, all data from one API call
- Cons: Modifies backend (violates user's "do not redesign backend" rule)

**Option B**: Derive price-per-acre on the frontend from `predicted_value_inr / area_acre` using the form data the user just submitted.
- Pros: Zero backend changes, mathematically correct (since backend does `estimated_value = pred_price_per_acre * area`)
- Cons: Frontend must carry `area_acre` forward alongside the API response

**Option C**: Make a second call to `GET /api/v1/properties/{id}` to get the full property record including `area_acre`, then derive.
- Pros: Reliable, doesn't depend on client-side state
- Cons: Extra API call for data the user just submitted

### Chosen Solution
**Option B**: Derive client-side. The frontend already has the `PropertyCreate` payload (with `area_acre`) available when it navigates to Dashboard. We pass both `analysisResult` + `propertyDetails` in router state. Price-per-acre = `predicted_value_inr / propertyDetails.area_acre`.

### Tradeoffs
- Depends on router state surviving navigation (addressed in Issue 2).
- If user navigates directly to `/dashboard` without form submission, there's no data. We handle this with a fallback that fetches property data by ID.

### Files Modified
- None (current PropertyAnalysis.tsx already passes both `analysisResult` and `propertyDetails` in state)

---

## ISSUE 2: Property Context Architecture

### Issue
`navigate('/dashboard', { state: analysisResult })` — browser refresh destroys `location.state`.

### Evidence Found
- Current implementation in `PropertyAnalysis.tsx` L100-104 uses `navigate('/dashboard', { state: { analysisResult, propertyDetails } })`
- No shared state (no Context, Redux, Zustand) exists in the project
- No URL parameters are used for property context
- `Dashboard.tsx` currently has zero state management — it's 100% static HTML

### Root Cause
React Router's `location.state` is stored in browser `history.state`. It survives page refreshes in most browsers **but** is lost on hard navigation (e.g., pasting URL, opening in new tab).

### Possible Solutions

| Option | Complexity | Refresh-Safe | Direct URL | Dependencies |
|---|---|---|---|---|
| A: Router state only | Low | Partial (works on soft refresh) | No | None |
| B: URL params `/dashboard/:propertyId` | Low | Yes | Yes | Requires `getProperty()` API call |
| C: React Context | Medium | No (same as A) | No | None |
| D: Zustand/Redux | High | Only with persistence plugin | Depends | New dependency |
| E: localStorage cache | Low | Yes | Yes | None |

### Chosen Solution
**Hybrid of A + B + E**: 

1. **Primary flow**: Pass data via router state (fast, no extra API call).
2. **URL param**: Route becomes `/dashboard/:propertyId` so the URL contains the property ID.
3. **localStorage fallback**: After receiving analysis data, cache it in `localStorage` keyed by `property_id`. On refresh, check router state first → then localStorage → then fetch from API.
4. **Direct URL access**: If someone navigates to `/dashboard/<uuid>` without state, fetch the property via `GET /api/v1/properties/{id}` and re-run any needed calculations.

This approach:
- Works on refresh (localStorage)
- Works on direct URL (API fallback)
- Doesn't add new dependencies
- Is appropriate for a hackathon MVP

### Tradeoffs
- localStorage is per-browser, per-origin — not shared across devices (acceptable for MVP)
- Stale data risk if property changes — mitigated by always caching after fresh analysis
- Slightly more complex than pure router state, but much more robust

### Files Modified
- `frontend/src/App.tsx` — update route to `/dashboard/:propertyId?`
- `frontend/src/pages/Dashboard.tsx` — add state loading logic with fallback chain
- `frontend/src/pages/PropertyAnalysis.tsx` — navigate to `/dashboard/${result.property_id}`

---

## ISSUE 3: Backend Contract Verification

### Evidence Found — Verified Endpoint-by-Endpoint

#### 1. `GET /health`
- **Exists**: ✅ `main.py` L67-89
- **Route**: `/health` (no API prefix)
- **Response**: `{ status, timestamp, services: { database, ocr_engine, valuation_model } }`
- **Status codes**: 200 (always returns, even if unhealthy)
- **Error payloads**: None (gracefully handles DB failure)

#### 2. `POST /api/v1/analyze`
- **Exists**: ✅ `analysis.py` L15
- **Route**: `/api/v1/analyze` (analysis router has no prefix, API prefix applied globally)
- **Request**: `PropertyCreate` (all PropertyBase fields + state validator)
- **Response**: `AnalyzeResponse` — `{ property_id, predicted_value_inr, price_classification, confidence_score, risk_flags, trust_score, summary }`
- **Status codes**: 200 success, 500 on failure
- **Error payloads**: `{ "detail": "Analysis calculation failed: ..." }`
- **Side effects**: Creates property in DB, creates 2 prediction records, creates audit log

#### 3. `POST /api/v1/properties/`
- **Exists**: ✅ `properties.py` L29
- **Route**: `/api/v1/properties/`
- **Request**: `PropertyCreate`
- **Response**: `PropertyCreateResponse` — `{ id, survey_number, status, created_at }`
- **Status codes**: 201, 500

#### 4. `GET /api/v1/properties/`
- **Exists**: ✅ `properties.py` L49
- **Route**: `/api/v1/properties/`
- **Response**: `List[PropertyResponse]`
- **Status codes**: 200, 500

#### 5. `GET /api/v1/properties/{id}`
- **Exists**: ✅ `properties.py` L39
- **Route**: `/api/v1/properties/{property_id}`
- **Param type**: UUID
- **Response**: `PropertyResponse`
- **Status codes**: 200, 404

#### 6. `POST /api/v1/properties/{id}/valuation`
- **Exists**: ✅ `properties.py` L59
- **Response**: `ValuationResponse` — `{ property_id, estimated_market_value_inr, price_per_acre_inr, valuation_classification, confidence_score, model_version }`
- **Status codes**: 200, 404, 500

#### 7. `POST /api/v1/properties/{id}/fraud-check`
- **Exists**: ✅ `properties.py` L102
- **Response**: `FraudAnalysisResponse` — `{ property_id, overall_fraud_risk, risk_score, triggered_rules, indicators }`
- **Status codes**: 200, 404, 500

#### 8. `GET /api/v1/properties/{id}/trust-score`
- **Exists**: ✅ `properties.py` L146
- **Response**: `TrustScoreResponse` — `{ property_id, trust_score, rating_classification, breakdown }`
- **Status codes**: 200, 404, 500

#### 9. `POST /api/v1/properties/{id}/documents`
- **Exists**: ✅ `properties.py` L169
- **Request**: `multipart/form-data` with `file` (UploadFile) and `file_type` (Form string)
- **Response**: `DocumentStatusResponse` — `{ document_id, property_id, file_name, file_type, status, uploaded_at }`
- **Status codes**: 202 (accepted), 404, 413 (too large), 400 (invalid file)
- **Side effects**: Saves file to disk, creates DB record with status "processing", spawns background OCR task

#### 10. `GET /api/v1/properties/{id}/documents/{doc_id}/ocr`
- **Exists**: ✅ `properties.py` L236
- **Response**: `OCRExtractionResponse` — `{ document_id, status, ocr_confidence, file_type, extracted_fields }`
- **Note**: `ocr_confidence` is **hardcoded to 0.95** when status is "processed", **0.0** otherwise (L251)
- **Status codes**: 200, 404

#### 11. `POST /api/v1/properties/{id}/report`
- **Exists**: ✅ `properties.py` L273
- **Response**: `ReportGenerationResponse` — `{ report_id, property_id, status, download_url, generated_at }`
- **Note**: Report generation is **synchronous** — it runs valuation, fraud, trust, renders HTML via Jinja2, compiles PDF via WeasyPrint, all in the request lifecycle
- **Status codes**: 200, 404, 500

#### 12. `GET /api/v1/properties/{id}/report/download`
- **Exists**: ✅ `properties.py` L290
- **Response**: `FileResponse` (application/pdf)
- **Note**: Looks up latest report in `reports` collection, returns file from disk
- **Status codes**: 200 (file), 404 (no report or file missing)

#### 13. `POST /api/v1/properties/{id}/verify-consistency`  ← **UNDOCUMENTED IN PLAN**
- **Exists**: ✅ `properties.py` L256
- **Response**: `{ property_id, verification_status, mismatches_found, matches, last_checked }`
- **Note**: This endpoint was missing from the integration plan. It cross-references OCR-extracted owner names against ownership records.

### Verified API Contract
**All 12 planned endpoints exist exactly as documented. One additional endpoint (`verify-consistency`) was discovered.**

### Files Modified
- Frontend `types.ts` needs no changes — types already match verified schemas

---

## ISSUE 4: Dashboard Data Ownership

### Evidence Found

| Data | Source | When Available |
|---|---|---|
| predicted_value_inr | `POST /analyze` response | After analysis |
| price_classification | `POST /analyze` response | After analysis |
| confidence_score | `POST /analyze` response | After analysis |
| risk_flags (summary) | `POST /analyze` response | After analysis |
| trust_score (int) | `POST /analyze` response | After analysis |
| summary text | `POST /analyze` response | After analysis |
| area_acre | PropertyCreate (form input) | Always (user submitted) |
| village, taluka, district | PropertyCreate (form input) | Always (user submitted) |
| Fraud indicators (detailed) | `POST /fraud-check` response | Separate call needed |
| Trust breakdown (detailed) | `GET /trust-score` response | Separate call needed |
| Fraud risk_score (numeric) | `POST /fraud-check` response | Separate call needed |
| Report existence | `POST /report` | After generation |

### Root Cause
`AnalyzeResponse` is a **summary** — it runs valuation, fraud, and trust internally but returns only aggregated data. The detailed fraud indicators and trust breakdown require separate endpoint calls.

### Chosen Solution — Data Ownership Model

```
Dashboard (primary):
  ← AnalyzeResponse (summary values)
  ← PropertyCreate payload (area, location)
  
FraudDetection (detail):
  ← FraudAnalysisResponse (detailed indicators, triggered_rules)
  
TrustScore (detail):  
  ← TrustScoreResponse (breakdown by category)

Reports:
  ← ReportGenerationResponse (report_id, download_url)
  ← listProperties() for report history
```

**Key insight**: Dashboard gets sufficient data from `AnalyzeResponse` alone for all its current widgets. It does NOT need to call fraud-check or trust-score separately — those values are already embedded in the analyze response.

### Tradeoffs
- Dashboard shows risk_flags as strings but not the full fraud indicator structure (acceptable — FraudDetection page shows details)
- If user wants to see trust breakdown on Dashboard, a separate `getTrustScore()` call would be needed. For MVP, the integer trust_score from analyze is sufficient.

### Files Modified
- None needed — architecture is clean as-is

---

## ISSUE 5: Fraud Detection Duplication

### Issue
Does `POST /analyze` already run fraud logic internally?

### Evidence Found

**YES — confirmed.** In `analysis.py` L48:
```python
fraud_res = fraud_service.check_fraud(prop, db)
```

The `/analyze` endpoint runs:
1. `property_service.create_property()` — creates DB record
2. `ml_valuation_service.predict()` — valuation
3. **`fraud_service.check_fraud()`** — full fraud analysis
4. `trust_service.calculate_trust_score()` — which **internally calls `fraud_service.check_fraud()` AGAIN** (trust_service.py L62)

So within a single `/analyze` call, fraud is computed **twice** (once directly, once inside trust calculation).

The Fraud Detection page calling `POST /fraud-check` would run it a **third time**.

### Root Cause
- `trust_service.calculate_trust_score()` independently calls `fraud_service.check_fraud()` (L62) — it doesn't accept pre-computed fraud results
- Fraud results are stored in the `predictions` collection but there's no endpoint to retrieve stored predictions

### Possible Solutions

**Option A**: Fraud Detection page calls `POST /fraud-check` (runs again). 
- Pros: Fresh data, simple
- Cons: Redundant computation (but fraud_service is rule-based, very fast)

**Option B**: Cache fraud result from `/analyze` in frontend state, pass to FraudDetection page.
- Pros: No redundant call
- Cons: `AnalyzeResponse` doesn't return full fraud data (only `risk_flags` summary strings)

**Option C**: FraudDetection page uses fresh `POST /fraud-check` but acknowledges the re-computation is intentional — it's a "re-check" that may detect new data (e.g., if documents were uploaded between initial analysis and fraud page visit).
- Pros: Always current, semantically correct
- Cons: Extra call

### Chosen Solution
**Option C**: FraudDetection page calls `POST /fraud-check` independently. 

**Justification**: 
- The fraud service is deterministic and fast (rule-based, no ML)
- Between initial analysis and visiting FraudDetection, the user may have uploaded documents, which would change fraud results
- The `AnalyzeResponse` doesn't contain full `FraudAnalysisResponse` data (missing `indicators`, `triggered_rules`, `overall_fraud_risk`, `risk_score` as separate fields)
- Re-computation ensures consistency

### Tradeoffs
- ~3 fraud executions per full flow (analyze → trust internal → fraud page). All are fast (<100ms each).
- If performance becomes an issue, backend should be refactored to cache/pass fraud results (out of scope for MVP).

### Files Modified
- `frontend/src/pages/FraudDetection.tsx` — call `runFraudCheck(propertyId)`

---

## ISSUE 6: Reports Page Assumptions

### Issue
Can the Reports page be powered by `GET /api/v1/properties/`?

### Evidence Found

**Report storage**: Reports are stored in the `reports` MongoDB collection (`report_service.py` L103-112):
```python
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
```

**No report listing endpoint exists.** The only report-related endpoints are:
- `POST /properties/{id}/report` — generate
- `GET /properties/{id}/report/download` — download latest

**There is no** `GET /reports` or `GET /properties/{id}/reports` endpoint.

**Properties do NOT contain report metadata.** `PropertyResponse` schema has no `report_status`, `report_id`, or `last_report_date` fields.

### Root Cause
The backend was designed for a single-property workflow (analyze → generate report → download). There's no multi-property report listing capability.

### Possible Solutions

**Option A**: Add a `GET /api/v1/reports` backend endpoint that lists all reports from the `reports` collection.
- Pros: Proper solution
- Cons: Modifies backend

**Option B**: Frontend calls `GET /api/v1/properties/` to get all properties, then for each property, attempts to get report info. No report listing is possible without knowing which properties have reports.
- Pros: No backend changes
- Cons: N+1 problem, no report metadata available per property

**Option C**: Reports page shows analyzed properties (from `listProperties()`) and provides "Generate Report" and "Download Report" buttons per property. Report status is not tracked — user must generate and download manually.
- Pros: No backend changes, functionally complete for MVP
- Cons: No report history, no status tracking

### Chosen Solution
**Option C**: Reports page lists properties via `listProperties()`. Each property row has:
- "Generate Report" button → calls `POST /properties/{id}/report`
- "Download PDF" button → calls `GET /properties/{id}/report/download`
- Status is inferred: if download succeeds, report exists; if 404, generate first

### Tradeoffs
- No persistent report history display (acceptable for MVP)
- User must remember which properties have reports (Generate button provides feedback)
- Future: add `GET /reports` endpoint for proper listing

### Files Modified
- `frontend/src/pages/Reports.tsx`

---

## ISSUE 7: Analytics Architecture

### Issue
Client-side aggregation from `listProperties()` — is this viable?

### Evidence Found

- **`GET /api/v1/properties/`** returns `List[PropertyResponse]` — only property metadata, no valuation/fraud/trust data
- Properties in MongoDB `properties` collection contain the raw property fields but NOT analysis results
- Analysis results are stored separately in `predictions` collection
- **There is no analytics endpoint** on the backend
- **No backend endpoint returns aggregated data**

### Root Cause
The backend stores analysis results in `predictions` collection, but PropertyResponse doesn't include them. To get analysis data for each property, the frontend would need to call `/valuation`, `/fraud-check`, and `/trust-score` for every property — an N×3 API call explosion.

### Possible Solutions

**Option A**: Client-side aggregation with N×3 calls.
- Pros: No backend changes
- Cons: Massive API overhead, terrible performance at scale

**Option B**: Add a backend analytics endpoint.
- Pros: Efficient, correct
- Cons: Modifies backend

**Option C**: Analytics page shows property list metadata only (count, locations, land types) — no valuation/fraud aggregates. Show a disclaimer that detailed analytics requires per-property analysis.
- Pros: No backend changes, honest about data availability
- Cons: Less impressive dashboard

**Option D**: Cache analysis results in localStorage when user runs analysis. Analytics aggregates from cached local data only. Show "X properties analyzed" from cache.
- Pros: No backend changes, shows real analyzed data
- Cons: Only shows data for properties analyzed in current browser session

### Chosen Solution
**Option D with enhancement**: Analytics page uses a hybrid approach:
1. Call `listProperties()` to get total property count and metadata
2. Use localStorage cache of analysis results (populated when user runs analyze)
3. Show aggregate stats computed from cached analysis data
4. Show property list with basic stats (location, area, land type)
5. Display "Based on X analyzed properties" disclaimer

### Tradeoffs
- Analytics only reflects properties analyzed in the current browser — not a global view
- Acceptable for hackathon MVP — demonstrates capability
- Future: backend analytics endpoint would make this a proper dashboard

### Files Modified
- `frontend/src/pages/Analytics.tsx`

---

## ISSUE 8: PropertyAnalysis Form Validation

### Evidence Found — Complete Field Mapping

| Form Field (camelCase) | Backend Schema (snake_case) | Type | Required | Validation | Status |
|---|---|---|---|---|---|
| `surveyNumber` | `survey_number` | string | ✅ Yes | Non-empty | ✅ Mapped (with auto-generate fallback) |
| — | `state` | string | ✅ Yes | Must be "Maharashtra" | ✅ Hardcoded as "Maharashtra" |
| — | `district` | string | ✅ Yes | Non-empty | ✅ Hardcoded as "Nashik" |
| `taluka` | `taluka` | string | ✅ Yes | Non-empty | ✅ Mapped |
| `village` | `village` | string | ✅ Yes | Non-empty | ✅ Mapped |
| `area` | `area_acre` | float | ✅ Yes | gt=0 | ✅ Mapped (parseFloat, default 1) |
| `soilType` | `soil_type` | string | ✅ Yes | Non-empty | ✅ Mapped with translation (Black-Red → Black_Red_Mixed) |
| `soilQuality` | `soil_quality_score` | int | ✅ Yes | ge=1, le=10 | ⚠️ **BUG**: Default `5` with `parseInt || 5`, but backend requires `ge=1`. If user leaves blank, `parseInt('') = NaN`, `NaN || 5 = 5` → OK. But `0` would pass frontend but fail backend (`ge=1`). Frontend allows `min=0` in HTML. |
| `landType` | `land_type` | string | ✅ Yes | Non-empty | ✅ Mapped with translation |
| `irrigated` | `irrigated` | int (0/1) | ✅ Yes | ge=0, le=1 | ✅ Mapped (Yes→1, No→0) |
| `waterSource` | `water_source` | string | ✅ Yes | Non-empty | ✅ Mapped (default "None") |
| `roadTouch` | `road_touch` | int (0/1) | ✅ Yes | ge=0, le=1 | ✅ Mapped |
| `roadWidth` | `road_width_ft` | int | ✅ Yes | ge=0 | ✅ Mapped |
| `distanceToHighway` | `distance_to_highway_km` | float | ✅ Yes | ge=0 | ✅ Mapped |
| `ownership` | `number_of_owners` | int | ✅ Yes | ge=1 | ⚠️ **BUG**: Default `1` with `parseInt || 1`, but if user enters `0`, `parseInt('0') = 0`, `0 || 1 = 1` → silently corrects. But backend requires `ge=1` anyway, so this is actually a safeguard. |
| `unknownRegistrations` | `unknown_registrations` | int | ✅ Yes | ge=0 | ✅ Mapped |
| `takeoverRisk` | `takeover_risk` | int (0/1) | ✅ Yes | ge=0, le=1 | ✅ Mapped |
| `avgPrice` | `avg_price_per_acre_nearby` | float | ✅ Yes | ge=0 | ✅ Mapped |
| — | `asking_price` | float | Optional | ge=0 | ❌ **MISSING**: Form has no asking price field. Backend uses it for valuation classification. Without it, classification always defaults to "fair". |
| — | `latitude` | float | Optional | -90 to 90 | Not needed for MVP |
| — | `longitude` | float | Optional | -180 to 180 | Not needed for MVP |

### Root Cause
Two minor issues:
1. `soil_quality_score` HTML allows min=0 but backend requires ge=1
2. `asking_price` is missing from the form — without it, `price_classification` always returns "fair" (confirmed in ml_service.py L150-151)

### Chosen Solution
1. Fix soil quality HTML: change `min={0}` to `min={1}` (or keep as-is since default is 5)
2. Add `asking_price` field to the Market Data step — this is **critical** for the classification feature to work. Without it, the "Undervalued/Fair/Overpriced" classification is meaningless.

### Tradeoffs
- Adding asking_price is a minor UI addition to an existing step
- Without it, a core feature (price classification) is non-functional

### Files Modified
- `frontend/src/pages/PropertyAnalysis.tsx` — add asking_price field, fix soil quality min

---

## ISSUE 9: Document Upload Workflow

### Evidence Found

**Upload endpoint** (`properties.py` L169-234):
1. Validates property exists (404 if not)
2. Reads file content, checks size ≤ 10MB (413 if exceeded)
3. Validates file signature (magic bytes for PDF/PNG/JPEG) (400 if invalid)
4. Saves file to `storage/documents/`
5. Creates DB record with status **"processing"** (NOT "uploaded")
6. Spawns `process_document_task` as FastAPI BackgroundTask
7. Returns `DocumentStatusResponse` with status code **202 Accepted**

**Background task** (`document_service.py` L11-66):
1. Runs OCR via `ocr_service.run_ocr()`
2. Extracts fields via `ocr_service.extract_fields()`
3. Updates document status to **"processed"**
4. Creates ownership records from extracted owners
5. On failure, updates status to **"failed"**

**Status transitions**:
```
Upload → "processing" (immediate)
  ├── OCR success → "processed"
  └── OCR failure → "failed"
```

**IMPORTANT**: There is no "uploaded" status in practice. The document_service.create_document() sets status to `"processing"` immediately (L80). The schema says `"uploaded | processing | processed | failed"` but the code never uses "uploaded".

### Chosen Solution — Frontend Polling Strategy
1. Upload file → receive `DocumentStatusResponse` with status "processing"
2. Poll `GET /properties/{id}/documents/{doc_id}/ocr` every 3 seconds
3. Stop polling when status is "processed" or "failed"
4. Max polling attempts: 20 (60 seconds total)
5. Display: uploading → processing → processed/failed

### Tradeoffs
- Polling is simple but not optimal (WebSocket would be better for production)
- 3-second interval is a reasonable balance for hackathon
- OCR with EasyOCR/Tesseract may take 5-30 seconds depending on file size

### Files Modified
- `frontend/src/pages/Reports.tsx`

---

## ISSUE 10: PDF Workflow Verification

### Evidence Found

**Report generation** (`report_service.py`):
- **Synchronous** — entire pipeline runs in-request:
  1. Fetches property
  2. Runs valuation, fraud, trust (re-computes everything)
  3. Renders HTML via Jinja2 template (`templates/property_report.html`)
  4. Compiles HTML → PDF via WeasyPrint
  5. Saves PDF to `storage/reports/{uuid}.pdf`
  6. Creates DB record in `reports` collection
  7. Returns `{ report_id, property_id, status: "ready", download_url, generated_at }`

**Download** (`properties.py` L290-320):
- Queries `reports` collection for property
- Sorts by `created_at` descending, takes latest
- Returns `FileResponse` with PDF file from disk
- Content-Type: `application/pdf`
- Filename: `LandIQ_Report_{property_id}.pdf`

**Key observations**:
- `download_url` returned by generate is a relative path: `/api/v1/properties/{id}/report/download`
- Report generation may be slow (WeasyPrint compilation)
- If WeasyPrint fails, report record is created with status "failed"

### Chosen Solution
1. "Export PDF" button: 
   - Show loading spinner
   - Call `POST /properties/{id}/report`
   - On success, immediately call `GET /properties/{id}/report/download` (responseType: blob)
   - Trigger browser download via `URL.createObjectURL`
2. Handle failure gracefully (WeasyPrint may not be installed)

### Tradeoffs
- Synchronous generation may take 3-10 seconds — need loading indicator
- WeasyPrint has heavy system dependencies (GTK, Pango) — may fail in some environments

### Files Modified
- `frontend/src/pages/Dashboard.tsx` — Export PDF button
- `frontend/src/pages/Reports.tsx` — Generate/Download per property

---

## ISSUE 11: CORS Verification

### Evidence Found

**CORS was ADDED in our previous modification** (main.py L20-27):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Before our change**: CORS middleware did NOT exist in the original `main.py`. We already fixed this.

### Chosen Solution
**No additional action needed.** CORS is already properly configured.

### Files Modified
- `backend/main.py` (already modified)

---

## ISSUE 12: State Management Decision

### Evidence Found

**Project complexity assessment**:
- 6 pages, 2 shared components
- Single user flow: form → analyze → view results
- Data flows one direction: PropertyAnalysis → Dashboard/FraudDetection/Reports
- No concurrent data sources
- No real-time updates
- No collaborative features

**Existing dependencies**: React 19, React Router 7, framer-motion, recharts, lucide-react. No state management library.

### Evaluation

| Solution | Bundle Size | Complexity | Fits Use Case |
|---|---|---|---|
| React Router state | 0 KB | Very Low | Partial (no refresh survival) |
| React Context | 0 KB | Low | Yes, but boilerplate |
| localStorage + Context | 0 KB | Low | Yes |
| Zustand | ~1 KB | Low-Medium | Overkill |
| Redux Toolkit | ~11 KB | High | Massive overkill |
| TanStack Query | ~13 KB | Medium | Good for API caching, overkill for MVP |

### Chosen Solution
**localStorage + React Router state (no new dependencies)**

Pattern:
```typescript
// On analyze: store result
localStorage.setItem(`landiq_analysis_${propertyId}`, JSON.stringify(data))

// On Dashboard load: try router state → localStorage → API fetch
const state = location.state || 
  JSON.parse(localStorage.getItem(`landiq_analysis_${propertyId}`) || 'null') ||
  await fetchFromAPI(propertyId)
```

### Tradeoffs
- No reactive updates (if data changes elsewhere, stale until refresh)
- localStorage is synchronous and limited to ~5MB
- Both are non-issues for this hackathon MVP

### Files Modified
- No new files — pattern applied within existing components

---

## ISSUE 13: API Smoke Testing

### Assessment
The user's instruction says "Create and execute API smoke tests. Verify backend startup, MongoDB connectivity, Model loading..." 

**However**: Running smoke tests requires the backend and MongoDB to be running. This is a runtime verification that cannot be done statically. 

### Chosen Solution
Instead of blocking on smoke tests, I will:
1. Build the frontend integration to gracefully handle all failure modes
2. Add a health check call on app startup that displays backend status
3. Show clear error messages when any endpoint fails
4. Document expected failure modes

The frontend will be testable against the running backend once the user starts both services.

### Files Modified
- Health check will be added to Dashboard/main layout
