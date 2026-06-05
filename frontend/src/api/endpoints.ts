// =====================================================
// LandIQ AI — API Endpoint Functions
// Typed wrappers around every backend endpoint.
// =====================================================

import apiClient from './client';
import type {
  PropertyCreate,
  PropertyCreateResponse,
  PropertyResponse,
  AnalyzeResponse,
  ValuationResponse,
  FraudAnalysisResponse,
  TrustScoreResponse,
  DocumentStatusResponse,
  OCRExtractionResponse,
  ReportGenerationResponse,
  HealthResponse,
} from './types';

const API_PREFIX = '/api/v1';

// --- Health ---
export async function checkHealth(): Promise<HealthResponse> {
  const res = await apiClient.get<HealthResponse>('/health');
  return res.data;
}

// --- Analysis (combined endpoint) ---
export async function analyzeProperty(data: PropertyCreate): Promise<AnalyzeResponse> {
  const res = await apiClient.post<AnalyzeResponse>(`${API_PREFIX}/analyze`, data);
  return res.data;
}

// --- Properties ---
export async function createProperty(data: PropertyCreate): Promise<PropertyCreateResponse> {
  const res = await apiClient.post<PropertyCreateResponse>(`${API_PREFIX}/properties/`, data);
  return res.data;
}

export async function getProperty(propertyId: string): Promise<PropertyResponse> {
  const res = await apiClient.get<PropertyResponse>(`${API_PREFIX}/properties/${propertyId}`);
  return res.data;
}

export async function listProperties(): Promise<PropertyResponse[]> {
  const res = await apiClient.get<PropertyResponse[]>(`${API_PREFIX}/properties/`);
  return res.data;
}

// --- Valuation ---
export async function calculateValuation(propertyId: string): Promise<ValuationResponse> {
  const res = await apiClient.post<ValuationResponse>(
    `${API_PREFIX}/properties/${propertyId}/valuation`
  );
  return res.data;
}

// --- Fraud ---
export async function runFraudCheck(propertyId: string): Promise<FraudAnalysisResponse> {
  const res = await apiClient.post<FraudAnalysisResponse>(
    `${API_PREFIX}/properties/${propertyId}/fraud-check`
  );
  return res.data;
}

// --- Trust Score ---
export async function getTrustScore(propertyId: string): Promise<TrustScoreResponse> {
  const res = await apiClient.get<TrustScoreResponse>(
    `${API_PREFIX}/properties/${propertyId}/trust-score`
  );
  return res.data;
}

// --- Document Upload ---
export async function uploadDocument(
  propertyId: string,
  file: File,
  fileType: string
): Promise<DocumentStatusResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('file_type', fileType);

  const res = await apiClient.post<DocumentStatusResponse>(
    `${API_PREFIX}/properties/${propertyId}/documents`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return res.data;
}

// --- OCR Status ---
export async function getOCRStatus(
  propertyId: string,
  documentId: string
): Promise<OCRExtractionResponse> {
  const res = await apiClient.get<OCRExtractionResponse>(
    `${API_PREFIX}/properties/${propertyId}/documents/${documentId}/ocr`
  );
  return res.data;
}

// --- Report ---
export async function generateReport(propertyId: string): Promise<ReportGenerationResponse> {
  const res = await apiClient.post<ReportGenerationResponse>(
    `${API_PREFIX}/properties/${propertyId}/report`
  );
  return res.data;
}

export async function downloadReport(propertyId: string): Promise<Blob> {
  const res = await apiClient.get(`${API_PREFIX}/properties/${propertyId}/report/download`, {
    responseType: 'blob',
  });
  return res.data;
}

// --- Utility: trigger browser file download from blob ---
export function triggerDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
