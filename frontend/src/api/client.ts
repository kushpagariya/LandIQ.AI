// =====================================================
// LandIQ AI — Axios Client Instance
// Central HTTP client with interceptors, timeout,
// and base URL from environment variable.
// =====================================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — can add auth tokens here in future
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor — normalize error shape
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const detail =
        error.response.data?.detail || error.response.statusText || 'An error occurred';
      return Promise.reject(new Error(detail));
    } else if (error.request) {
      // No response received
      return Promise.reject(
        new Error('Unable to reach the server. Please check if the backend is running.')
      );
    } else {
      return Promise.reject(new Error(error.message));
    }
  }
);

export default apiClient;
