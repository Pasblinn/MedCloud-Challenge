import apiService, { apiUtils } from './api';
import { cacheService } from './cacheService';
import { toast } from 'react-toastify';

/**
 * Patient Service - Frontend business logic for patient operations
 */
class PatientService {
  static CACHE_KEYS = {
    PATIENTS_LIST: 'patients_list',
    PATIENT_DETAIL: 'patient_detail',
    PATIENT_STATS: 'patient_stats'
  };

  static CACHE_TTL = {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000 // 1 hour
  };

  /**
   * Get all patients with caching
   */
  static async getPatients(params = {}, useCache = true) {
    try {
      const cacheKey = `${this.CACHE_KEYS.PATIENTS_LIST}_${JSON.stringify(params)}`;
      
      // Try cache first
      if (useCache) {
        const cached = cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const response = await apiService.patients.getAll(params);
      const data = response.data;

      // Cache the result
      if (useCache) {
        cacheService.set(cacheKey, data, this.CACHE_TTL.SHORT);
      }

      return data;
    } catch (error) {
      console.error('Error getting patients:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID with caching
   */
  static async getPatientById(id, useCache = true) {
    try {
      const cacheKey = `${this.CACHE_KEYS.PATIENT_DETAIL}_${id}`;
      
      if (useCache) {
        const cached = cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const response = await apiService.patients.getById(id);
      const data = response.data;

      if (useCache) {
        cacheService.set(cacheKey, data, this.CACHE_TTL.MEDIUM);
      }

      return data;
    } catch (error) {
      console.error(`Error getting patient ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new patient
   */
  static async createPatient(patientData) {
    try {
      const response = await apiService.patients.create(patientData);
      
      // Clear cache
      this.clearCache();
      
      toast.success('Patient created successfully!');
      return response.data;
    } catch (error) {
      const message = apiUtils.formatError(error);
      toast.error(`Failed to create patient: ${message}`);
      throw error;
    }
  }

  /**
   * Update patient
   */
  static async updatePatient(id, patientData) {
    try {
      const response = await apiService.patients.update(id, patientData);
      
      // Clear cache
      this.clearCache();
      
      toast.success('Patient updated successfully!');
      return response.data;
    } catch (error) {
      const message = apiUtils.formatError(error);
      toast.error(`Failed to update patient: ${message}`);
      throw error;
    }
  }

  /**
   * Delete patient
   */
  static async deletePatient(id) {
    try {
      await apiService.patients.delete(id);
      
      // Clear cache
      this.clearCache();
      
      toast.success('Patient deleted successfully!');
      return true;
    } catch (error) {
      const message = apiUtils.formatError(error);
      toast.error(`Failed to delete patient: ${message}`);
      throw error;
    }
  }

  /**
   * Search patients
   */
  static async searchPatients(query, params = {}) {
    try {
      const response = await apiService.patients.search(query, params);
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  }

  /**
   * Get patient statistics
   */
  static async getStats(useCache = true) {
    try {
      const cacheKey = this.CACHE_KEYS.PATIENT_STATS;
      
      if (useCache) {
        const cached = cacheService.get(cacheKey);
        if (cached) {
          return cached;
        }
      }

      const response = await apiService.patients.getStats();
      const data = response.data;

      if (useCache) {
        cacheService.set(cacheKey, data, this.CACHE_TTL.MEDIUM);
      }

      return data;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Export patients data
   */
  static async exportPatients(format = 'json') {
    try {
      const response = await apiService.patients.export(format);
      
      if (format === 'csv') {
        // Handle CSV download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `patients_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON download
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `patients_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Patients exported successfully (${format.toUpperCase()})`);
      return true;
    } catch (error) {
      const message = apiUtils.formatError(error);
      toast.error(`Failed to export patients: ${message}`);
      throw error;
    }
  }

  /**
   * Bulk create patients
   */
  static async bulkCreatePatients(patientsData) {
    try {
      const response = await apiService.patients.bulkCreate(patientsData);
      
      // Clear cache
      this.clearCache();
      
      const { created, failed, total } = response.data.data;
      
      if (failed === 0) {
        toast.success(`All ${created} patients created successfully!`);
      } else {
        toast.warning(`${created} patients created, ${failed} failed out of ${total}.`);
      }
      
      return response.data;
    } catch (error) {
      const message = apiUtils.formatError(error);
      toast.error(`Failed to create patients: ${message}`);
      throw error;
    }
  }

  /**
   * Clear all patient-related cache
   */
  static clearCache() {
    cacheService.removePattern('patients_');
  }

  /**
   * Format patient data for display
   */
  static formatPatient(patient) {
    return {
      ...patient,
      formattedBirthDate: this.formatDate(patient.birthDate),
      ageGroup: this.getAgeGroup(patient.age),
      displayName: this.formatName(patient.name)
    };
  }

  /**
   * Format date
   */
  static formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  /**
   * Format name to title case
   */
  static formatName(name) {
    if (!name) return '';
    return name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Get age group classification
   */
  static getAgeGroup(age) {
    if (age < 18) return { label: 'Minor', color: 'info' };
    if (age >= 65) return { label: 'Senior', color: 'warning' };
    return { label: 'Adult', color: 'success' };
  }

  /**
   * Validate patient data
   */
  static validatePatient(patientData) {
    const errors = {};

    if (!patientData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (patientData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!patientData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!patientData.birthDate) {
      errors.birthDate = 'Birth date is required';
    } else {
      const birthDate = new Date(patientData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        errors.birthDate = 'Birth date cannot be in the future';
      }
    }

    if (!patientData.address?.trim()) {
      errors.address = 'Address is required';
    } else if (patientData.address.trim().length < 10) {
      errors.address = 'Address must be at least 10 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Get patient age from birth date
   */
  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }
}

export default PatientService;