# LandIQ AI — Integration Plan (Revised)

> Updated after plan review resolution. All decisions verified against actual code.

---

## Architecture Decisions (Resolved)

### 1. State Management
**localStorage + React Router state** — no new dependencies.
- Primary flow: router state (fast)
- Refresh survival: localStorage cache keyed by property_id
- Direct URL access: API fallback via `GET /properties/{id}`

### 2. Dashboard Data Source
**AnalyzeResponse + PropertyCreate payload**:
- All dashboard widgets populated from `AnalyzeResponse` (7 fields)
- `price_per_acre` derived client-side: `predicted_value_inr / area_acre`
- `area_acre` carried forward from form submission

### 3. Fraud Detection
**Independent `POST /fraud-check` call** per visit to FraudDetection page.
- `/analyze` runs fraud internally but only exposes summary `risk_flags`
- FraudDetection page needs full `FraudAnalysisResponse` (indicators, triggered_rules)
- Re-computation is intentional — may reflect newly uploaded documents

### 4. Reports Page
**Property-centric** — no report listing endpoint exists.
- List properties via `GET /properties/`
- Per-property: "Generate Report" + "Download PDF" buttons
- No report history tracking (acceptable for MVP)

### 5. Analytics
**Hybrid client-side** — aggregate from localStorage cache + property list.
- `listProperties()` for property count/metadata
- Analysis results cached in localStorage during analyze flow
- Stats derived from cached data with "based on X analyzed properties" disclaimer

### 6. Form Fix
- Add `asking_price` field (required for price classification to work)
- Fix `soil_quality_score` min to 1 (backend validates ge=1)

### 7. CORS
Already applied. No further action.

---

## Verified Endpoint Contract

| # | Endpoint | Method | Status Code | Request | Response |
|---|---|---|---|---|---|
| 1 | `/health` | GET | 200 | — | `HealthResponse` |
| 2 | `/api/v1/analyze` | POST | 200/500 | `PropertyCreate` | `AnalyzeResponse` |
| 3 | `/api/v1/properties/` | POST | 201/500 | `PropertyCreate` | `PropertyCreateResponse` |
| 4 | `/api/v1/properties/` | GET | 200/500 | — | `PropertyResponse[]` |
| 5 | `/api/v1/properties/{id}` | GET | 200/404 | — | `PropertyResponse` |
| 6 | `/api/v1/properties/{id}/valuation` | POST | 200/404/500 | — | `ValuationResponse` |
| 7 | `/api/v1/properties/{id}/fraud-check` | POST | 200/404/500 | — | `FraudAnalysisResponse` |
| 8 | `/api/v1/properties/{id}/trust-score` | GET | 200/404/500 | — | `TrustScoreResponse` |
| 9 | `/api/v1/properties/{id}/documents` | POST | 202/400/404/413 | multipart (file + file_type) | `DocumentStatusResponse` |
| 10 | `/api/v1/properties/{id}/documents/{doc_id}/ocr` | GET | 200/404 | — | `OCRExtractionResponse` |
| 11 | `/api/v1/properties/{id}/report` | POST | 200/404/500 | — | `ReportGenerationResponse` |
| 12 | `/api/v1/properties/{id}/report/download` | GET | 200/404 | — | `FileResponse` (PDF blob) |
| 13 | `/api/v1/properties/{id}/verify-consistency` | POST | 200/404/500 | — | `OwnershipVerificationResponse` |

---

## Revised Execution Order

1. ~~CORS fix~~ ✅ Done
2. ~~API infrastructure~~ ✅ Done (types, client, endpoints)
3. Fix PropertyAnalysis form (add asking_price, fix soil min, fix form-to-schema)
4. Rewrite Dashboard (consume AnalyzeResponse + PropertyCreate, localStorage cache)
5. Rewrite FraudDetection (call fraud-check endpoint, display indicators)
6. Rewrite Reports (list properties, upload documents, generate/download reports, OCR polling)
7. Rewrite Analytics (hybrid aggregation from properties list + cached analysis)
8. Add error handling (loading skeletons, error states, retries) across all pages
9. Build verification
10. Generate all documentation reports

---

## Risks Updated

| Risk | Mitigation |
|---|---|
| WeasyPrint not installed on user's system | Report generation will 500 — show clear error in UI |
| EasyOCR/Tesseract not available | OCR falls back to simulated text (already in backend) |
| MongoDB not running | Health check on startup, error states in all pages |
| ML model files missing | Backend logs error, analyze endpoint will 500 |
| `asking_price` not provided | Classification defaults to "fair" — user should be encouraged to provide it |
| localStorage data can be stale | Acceptable for MVP — data refreshes on new analysis |
