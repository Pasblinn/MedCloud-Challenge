const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Database error handler
 * @param {Error} error - Database error
 * @returns {Object} Formatted error
 */
function handleDatabaseError(error) {
  logger.error('Database error:', error);

  // PostgreSQL specific errors
  switch (error.code) {
    case '23505': // Unique violation
      if (error.constraint?.includes('email')) {
        return new AppError('Email already exists', 409, 'EMAIL_ALREADY_EXISTS');
      }
      return new AppError('Duplicate entry', 409, 'DUPLICATE_ENTRY');

    case '23503': // Foreign key violation
      return new AppError('Referenced record does not exist', 400, 'FOREIGN_KEY_VIOLATION');

    case '23502': // Not null violation
      return new AppError('Required field is missing', 400, 'REQUIRED_FIELD_MISSING');

    case '23514': // Check constraint violation
      return new AppError('Invalid data provided', 400, 'CHECK_CONSTRAINT_VIOLATION');

    case '42703': // Undefined column
      return new AppError('Invalid field specified', 400, 'INVALID_FIELD');

    case '42P01': // Undefined table
      return new AppError('Resource not found', 500, 'RESOURCE_NOT_FOUND');

    case '08003': // Connection does not exist
    case '08006': // Connection failure
    case '08001': // Unable to connect
      return new AppError('Database connection error', 503, 'DATABASE_CONNECTION_ERROR');

    case '53300': // Too many connections
      return new AppError('Database is temporarily unavailable', 503, 'DATABASE_OVERLOADED');

    default:
      return new AppError('Database operation failed', 500, 'DATABASE_ERROR');
  }
}

/**
 * Validation error handler
 * @param {Error} error - Joi validation error
 * @returns {Object} Formatted error
 */
function handleValidationError(error) {
  const details = error.details.map(detail => ({
    field: detail.path.join('.'),
    message: detail.message.replace(/"/g, ''),
    value: detail.context?.value
  }));

  return {
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details
  };
}

/**
 * JWT error handler
 * @param {Error} error - JWT error
 * @returns {Object} Formatted error
 */
function handleJWTError(error) {
  switch (error.name) {
    case 'JsonWebTokenError':
      return new AppError('Invalid token', 401, 'INVALID_TOKEN');
    case 'TokenExpiredError':
      return new AppError('Token expired', 401, 'TOKEN_EXPIRED');
    case 'NotBeforeError':
      return new AppError('Token not active', 401, 'TOKEN_NOT_ACTIVE');
    default:
      return new AppError('Authentication failed', 401, 'AUTH_FAILED');
  }
}

/**
 * Cast error handler (for invalid IDs, etc.)
 * @param {Error} error - Cast error
 * @returns {Object} Formatted error
 */
function handleCastError(error) {
  return new AppError('Invalid ID format', 400, 'INVALID_ID');
}

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logger.error(`Error ${err.name}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack
  });

  // Handle specific error types
  if (err.name === 'ValidationError' && err.isJoi) {
    const validationError = handleValidationError(err);
    return ApiResponse.badRequest(res, validationError.message, validationError.details);
  }

  if (err.code && err.code.startsWith('23')) {
    error = handleDatabaseError(err);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
    error = handleJWTError(err);
  }

  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  // Default to AppError if it's already an AppError
  if (!(error instanceof AppError)) {
    if (error.isOperational) {
      error = new AppError(error.message, error.statusCode || 500, error.code);
    } else {
      error = new AppError('Something went wrong', 500, 'INTERNAL_SERVER_ERROR');
    }
  }

  // Send error response
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString()
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Add request info for debugging
  if (process.env.NODE_ENV === 'development') {
    response.request = {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query
    };
  }

  res.status(statusCode).json(response);
}

/**
 * Handle unhandled routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function notFoundHandler(req, res, next) {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
}

/**
 * Async error handler wrapper
 * @param {Function} fn - Async function
 * @returns {Function} Express middleware function
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  catchAsync
};