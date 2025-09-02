const express = require('express');
const patientRoutes = require('./patients');
const ApiResponse = require('../utils/response');

const router = express.Router();

// API Information
router.get('/', (req, res) => {
  return ApiResponse.success(res, {
    name: 'Patient Management API',
    version: '1.0.0',
    description: 'RESTful API for managing patient records',
    endpoints: {
      patients: '/api/patients',
      health: '/api/health'
    },
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  }, 'Welcome to Patient Management API');
});

// Health check endpoint
router.get('/health', (req, res) => {
  return ApiResponse.success(res, {
    status: 'OK',
    service: 'Patient Management API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  }, 'API is healthy');
});

// Mount patient routes
router.use('/patients', patientRoutes);

// API Documentation endpoint (basic)
router.get('/docs', (req, res) => {
  return ApiResponse.success(res, {
    title: 'Patient Management API Documentation',
    baseUrl: `${req.protocol}://${req.get('host')}/api`,
    endpoints: {
      'GET /patients': 'Get all patients with pagination',
      'GET /patients/:id': 'Get patient by ID', 
      'POST /patients': 'Create new patient',
      'PUT /patients/:id': 'Update patient',
      'DELETE /patients/:id': 'Delete patient',
      'GET /patients/search': 'Search patients',
      'GET /patients/stats': 'Get patient statistics',
      'GET /patients/export': 'Export patients data',
      'POST /patients/bulk': 'Bulk create patients'
    },
    examples: {
      createPatient: {
        method: 'POST',
        url: '/api/patients',
        body: {
          name: 'João Silva',
          birthDate: '1990-05-15',
          email: 'joao@email.com',
          address: 'Rua das Flores, 123, São Paulo - SP'
        }
      },
      getPatients: {
        method: 'GET',
        url: '/api/patients?page=1&limit=10&search=joão'
      }
    }
  }, 'API Documentation');
});

module.exports = router;