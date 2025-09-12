const PatientService = require('../services/PatientService');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');
const { catchAsync } = require('../middlewares/errorHandler');

/**
 * Patient Controller - Handle HTTP requests for Patient operations
 */
class PatientController {

  /**
   * Create a new patient
   * @route POST /api/patients
   */
  static createPatient = catchAsync(async (req, res) => {
    logger.info('POST /api/patients - Creating new patient');
    
    const patient = await PatientService.createPatient(req.body);
    
    return ApiResponse.created(res, patient, 'Patient created successfully');
  });

  /**
   * Get all patients with pagination
   * @route GET /api/patients
   */
  static getPatients = catchAsync(async (req, res) => {
    logger.info('GET /api/patients - Fetching patients list');
    
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      sortBy: req.query.sortBy || 'created_at',
      sortOrder: req.query.sortOrder || 'desc',
      minAge: req.query.minAge ? parseInt(req.query.minAge) : undefined,
      maxAge: req.query.maxAge ? parseInt(req.query.maxAge) : undefined
    };

    const result = await PatientService.getPatients(options);
    
    return ApiResponse.paginated(
      res, 
      result.patients, 
      result.pagination, 
      'Patients retrieved successfully'
    );
  });

  /**
   * Get patient by ID
   * @route GET /api/patients/:id
   */
  static getPatientById = catchAsync(async (req, res) => {
    const { id } = req.params;
    logger.info(`GET /api/patients/${id} - Fetching patient by ID`);
    
    const patient = await PatientService.getPatientById(id);
    
    if (!patient) {
      return ApiResponse.notFound(res, 'Patient not found');
    }
    
    return ApiResponse.success(res, patient, 'Patient retrieved successfully');
  });

  /**
   * Update patient
   * @route PUT /api/patients/:id
   */
  static updatePatient = catchAsync(async (req, res) => {
    const { id } = req.params;
    logger.info(`PUT /api/patients/${id} - Updating patient`);
    
    const patient = await PatientService.updatePatient(id, req.body);
    
    if (!patient) {
      return ApiResponse.notFound(res, 'Patient not found');
    }
    
    return ApiResponse.success(res, patient, 'Patient updated successfully');
  });

  /**
   * Delete patient
   * @route DELETE /api/patients/:id
   */
  static deletePatient = catchAsync(async (req, res) => {
    const { id } = req.params;
    logger.info(`DELETE /api/patients/${id} - Deleting patient`);
    
    const deleted = await PatientService.deletePatient(id);
    
    if (!deleted) {
      return ApiResponse.notFound(res, 'Patient not found');
    }
    
    return ApiResponse.success(res, null, 'Patient deleted successfully');
  });

  /**
   * Search patients
   * @route GET /api/patients/search
   */
  static searchPatients = catchAsync(async (req, res) => {
    const { q: searchTerm, page = 1, limit = 10 } = req.query;
    logger.info(`GET /api/patients/search - Searching patients: ${searchTerm}`);
    
    if (!searchTerm) {
      return ApiResponse.badRequest(res, 'Search term is required');
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search: searchTerm
    };

    const result = await PatientService.getPatients(options);
    
    return ApiResponse.paginated(
      res, 
      result.patients, 
      result.pagination, 
      `Search results for "${searchTerm}"`
    );
  });

  /**
   * Get patient statistics
   * @route GET /api/patients/stats
   */
  static getPatientStats = catchAsync(async (req, res) => {
    logger.info('GET /api/patients/stats - Fetching patient statistics');
    
    const stats = await PatientService.getPatientStats();
    
    return ApiResponse.success(res, stats, 'Statistics retrieved successfully');
  });

  /**
   * Bulk create patients
   * @route POST /api/patients/bulk
   */
  static bulkCreatePatients = catchAsync(async (req, res) => {
    logger.info('POST /api/patients/bulk - Bulk creating patients');
    
    const { patients } = req.body;
    
    if (!Array.isArray(patients) || patients.length === 0) {
      return ApiResponse.badRequest(res, 'Patients array is required');
    }
    
    if (patients.length > 100) {
      return ApiResponse.badRequest(res, 'Cannot create more than 100 patients at once');
    }

    const results = [];
    const errors = [];
    
    for (let i = 0; i < patients.length; i++) {
      try {
        const patient = await PatientService.createPatient(patients[i]);
        results.push({ index: i, patient, success: true });
      } catch (error) {
        errors.push({ 
          index: i, 
          error: error.message, 
          data: patients[i],
          success: false 
        });
      }
    }
    
    const response = {
      created: results.length,
      failed: errors.length,
      total: patients.length,
      results: results.map(r => r.patient),
      errors: errors
    };
    
    if (errors.length === 0) {
      return ApiResponse.created(res, response, 'All patients created successfully');
    } else if (results.length === 0) {
      return ApiResponse.badRequest(res, 'No patients were created', response);
    } else {
      return ApiResponse.success(res, response, 'Patients created with some errors');
    }
  });

  /**
   * Get patients by age range
   * @route GET /api/patients/age-range
   */
  static getPatientsByAge = catchAsync(async (req, res) => {
    const { minAge, maxAge, page = 1, limit = 10 } = req.query;
    logger.info(`GET /api/patients/age-range - Age range: ${minAge}-${maxAge}`);
    
    if (!minAge && !maxAge) {
      return ApiResponse.badRequest(res, 'At least one age parameter (minAge or maxAge) is required');
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      minAge: minAge ? parseInt(minAge) : undefined,
      maxAge: maxAge ? parseInt(maxAge) : undefined
    };

    const result = await PatientService.getPatients(options);
    
    return ApiResponse.paginated(
      res, 
      result.patients, 
      result.pagination, 
      `Patients in age range ${minAge || 0}-${maxAge || '∞'}`
    );
  });

  /**
   * Export patients data
   * @route GET /api/patients/export
   */
  static exportPatients = catchAsync(async (req, res) => {
    logger.info('GET /api/patients/export - Exporting patients data');
    
    const { format = 'json' } = req.query;
    
    // Get all patients without pagination
    const result = await PatientService.getPatients({ 
      page: 1, 
      limit: 10000 // Large limit to get all
    });
    
    switch (format.toLowerCase()) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=patients.json');
        return res.json(result.patients);
        
      case 'csv':
        // Simple CSV implementation
        const csvHeaders = 'ID,Name,Email,Birth Date,Age,Address,Created At\n';
        const csvRows = result.patients.map(p => 
          `${p.id},"${p.name}","${p.email}",${p.birthDate},${p.age},"${p.address}",${p.createdAt}`
        ).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=patients.csv');
        return res.send(csvHeaders + csvRows);
        
      default:
        return ApiResponse.badRequest(res, 'Unsupported export format. Use json or csv');
    }
  });

  /**
   * Health check for patients service
   * @route GET /api/patients/health
   */
  static healthCheck = catchAsync(async (req, res) => {
    const stats = await PatientService.getPatientStats();
    
    return ApiResponse.success(res, {
      service: 'Patient Service',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      totalPatients: stats.total
    }, 'Patient service is healthy');
  });
}

module.exports = PatientController;