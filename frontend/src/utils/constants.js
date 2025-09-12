/**
 * Application Constants
 */

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  };
  
  // Cache Configuration
  export const CACHE_CONFIG = {
    DEFAULT_TTL: 15 * 60 * 1000, // 15 minutes
    SHORT_TTL: 5 * 60 * 1000,    // 5 minutes
    LONG_TTL: 60 * 60 * 1000,    // 1 hour
    MAX_SIZE: 5 * 1024 * 1024,   // 5MB
    CLEANUP_INTERVAL: 60 * 60 * 1000 // 1 hour
  };
  
  // Pagination
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
  };
  
  // Patient Age Groups
  export const AGE_GROUPS = {
    MINOR: { min: 0, max: 17, label: 'Minor', color: 'info' },
    ADULT: { min: 18, max: 64, label: 'Adult', color: 'success' },
    SENIOR: { min: 65, max: 150, label: 'Senior', color: 'warning' }
  };
  
  // Form Validation
  export const VALIDATION = {
    NAME: {
      MIN_LENGTH: 2,
      MAX_LENGTH: 255,
      PATTERN: /^[a-zA-ZÀ-ÿ\s]+$/
    },
    EMAIL: {
      PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      MAX_LENGTH: 255
    },
    ADDRESS: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 500
    },
    BIRTH_DATE: {
      MIN_AGE: 0,
      MAX_AGE: 150
    }
  };
  
  // Toast Messages
  export const MESSAGES = {
    SUCCESS: {
      PATIENT_CREATED: 'Patient created successfully!',
      PATIENT_UPDATED: 'Patient updated successfully!',
      PATIENT_DELETED: 'Patient deleted successfully!',
      DATA_EXPORTED: 'Data exported successfully!',
      BULK_IMPORT_SUCCESS: 'All patients imported successfully!',
      CACHE_CLEARED: 'Cache cleared successfully!'
    },
    ERROR: {
      GENERIC: 'Something went wrong. Please try again.',
      NETWORK: 'Network error. Please check your connection.',
      TIMEOUT: 'Request timed out. Please try again.',
      VALIDATION: 'Please check the form for errors.',
      NOT_FOUND: 'Patient not found.',
      DUPLICATE_EMAIL: 'A patient with this email already exists.',
      DELETE_FAILED: 'Failed to delete patient.',
      EXPORT_FAILED: 'Failed to export data.',
      CACHE_ERROR: 'Cache operation failed.'
    },
    WARNING: {
      UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
      DELETE_CONFIRM: 'Are you sure you want to delete this patient? This action cannot be undone.',
      BULK_IMPORT_PARTIAL: 'Some patients could not be imported.',
      CACHE_FULL: 'Cache is full. Old data will be removed.'
    },
    INFO: {
      LOADING: 'Loading...',
      NO_DATA: 'No data available.',
      EMPTY_SEARCH: 'No patients match your search criteria.',
      OFFLINE: 'You are currently offline. Some features may not be available.',
      CACHE_MISS: 'Data loaded from server.',
      CACHE_HIT: 'Data loaded from cache.'
    }
  };
  
  // HTTP Status Codes
  export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  };
  
  // Date Formats
  export const DATE_FORMATS = {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    TIMESTAMP: 'YYYY-MM-DD HH:mm:ss',
    SHORT: 'DD/MM/YY',
    LONG: 'DD de MMMM de YYYY'
  };
  
  // Export Formats
  export const EXPORT_FORMATS = {
    JSON: 'json',
    CSV: 'csv',
    PDF: 'pdf',
    EXCEL: 'xlsx'
  };
  
  // Search Configuration
  export const SEARCH_CONFIG = {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300,
    MAX_RESULTS: 50
  };
  
  // Theme Configuration
  export const THEME_CONFIG = {
    MODES: {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto'
    },
    COLORS: {
      PRIMARY: '#1976d2',
      SECONDARY: '#dc004e',
      SUCCESS: '#2e7d32',
      WARNING: '#ed6c02',
      ERROR: '#d32f2f',
      INFO: '#0288d1'
    },
    BREAKPOINTS: {
      XS: 0,
      SM: 600,
      MD: 900,
      LG: 1200,
      XL: 1536
    }
  };
  
  // Local Storage Keys
  export const STORAGE_KEYS = {
    AUTH_TOKEN: 'authToken',
    USER_PREFERENCES: 'userPreferences',
    THEME_MODE: 'themeMode',
    SIDEBAR_STATE: 'sidebarState',
    LAST_SEARCH: 'lastSearch',
    FORM_DRAFT: 'formDraft'
  };
  
  // Route Paths
  export const ROUTES = {
    HOME: '/',
    PATIENTS: '/patients',
    PATIENT_DETAIL: '/patients/:id',
    PATIENT_CREATE: '/patients/new',
    PATIENT_EDIT: '/patients/:id/edit',
    STATISTICS: '/statistics',
    SETTINGS: '/settings',
    NOT_FOUND: '/404'
  };
  
  // Component States
  export const COMPONENT_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  };
  
  // Data Grid Configuration
  export const DATA_GRID_CONFIG = {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
    ROW_HEIGHT: 52,
    HEADER_HEIGHT: 56,
    CHECKBOX_SELECTION: true,
    DISABLE_SELECTION_ON_CLICK: false
  };
  
  // Animation Durations
  export const ANIMATIONS = {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
  };
  
  // File Upload Configuration
  export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: [
      'application/json',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    CHUNK_SIZE: 1024 * 1024 // 1MB chunks
  };
  
  // Form Field Names
  export const FORM_FIELDS = {
    PATIENT: {
      NAME: 'name',
      EMAIL: 'email',
      BIRTH_DATE: 'birthDate',
      ADDRESS: 'address'
    },
    SEARCH: {
      QUERY: 'query',
      MIN_AGE: 'minAge',
      MAX_AGE: 'maxAge',
      SORT_BY: 'sortBy',
      SORT_ORDER: 'sortOrder'
    }
  };
  
  // Sort Options
  export const SORT_OPTIONS = {
    NAME_ASC: { field: 'name', order: 'asc', label: 'Name (A-Z)' },
    NAME_DESC: { field: 'name', order: 'desc', label: 'Name (Z-A)' },
    AGE_ASC: { field: 'birthDate', order: 'desc', label: 'Age (Youngest)' },
    AGE_DESC: { field: 'birthDate', order: 'asc', label: 'Age (Oldest)' },
    EMAIL_ASC: { field: 'email', order: 'asc', label: 'Email (A-Z)' },
    EMAIL_DESC: { field: 'email', order: 'desc', label: 'Email (Z-A)' },
    CREATED_ASC: { field: 'createdAt', order: 'asc', label: 'Oldest First' },
    CREATED_DESC: { field: 'createdAt', order: 'desc', label: 'Newest First' }
  };
  
  // Filter Options
  export const FILTER_OPTIONS = {
    AGE_GROUPS: [
      { value: 'all', label: 'All Ages' },
      { value: 'minor', label: 'Minors (0-17)' },
      { value: 'adult', label: 'Adults (18-64)' },
      { value: 'senior', label: 'Seniors (65+)' }
    ]
  };
  
  // Statistics Configuration
  export const STATS_CONFIG = {
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
    CHART_COLORS: [
      '#1976d2', '#dc004e', '#2e7d32', '#ed6c02', 
      '#9c27b0', '#00796b', '#f57c00', '#5d4037'
    ]
  };
  
  // Error Codes
  export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DUPLICATE_EMAIL: 'EMAIL_ALREADY_EXISTS',
    NOT_FOUND: 'NOT_FOUND',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED'
  };
  
  // Feature Flags
  export const FEATURES = {
    BULK_IMPORT: true,
    EXPORT_PDF: true,
    DARK_MODE: true,
    OFFLINE_MODE: false,
    ADVANCED_SEARCH: true,
    STATISTICS: true,
    USER_MANAGEMENT: false
  };
  
  // Performance Configuration
  export const PERFORMANCE = {
    VIRTUAL_SCROLLING_THRESHOLD: 100,
    LAZY_LOADING_THRESHOLD: 50,
    IMAGE_LAZY_LOADING: true,
    DEBOUNCE_SEARCH: 300,
    THROTTLE_SCROLL: 100
  };
  
  export default {
    API_CONFIG,
    CACHE_CONFIG,
    PAGINATION,
    AGE_GROUPS,
    VALIDATION,
    MESSAGES,
    HTTP_STATUS,
    DATE_FORMATS,
    EXPORT_FORMATS,
    SEARCH_CONFIG,
    THEME_CONFIG,
    STORAGE_KEYS,
    ROUTES,
    COMPONENT_STATES,
    DATA_GRID_CONFIG,
    ANIMATIONS,
    FILE_UPLOAD,
    FORM_FIELDS,
    SORT_OPTIONS,
    FILTER_OPTIONS,
    STATS_CONFIG,
    ERROR_CODES,
    FEATURES,
    PERFORMANCE
  };