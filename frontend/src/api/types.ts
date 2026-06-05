// =====================================================
// LandIQ AI — API Type Definitions
// Mirrors backend Pydantic schemas exactly.
// Source of truth: backend/app/schemas/
// =====================================================

// --- Health ---
export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    database: string;
    ocr_engine: string;
    valuation_model: string;
  };
}

// --- Property ---
export interface PropertyCreate {
  survey_number: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  area_acre: number;
  soil_type: string;
  soil_quality_score: number;
  land_type: string;
  irrigated: number; // 0 or 1
  road_touch: number; // 0 or 1
  road_width_ft: number;
  distance_to_highway_km: number;
  water_source: string;
  number_of_owners: number;
  unknown_registrations: number;
  takeover_risk: number; // 0 or 1
  avg_price_per_acre_nearby: number;
  asking_price?: number;
  latitude?: number;
  longitude?: number;
}

export interface PropertyCreateResponse {
  id: string;
  survey_number: string;
  status: string;
  created_at: string;
}

export interface PropertyResponse {
  id: string;
  survey_number: string;
  state: string;
  district: string;
  taluka: string;
  village: string;
  area_acre: number;
  soil_type: string;
  soil_quality_score: number;
  land_type: string;
  irrigated: number;
  road_touch: number;
  road_width_ft: number;
  distance_to_highway_km: number;
  water_source: string;
  number_of_owners: number;
  unknown_registrations: number;
  takeover_risk: number;
  avg_price_per_acre_nearby: number;
  asking_price?: number;
  latitude?: number;
  longitude?: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

// --- Analyze (combined endpoint) ---
export interface AnalyzeResponse {
  property_id: string;
  predicted_value_inr: number;
  price_classification: string;
  confidence_score: number;
  risk_flags: string[];
  trust_score: number;
  summary: string;
}

// --- Valuation ---
export interface ValuationResponse {
  property_id: string;
  estimated_market_value_inr: number;
  price_per_acre_inr: number;
  valuation_classification: string;
  confidence_score: number;
  model_version: string;
}

// --- Fraud ---
export interface FraudIndicator {
  name: string;
  status: string; // "clear" | "warning" | "high_risk"
  description: string;
}

export interface FraudAnalysisResponse {
  property_id: string;
  overall_fraud_risk: string; // "low" | "medium" | "high"
  risk_score: number; // 0-100
  triggered_rules: string[];
  indicators: FraudIndicator[];
}

// --- Trust Score ---
export interface TrustScoreResponse {
  property_id: string;
  trust_score: number; // 0-100
  rating_classification: string;
  breakdown: Record<string, number>;
}

// --- Document ---
export interface DocumentStatusResponse {
  document_id: string;
  property_id: string;
  file_name: string;
  file_type: string;
  status: string; // "uploaded" | "processing" | "processed" | "failed"
  uploaded_at: string;
}

// --- OCR ---
export interface OCRExtractionResponse {
  document_id: string;
  status: string;
  ocr_confidence: number;
  file_type: string;
  extracted_fields: Record<string, any>;
}

// --- Report ---
export interface ReportGenerationResponse {
  report_id: string;
  property_id: string;
  status: string;
  download_url: string;
  generated_at: string;
}

// --- API Error ---
export interface APIError {
  detail: string;
}
