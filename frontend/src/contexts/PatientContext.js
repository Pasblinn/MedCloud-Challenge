import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import PatientService from '../services/patientService';

// Initial state
const initialState = {
  patients: [],
  currentPatient: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  },
  filters: {
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minAge: null,
    maxAge: null
  },
  statistics: null,
  lastUpdated: null
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PATIENTS: 'SET_PATIENTS',
  SET_CURRENT_PATIENT: 'SET_CURRENT_PATIENT',
  ADD_PATIENT: 'ADD_PATIENT',
  UPDATE_PATIENT: 'UPDATE_PATIENT',
  REMOVE_PATIENT: 'REMOVE_PATIENT',
  SET_PAGINATION: 'SET_PAGINATION',
  SET_FILTERS: 'SET_FILTERS',
  SET_STATISTICS: 'SET_STATISTICS',
  CLEAR_ERROR: 'CLEAR_ERROR',
  RESET_STATE: 'RESET_STATE'
};

// Reducer function
const patientReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case ActionTypes.SET_PATIENTS:
      return {
        ...state,
        patients: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString()
      };

    case ActionTypes.SET_CURRENT_PATIENT:
      return {
        ...state,
        currentPatient: action.payload,
        loading: false,
        error: null
      };

    case ActionTypes.ADD_PATIENT:
      return {
        ...state,
        patients: [action.payload, ...state.patients],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        },
        lastUpdated: new Date().toISOString()
      };

    case ActionTypes.UPDATE_PATIENT:
      return {
        ...state,
        patients: state.patients.map(patient =>
          patient.id === action.payload.id ? action.payload : patient
        ),
        currentPatient: state.currentPatient?.id === action.payload.id 
          ? action.payload 
          : state.currentPatient,
        lastUpdated: new Date().toISOString()
      };

    case ActionTypes.REMOVE_PATIENT:
      return {
        ...state,
        patients: state.patients.filter(patient => patient.id !== action.payload),
        currentPatient: state.currentPatient?.id === action.payload 
          ? null 
          : state.currentPatient,
        pagination: {
          ...state.pagination,
          total: Math.max(0, state.pagination.total - 1)
        },
        lastUpdated: new Date().toISOString()
      };

    case ActionTypes.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    case ActionTypes.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };

    case ActionTypes.SET_STATISTICS:
      return {
        ...state,
        statistics: action.payload
      };

    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    case ActionTypes.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Create context
const PatientContext = createContext();

// Custom hook to use patient context
export const usePatients = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};

// Provider component
export const PatientProvider = ({ children }) => {
  const [state, dispatch] = useReducer(patientReducer, initialState);

  // Action creators
  const actions = {
    setLoading: useCallback((loading) => {
      dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
    }, []),

    setError: useCallback((error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    }, []),

    clearError: useCallback(() => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    }, []),

    // Fetch patients
    fetchPatients: useCallback(async (params = {}) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        
        const queryParams = {
          page: state.pagination.page,
          limit: state.pagination.limit,
          search: state.filters.search,
          sortBy: state.filters.sortBy,
          sortOrder: state.filters.sortOrder,
          minAge: state.filters.minAge,
          maxAge: state.filters.maxAge,
          ...params
        };

        const response = await PatientService.getPatients(queryParams);
        
        dispatch({ type: ActionTypes.SET_PATIENTS, payload: response.data });
        dispatch({ type: ActionTypes.SET_PAGINATION, payload: response.pagination });
        
        return response;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, [state.pagination, state.filters]),

    // Fetch single patient
    fetchPatient: useCallback(async (id) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await PatientService.getPatientById(id);
        dispatch({ type: ActionTypes.SET_CURRENT_PATIENT, payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Create patient
    createPatient: useCallback(async (patientData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await PatientService.createPatient(patientData);
        dispatch({ type: ActionTypes.ADD_PATIENT, payload: response.data });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        return response.data;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Update patient
    updatePatient: useCallback(async (id, patientData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await PatientService.updatePatient(id, patientData);
        dispatch({ type: ActionTypes.UPDATE_PATIENT, payload: response.data });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        return response.data;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Delete patient
    deletePatient: useCallback(async (id) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        await PatientService.deletePatient(id);
        dispatch({ type: ActionTypes.REMOVE_PATIENT, payload: id });
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        return true;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Search patients
    searchPatients: useCallback(async (query, params = {}) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await PatientService.searchPatients(query, params);
        dispatch({ type: ActionTypes.SET_PATIENTS, payload: response.data.patients });
        dispatch({ type: ActionTypes.SET_PAGINATION, payload: response.data.pagination });
        return response.data;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Fetch statistics
    fetchStatistics: useCallback(async () => {
      try {
        const response = await PatientService.getStats();
        dispatch({ type: ActionTypes.SET_STATISTICS, payload: response.data });
        return response.data;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Export patients
    exportPatients: useCallback(async (format = 'json') => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        await PatientService.exportPatients(format);
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
        return true;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Bulk create patients
    bulkCreatePatients: useCallback(async (patientsData) => {
      try {
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        const response = await PatientService.bulkCreatePatients(patientsData);
        
        // Refresh patients list
        await actions.fetchPatients();
        
        return response.data;
      } catch (error) {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    }, []),

    // Update filters
    updateFilters: useCallback((newFilters) => {
      dispatch({ type: ActionTypes.SET_FILTERS, payload: newFilters });
    }, []),

    // Update pagination
    updatePagination: useCallback((newPagination) => {
      dispatch({ type: ActionTypes.SET_PAGINATION, payload: newPagination });
    }, []),

    // Clear current patient
    clearCurrentPatient: useCallback(() => {
      dispatch({ type: ActionTypes.SET_CURRENT_PATIENT, payload: null });
    }, []),

    // Reset state
    resetState: useCallback(() => {
      dispatch({ type: ActionTypes.RESET_STATE });
    }, [])
  };

  // Auto-load patients data when the context is mounted
  useEffect(() => {
    // Only fetch if we don't have patients yet and we're not already loading
    if (state.patients.length === 0 && !state.loading) {
      actions.fetchPatients().catch(error => {
        console.warn('Failed to auto-load patients:', error);
      });
    }
  }, []); // Run only once when the provider is mounted

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    ...actions,
    
    // Computed values
    hasPatients: state.patients.length > 0,
    isFirstPage: state.pagination.page === 1,
    isLastPage: !state.pagination.hasNext,
    totalPatients: state.pagination.total
  };

  return (
    <PatientContext.Provider value={contextValue}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;