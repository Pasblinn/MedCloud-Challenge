import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import PatientService from '../services/patientService';
import { usePatients as usePatientContext } from '../contexts/PatientContext';

// Query keys
const QUERY_KEYS = {
  PATIENTS: 'patients',
  PATIENT: 'patient',
  STATS: 'patient-stats',
  SEARCH: 'patient-search'
};

// Custom hook for patient operations
export const usePatients = (params = {}) => {
  const queryClient = useQueryClient();
  const context = usePatientContext();

  // Get patients query
  const patientsQuery = useQuery({
    queryKey: [QUERY_KEYS.PATIENTS, params],
    queryFn: () => PatientService.getPatients(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSuccess: (data) => {
      context.updatePagination(data.pagination);
    },
    onError: (error) => {
      toast.error(`Failed to fetch patients: ${error.message}`);
    }
  });

  // Get single patient query
  const usePatient = (id) => {
    return useQuery({
      queryKey: [QUERY_KEYS.PATIENT, id],
      queryFn: () => PatientService.getPatientById(id),
      enabled: !!id,
      staleTime: 10 * 60 * 1000, // 10 minutes
      onError: (error) => {
        toast.error(`Failed to fetch patient: ${error.message}`);
      }
    });
  };

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: PatientService.createPatient,
    onSuccess: (data) => {
      // Invalidate and refetch patients
      queryClient.invalidateQueries([QUERY_KEYS.PATIENTS]);
      queryClient.invalidateQueries([QUERY_KEYS.STATS]);
      
      toast.success('Patient created successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to create patient: ${error.message}`);
    }
  });

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }) => PatientService.updatePatient(id, data),
    onSuccess: (data, variables) => {
      // Update cached data
      queryClient.setQueryData([QUERY_KEYS.PATIENT, variables.id], data);
      queryClient.invalidateQueries([QUERY_KEYS.PATIENTS]);
      queryClient.invalidateQueries([QUERY_KEYS.STATS]);
      
      toast.success('Patient updated successfully!');
      return data;
    },
    onError: (error) => {
      toast.error(`Failed to update patient: ${error.message}`);
    }
  });

  // Delete patient mutation
  const deletePatientMutation = useMutation({
    mutationFn: PatientService.deletePatient,
    onSuccess: (_, patientId) => {
      // Remove from cache
      queryClient.removeQueries([QUERY_KEYS.PATIENT, patientId]);
      queryClient.invalidateQueries([QUERY_KEYS.PATIENTS]);
      queryClient.invalidateQueries([QUERY_KEYS.STATS]);
      
      toast.success('Patient deleted successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to delete patient: ${error.message}`);
    }
  });

  // Search patients
  const useSearchPatients = (query, searchParams = {}) => {
    return useQuery({
      queryKey: [QUERY_KEYS.SEARCH, query, searchParams],
      queryFn: () => PatientService.searchPatients(query, searchParams),
      enabled: !!query && query.length >= 2,
      keepPreviousData: true,
      staleTime: 2 * 60 * 1000, // 2 minutes
      onError: (error) => {
        toast.error(`Search failed: ${error.message}`);
      }
    });
  };

  // Bulk create mutation
  const bulkCreateMutation = useMutation({
    mutationFn: PatientService.bulkCreatePatients,
    onSuccess: (result) => {
      queryClient.invalidateQueries([QUERY_KEYS.PATIENTS]);
      queryClient.invalidateQueries([QUERY_KEYS.STATS]);
      
      const { created, failed, total } = result;
      if (failed === 0) {
        toast.success(`All ${created} patients created successfully!`);
      } else {
        toast.warning(`${created} patients created, ${failed} failed out of ${total}.`);
      }
      
      return result;
    },
    onError: (error) => {
      toast.error(`Bulk create failed: ${error.message}`);
    }
  });

  // Export patients
  const exportPatients = async (format = 'json') => {
    try {
      await PatientService.exportPatients(format);
      toast.success(`Patients exported successfully (${format.toUpperCase()})`);
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  return {
    // Queries
    patients: patientsQuery.data?.data?.patients || [],
    pagination: patientsQuery.data?.data?.pagination || {},
    isLoading: patientsQuery.isLoading,
    isError: patientsQuery.isError,
    error: patientsQuery.error,
    refetch: patientsQuery.refetch,
    
    // Single patient
    usePatient,
    
    // Mutations
    createPatient: createPatientMutation.mutate,
    updatePatient: updatePatientMutation.mutate,
    deletePatient: deletePatientMutation.mutate,
    bulkCreate: bulkCreateMutation.mutate,
    
    // Mutation states
    isCreating: createPatientMutation.isLoading,
    isUpdating: updatePatientMutation.isLoading,
    isDeleting: deletePatientMutation.isLoading,
    isBulkCreating: bulkCreateMutation.isLoading,
    
    // Search
    useSearchPatients,
    
    // Other operations
    exportPatients,
    
    // Utils
    invalidateQueries: () => {
      queryClient.invalidateQueries([QUERY_KEYS.PATIENTS]);
      queryClient.invalidateQueries([QUERY_KEYS.STATS]);
    },
    
    clearCache: () => {
      queryClient.clear();
    }
  };
};

// Hook for patient statistics  
export const usePatientStats = () => {
  const { patients, loading, error } = usePatientContext();

  // Calculate statistics from patients data
  const calculateStats = (patientsData) => {
    if (!patientsData || patientsData.length === 0) {
      return {
        total: 0,
        adults: 0,
        minors: 0,
        seniors: 0,
        averageAge: 0,
        demographics: {
          adultPercentage: 0,
          minorPercentage: 0,
          seniorPercentage: 0
        }
      };
    }

    const calculateAge = (birthDate) => {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return Math.max(0, age);
    };

    const ages = patientsData.map(patient => calculateAge(patient.birthDate));
    const total = patientsData.length;
    const minors = ages.filter(age => age < 18).length;
    const seniors = ages.filter(age => age >= 65).length;
    const adults = ages.filter(age => age >= 18 && age < 65).length;
    const averageAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;

    const adultPercentage = total > 0 ? Math.round((adults / total) * 100) : 0;
    const minorPercentage = total > 0 ? Math.round((minors / total) * 100) : 0;
    const seniorPercentage = total > 0 ? Math.round((seniors / total) * 100) : 0;

    return {
      total,
      adults,
      minors,
      seniors,
      averageAge,
      demographics: {
        adultPercentage,
        minorPercentage,
        seniorPercentage
      }
    };
  };

  const data = calculateStats(patients);

  return {
    data,
    isLoading: loading,
    error,
    refetch: () => {}, // Not needed for calculated stats
  };
};

export default usePatients;