const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

/**
 * Generic validation middleware
 * Checks for validation errors from express-validator
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    logger.warn('Validation failed:', {
      url: req.originalUrl,
      method: req.method,
      errors: formattedErrors,
      body: req.body,
      params: req.params,
      query: req.query
    });

    return ApiResponse.badRequest(res, 'Validation failed', formattedErrors);
  }

  next();
};

/**
 * Sanitize request data middleware
 * Clean and normalize common fields
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    // Trim string fields
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });

    // Normalize email
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }

    // Normalize name (title case)
    if (req.body.name) {
      req.body.name = req.body.name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Remove empty strings and convert to null
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === '') {
        req.body[key] = null;
      }
    });
  }

  next();
};

/**
 * Request size limiter middleware
 */
const limitRequestSize = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeNum = parseInt(maxSize);
      
      if (sizeInMB > maxSizeNum) {
        logger.warn(`Request too large: ${sizeInMB}MB > ${maxSizeNum}MB`, {
          url: req.originalUrl,
          method: req.method,
          contentLength,
          ip: req.ip
        });
        
        return ApiResponse.badRequest(res, `Request too large. Maximum size is ${maxSize}`);
      }
    }
    
    next();
  };
};

/**
 * File type validation middleware
 */
const validateFileType = (allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return (req, res, next) => {
    if (req.file || req.files) {
      const files = req.files || [req.file];
      
      for (const file of files) {
        if (file && !allowedTypes.includes(file.mimetype)) {
          return ApiResponse.badRequest(res, 
            `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
          );
        }
      }
    }
    
    next();
  };
};

/**
 * Request timeout middleware
 */
const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    req.setTimeout(timeout, () => {
      logger.error('Request timeout', {
        url: req.originalUrl,
        method: req.method,
        timeout,
        ip: req.ip
      });
      
      if (!res.headersSent) {
        return ApiResponse.error(res, 'Request timeout', 408, 'REQUEST_TIMEOUT');
      }
    });
    
    next();
  };
};

/**
 * XSS Protection middleware
 */
const xssProtection = (req, res, next) => {
  if (req.body) {
    const cleanObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          // Basic XSS cleaning - remove script tags and javascript: URLs
          obj[key] = obj[key]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          cleanObject(obj[key]);
        }
      });
    };
    
    cleanObject(req.body);
  }
  
  next();
};

/**
 * SQL Injection basic protection
 */
const sqlInjectionProtection = (req, res, next) => {
  const checkForSQLInjection = (value) => {
    if (typeof value !== 'string') return false;
    
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /('|(\')|(\-\-)|(\;)|(\/\*))/gi,
      /((\%27)|(\')|(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER))/gi
    ];
    
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  const checkObject = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string' && checkForSQLInjection(value)) {
        logger.warn('Potential SQL injection attempt detected', {
          field: currentPath,
          value,
          url: req.originalUrl,
          method: req.method,
          ip: req.ip,
          userAgent: req.get('User-Agent')
        });
        
        return ApiResponse.badRequest(res, 'Invalid characters detected in input');
      }
      
      if (typeof value === 'object' && value !== null) {
        const result = checkObject(value, currentPath);
        if (result) return result;
      }
    }
    
    return false;
  };
  
  // Check body, params, and query
  for (const source of [req.body, req.params, req.query]) {
    if (source && typeof source === 'object') {
      const result = checkObject(source);
      if (result) return result;
    }
  }
  
  next();
};

/**
 * Request logging middleware
 */
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    timestamp: new Date().toISOString()
  });
  
  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0,
      ip: req.ip
    });
  });
  
  next();
};

module.exports = {
  handleValidationErrors,
  sanitizeRequest,
  limitRequestSize,
  validateFileType,
  requestTimeout,
  xssProtection,
  sqlInjectionProtection,
  logRequest
};