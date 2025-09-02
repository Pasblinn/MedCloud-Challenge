import axios from 'axios';
import { toast } from 'react-toastify';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 seconds

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const endTime = new Date();
    const duration = endTime.getTime() - response.config.metadata.startTime.getTime();

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, response.data);
    }

    return response;
  },
  (error) => {
    // Calculate request duration if possible
    const duration = error.config?.metadata ? 
      new Date().getTime() - error.config.metadata.startTime.getTime() : 0;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, error.response?.data || error.message);
    }

    // Handle different error types
    const errorResponse = error.response;
    const errorMessage = errorResponse?.data?.message || error.message || 'Something went wrong';

    switch (errorResponse?.status) {
      case 400:
        toast.error(`Bad Request: ${errorMessage}`);
        break;
      case 401:
        toast.error('Unauthorized. Please login again.');
        // Clear token and redirect to login
        localStorage.removeItem('authToken');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('Access denied. You do not have permission.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 409:
        toast.error(`Conflict: ${errorMessage}`);
        break;
      case 422:
        // Validation errors - don't show toast, let components handle it
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Internal server error. Please try again.');
        break;
      case 503:
        toast.error('Service temporarily unavailable.');
        break;
      default:
        if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
          toast.error('Network error. Check your connection.');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please try again.');
        } else {
          toast.error(`Error: ${errorMessage}`);
        }
    }

    return Promise.reject(error);
  }
);

// API Methods
const apiService = {
  // Generic methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // Health check
  healthCheck: () => api.get('/health'),

  // Authentication
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post('/auth/reset-password', { token, password })
  },

  // Patients
  patients: {
    // Get all patients with optional filters
    getAll: (params = {}) => {
      // Filter out empty string parameters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([key, value]) => 
          value !== '' && value !== null && value !== undefined
        )
      );
      return api.get('/patients', { params: cleanParams });
    },
    
    // Get patient by ID
    getById: (id) => api.get(`/patients/${id}`),
    
    // Create new patient
    create: (patientData) => api.post('/patients', patientData),
    
    // Update patient
    update: (id, patientData) => api.put(`/patients/${id}`, patientData),
    
    // Partial update patient
    partialUpdate: (id, patientData) => api.patch(`/patients/${id}`, patientData),
    
    // Delete patient
    delete: (id) => api.delete(`/patients/${id}`),
    
    // Search patients
    search: (query, params = {}) => api.get('/patients/search', { 
      params: { q: query, ...params } 
    }),
    
    // Get patients by age range
    getByAgeRange: (minAge, maxAge, params = {}) => api.get('/patients/age-range', {
      params: { minAge, maxAge, ...params }
    }),
    
    // Get patient statistics
    getStats: () => api.get('/patients/stats'),
    
    // Export patients
    export: (format = 'json') => api.get('/patients/export', {
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    }),
    
    // Bulk create patients
    bulkCreate: (patientsData) => api.post('/patients/bulk', { patients: patientsData }),
    
    // Service health
    healthCheck: () => api.get('/patients/health')
  }
};

// Utility functions
export const apiUtils = {
  // Check if API is available
  isAvailable: async () => {
    try {
      await apiService.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Get base URL
  getBaseUrl: () => API_BASE_URL,

  // Format error message
  formatError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return error.code === 'NETWORK_ERROR' || 
           error.message === 'Network Error' ||
           error.code === 'ECONNABORTED';
  },

  // Check if error is validation related
  isValidationError: (error) => {
    return error.response?.status === 400 && 
           error.response?.data?.details;
  },

  // Get validation errors
  getValidationErrors: (error) => {
    if (apiUtils.isValidationError(error)) {
      return error.response.data.details;
    }
    return [];
  },

  // Retry failed request
  retry: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response?.status >= 400 && error.response?.status < 500) {
          throw error;
        }
        
        // Wait before retrying
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError;
  },

  // Cancel request
  createCancelToken: () => axios.CancelToken.source(),
  
  // Check if request was cancelled
  isCancel: axios.isCancel
};

// Export default api instance and service
export { api };
export default apiService;