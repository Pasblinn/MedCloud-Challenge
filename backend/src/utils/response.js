/**
 * Standardized API response utility
 */
class ApiResponse {
    /**
     * Success response
     * @param {Object} res - Express response object
     * @param {*} data - Response data
     * @param {string} message - Success message
     * @param {number} statusCode - HTTP status code
     */
    static success(res, data = null, message = 'Success', statusCode = 200) {
      return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
      });
    }
  
    /**
     * Created response
     * @param {Object} res - Express response object
     * @param {*} data - Created resource data
     * @param {string} message - Success message
     */
    static created(res, data, message = 'Resource created successfully') {
      return this.success(res, data, message, 201);
    }
  
    /**
     * No content response
     * @param {Object} res - Express response object
     * @param {string} message - Success message
     */
    static noContent(res, message = 'Operation completed successfully') {
      return res.status(204).json({
        success: true,
        message,
        timestamp: new Date().toISOString()
      });
    }
  
    /**
     * Error response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     * @param {string} code - Error code
     * @param {*} details - Additional error details
     */
    static error(res, message = 'Internal Server Error', statusCode = 500, code = null, details = null) {
      const response = {
        success: false,
        message,
        timestamp: new Date().toISOString()
      };
  
      if (code) response.code = code;
      if (details && process.env.NODE_ENV === 'development') {
        response.details = details;
      }
  
      return res.status(statusCode).json(response);
    }
  
    /**
     * Bad request response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     * @param {*} details - Validation details
     */
    static badRequest(res, message = 'Bad Request', details = null) {
      return this.error(res, message, 400, 'BAD_REQUEST', details);
    }
  
    /**
     * Unauthorized response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static unauthorized(res, message = 'Unauthorized') {
      return this.error(res, message, 401, 'UNAUTHORIZED');
    }
  
    /**
     * Forbidden response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static forbidden(res, message = 'Forbidden') {
      return this.error(res, message, 403, 'FORBIDDEN');
    }
  
    /**
     * Not found response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static notFound(res, message = 'Resource not found') {
      return this.error(res, message, 404, 'NOT_FOUND');
    }
  
    /**
     * Conflict response
     * @param {Object} res - Express response object
     * @param {string} message - Error message
     */
    static conflict(res, message = 'Conflict') {
      return this.error(res, message, 409, 'CONFLICT');
    }
  
    /**
     * Validation error response
     * @param {Object} res - Express response object
     * @param {Object} validationErrors - Joi validation errors
     */
    static validationError(res, validationErrors) {
      const details = validationErrors.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
  
      return this.badRequest(res, 'Validation failed', details);
    }
  
    /**
     * Paginated response
     * @param {Object} res - Express response object
     * @param {Array} data - Response data
     * @param {Object} pagination - Pagination info
     * @param {string} message - Success message
     */
    static paginated(res, data, pagination, message = 'Data retrieved successfully') {
      return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: pagination.total,
          totalPages: Math.ceil(pagination.total / pagination.limit),
          hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
          hasPrev: pagination.page > 1
        },
        timestamp: new Date().toISOString()
      });
    }
  }
  
  module.exports = ApiResponse;