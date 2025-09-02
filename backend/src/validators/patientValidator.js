const Joi = require('joi');

/**
 * Patient validation schemas using Joi
 */

// Custom date validation
const dateSchema = Joi.date()
  .iso()
  .max('now')
  .messages({
    'date.base': 'Birth date must be a valid date',
    'date.format': 'Birth date must be in YYYY-MM-DD format',
    'date.max': 'Birth date cannot be in the future'
  });

// Custom email validation
const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .max(255)
  .messages({
    'string.email': 'Please provide a valid email address',
    'string.max': 'Email cannot exceed 255 characters'
  });

// Custom name validation
const nameSchema = Joi.string()
  .trim()
  .min(2)
  .max(255)
  .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
  .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 255 characters',
    'string.pattern.base': 'Name can only contain letters and spaces'
  });

// Custom address validation
const addressSchema = Joi.string()
  .trim()
  .min(10)
  .max(500)
  .messages({
    'string.min': 'Address must be at least 10 characters long',
    'string.max': 'Address cannot exceed 500 characters'
  });

// UUID validation
const uuidSchema = Joi.string()
  .guid({ version: 'uuidv4' })
  .messages({
    'string.guid': 'Please provide a valid ID'
  });

/**
 * Schema for creating a new patient
 */
const createPatientSchema = Joi.object({
  name: nameSchema.required(),
  birthDate: dateSchema.required(),
  email: emailSchema.required(),
  address: addressSchema.required()
}).messages({
  'any.required': '{#label} is required'
});

/**
 * Schema for updating a patient
 */
const updatePatientSchema = Joi.object({
  name: nameSchema.optional(),
  birthDate: dateSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Schema for patient ID parameter
 */
const patientIdSchema = Joi.object({
  id: uuidSchema.required()
});

/**
 * Schema for query parameters
 */
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().max(100).optional(),
  sortBy: Joi.string().valid('name', 'email', 'birthDate', 'createdAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  minAge: Joi.number().integer().min(0).max(150).optional(),
  maxAge: Joi.number().integer().min(0).max(150).optional()
}).custom((value, helpers) => {
  // Ensure minAge is not greater than maxAge
  if (value.minAge && value.maxAge && value.minAge > value.maxAge) {
    return helpers.error('custom.ageRange');
  }
  return value;
}).messages({
  'custom.ageRange': 'Minimum age cannot be greater than maximum age'
});

/**
 * Validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert strings to appropriate types
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details,
        timestamp: new Date().toISOString()
      });
    }

    // Replace the request property with validated and sanitized data
    req[property] = value;
    next();
  };
};

/**
 * Custom validation functions
 */
const customValidations = {
  /**
   * Validate age range
   * @param {Date} birthDate - Birth date
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @returns {boolean} Validation result
   */
  isAgeInRange(birthDate, minAge = 0, maxAge = 150) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age >= minAge && age <= maxAge;
  },

  /**
   * Validate Brazilian postal code format
   * @param {string} address - Address string
   * @returns {boolean} Has valid CEP format
   */
  hasValidBrazilianPostalCode(address) {
    const cepRegex = /\d{5}-?\d{3}/;
    return cepRegex.test(address);
  },

  /**
   * Check if email domain is valid
   * @param {string} email - Email address
   * @returns {boolean} Valid domain
   */
  hasValidEmailDomain(email) {
    const domain = email.split('@')[1];
    // Basic check for common domains
    const validDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    return validDomains.includes(domain) || domain.includes('.');
  }
};

/**
 * Middleware for validating patient creation
 */
const validateCreatePatient = validate(createPatientSchema, 'body');

/**
 * Middleware for validating patient update
 */
const validateUpdatePatient = validate(updatePatientSchema, 'body');

/**
 * Middleware for validating patient ID parameter
 */
const validatePatientId = validate(patientIdSchema, 'params');

/**
 * Middleware for validating query parameters
 */
const validateQuery = validate(querySchema, 'query');

/**
 * Combined validation middleware for common operations
 */
const validationMiddlewares = {
  createPatient: [validateCreatePatient],
  updatePatient: [validatePatientId, validateUpdatePatient],
  getPatient: [validatePatientId],
  deletePatient: [validatePatientId],
  getPatients: [validateQuery]
};

module.exports = {
  // Schemas
  createPatientSchema,
  updatePatientSchema,
  patientIdSchema,
  querySchema,
  
  // Validation middleware
  validate,
  validateCreatePatient,
  validateUpdatePatient,
  validatePatientId,
  validateQuery,
  validationMiddlewares,
  
  // Custom validations
  customValidations
};