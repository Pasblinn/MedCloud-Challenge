const express = require('express');
const PatientController = require('../controllers/PatientController');
const { validationMiddlewares } = require('../validators/patientValidator');

const router = express.Router();

// Patient Statistics - Must come before :id routes
router.get('/stats', PatientController.getPatientStats);

// Patient Health Check
router.get('/health', PatientController.healthCheck);

// Search Patients - Must come before :id routes
router.get('/search', PatientController.searchPatients);

// Export Patients - Must come before :id routes  
router.get('/export', PatientController.exportPatients);

// Age Range Filter - Must come before :id routes
router.get('/age-range', PatientController.getPatientsByAge);

// Bulk Create Patients
router.post('/bulk', PatientController.bulkCreatePatients);

// Main CRUD Operations
// GET /api/patients - Get all patients with pagination
router.get('/', 
  validationMiddlewares.getPatients, 
  PatientController.getPatients
);

// POST /api/patients - Create new patient
router.post('/', 
  validationMiddlewares.createPatient, 
  PatientController.createPatient
);

// GET /api/patients/:id - Get patient by ID
router.get('/:id', 
  validationMiddlewares.getPatient, 
  PatientController.getPatientById
);

// PUT /api/patients/:id - Update patient
router.put('/:id', 
  validationMiddlewares.updatePatient, 
  PatientController.updatePatient
);

// PATCH /api/patients/:id - Partial update patient  
router.patch('/:id', 
  validationMiddlewares.updatePatient, 
  PatientController.updatePatient
);

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', 
  validationMiddlewares.deletePatient, 
  PatientController.deletePatient
);

module.exports = router;