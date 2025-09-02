const PatientRepository = require('../repositories/PatientRepository');
const { CacheService, generateCacheKey } = require('../config/redis');
const logger = require('../utils/logger');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Patient Service - Business Logic Layer
 */
class PatientService {
  
  static CACHE_TTL = {
    PATIENT: 3600, // 1 hour
    PATIENTS_LIST: 1800, // 30 minutes
    STATS: 7200, // 2 hours
  };

  /**
   * Create a new patient
   */
  static async createPatient(patientData) {
    try {
      logger.info('Creating new patient:', { email: patientData.email });

      // Check if email already exists
      const existingPatient = await PatientRepository.findByEmail(patientData.email);
      if (existingPatient) {
        throw new AppError('Email already registered', 409, 'EMAIL_ALREADY_EXISTS');
      }

      // Additional business validations
      this._validateBusinessRules(patientData);

      // Create patient
      const patient = await PatientRepository.create(patientData);

      // Cache the new patient
      const patientCacheKey = generateCacheKey('patient', patient.id);
      await CacheService.set(patientCacheKey, patient.toJSON(), this.CACHE_TTL.PATIENT);

      // Invalidate patients list cache
      await this._invalidatePatientsListCache();

      logger.info(`Patient created successfully: ${patient.id}`);
      return patient.toJSON();

    } catch (error) {
      logger.error('Error in createPatient service:', error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  static async getPatientById(id) {
    try {
      // Try cache first
      const cacheKey = generateCacheKey('patient', id);
      const cachedPatient = await CacheService.get(cacheKey);
      
      if (cachedPatient) {
        return cachedPatient;
      }

      // Get from database
      const patient = await PatientRepository.findById(id);
      
      if (!patient) {
        return null;
      }

      // Cache the result
      const patientData = patient.toJSON();
      await CacheService.set(cacheKey, patientData, this.CACHE_TTL.PATIENT);

      return patientData;

    } catch (error) {
      logger.error(`Error in getPatientById service:`, error);
      throw error;
    }
  }

  /**
   * Get all patients with pagination
   */
  static async getPatients(options = {}) {
    try {
      // Generate cache key based on options
      const cacheKey = generateCacheKey('patients', JSON.stringify(options));
      const cachedResult = await CacheService.get(cacheKey);

      if (cachedResult) {
        return cachedResult;
      }

      // Get from database
      const result = await PatientRepository.findAll(options);

      // Transform patients to JSON format
      const responseData = {
        patients: result.patients.map(patient => patient.toJSON()),
        pagination: result.pagination
      };

      // Cache the result
      await CacheService.set(cacheKey, responseData, this.CACHE_TTL.PATIENTS_LIST);

      return responseData;

    } catch (error) {
      logger.error('Error in getPatients service:', error);
      throw error;
    }
  }

  /**
   * Update patient
   */
  static async updatePatient(id, updateData) {
    try {
      // Check if patient exists
      const existingPatient = await PatientRepository.findById(id);
      if (!existingPatient) {
        return null;
      }

      // If email is being updated, check if it's already in use
      if (updateData.email && updateData.email !== existingPatient.email) {
        const emailExists = await PatientRepository.emailExists(updateData.email, id);
        if (emailExists) {
          throw new AppError('Email already in use', 409, 'EMAIL_ALREADY_EXISTS');
        }
      }

      // Update patient
      const updatedPatient = await PatientRepository.update(id, updateData);

      // Update cache
      const patientCacheKey = generateCacheKey('patient', id);
      const patientData = updatedPatient.toJSON();
      await CacheService.set(patientCacheKey, patientData, this.CACHE_TTL.PATIENT);

      // Invalidate patients list cache
      await this._invalidatePatientsListCache();

      return patientData;

    } catch (error) {
      logger.error(`Error in updatePatient service:`, error);
      throw error;
    }
  }

  /**
   * Delete patient
   */
  static async deletePatient(id) {
    try {
      // Check if patient exists
      const existingPatient = await PatientRepository.findById(id);
      if (!existingPatient) {
        return false;
      }

      // Delete patient
      const deleted = await PatientRepository.delete(id);

      if (deleted) {
        // Remove from cache
        const patientCacheKey = generateCacheKey('patient', id);
        await CacheService.del(patientCacheKey);

        // Invalidate patients list cache
        await this._invalidatePatientsListCache();
      }

      return deleted;

    } catch (error) {
      logger.error(`Error in deletePatient service:`, error);
      throw error;
    }
  }

  /**
   * Get patient statistics
   */
  static async getPatientStats() {
    try {
      // Try cache first
      const cacheKey = generateCacheKey('stats', 'patients');
      const cachedStats = await CacheService.get(cacheKey);

      if (cachedStats) {
        return cachedStats;
      }

      // Get from database
      const stats = await PatientRepository.getAgeGroupStats();

      // Add additional calculated stats
      const enhancedStats = {
        ...stats,
        demographics: {
          minorPercentage: stats.total > 0 ? ((stats.minors / stats.total) * 100).toFixed(1) : 0,
          adultPercentage: stats.total > 0 ? ((stats.adults / stats.total) * 100).toFixed(1) : 0,
          seniorPercentage: stats.total > 0 ? ((stats.seniors / stats.total) * 100).toFixed(1) : 0,
        },
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      await CacheService.set(cacheKey, enhancedStats, this.CACHE_TTL.STATS);

      return enhancedStats;

    } catch (error) {
      logger.error('Error in getPatientStats service:', error);
      throw error;
    }
  }

  /**
   * Private methods
   */
  static _validateBusinessRules(patientData, isCreation = true) {
    // Age validation
    if (patientData.birthDate || patientData.birth_date) {
      const birthDate = new Date(patientData.birthDate || patientData.birth_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      
      if (age > 150) {
        throw new AppError('Invalid birth date - age cannot exceed 150 years', 400, 'INVALID_AGE');
      }
    }

    // Name validation
    if (patientData.name) {
      if (patientData.name.length < 2) {
        throw new AppError('Name must be at least 2 characters', 400, 'INVALID_NAME');
      }
    }
  }

  static async _invalidatePatientsListCache() {
    try {
      await CacheService.delPattern('patient_mgmt:patients:*');
      await CacheService.delPattern('patient_mgmt:stats:*');
      logger.debug('Patients list cache invalidated');
    } catch (error) {
      logger.error('Error invalidating cache:', error);
    }
  }

  static async _validateDeletion(patient) {
    // Add any business rules for deletion here
    // For example, check if patient has active appointments
    return true;
  }
}

module.exports = PatientService;