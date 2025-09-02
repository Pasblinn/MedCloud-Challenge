const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

/**
 * JWT Authentication middleware
 * Verifies JWT token and adds user info to request
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Authentication failed: No token provided', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
    
    return ApiResponse.unauthorized(res, 'Access token is required');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Authentication failed: Invalid token', {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        error: err.message
      });
      
      if (err.name === 'TokenExpiredError') {
        return ApiResponse.unauthorized(res, 'Token expired');
      } else if (err.name === 'JsonWebTokenError') {
        return ApiResponse.unauthorized(res, 'Invalid token');
      } else {
        return ApiResponse.unauthorized(res, 'Token verification failed');
      }
    }

    req.user = user;
    logger.debug('User authenticated successfully', {
      userId: user.id,
      email: user.email,
      url: req.originalUrl
    });
    
    next();
  });
};

/**
 * Optional authentication middleware
 * Adds user info if token is present, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(); // Continue without authentication
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    next();
  });
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed: Insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        url: req.originalUrl,
        method: req.method
      });
      
      return ApiResponse.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'patient-management-system',
    audience: 'patient-management-users'
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d',
    issuer: 'patient-management-system',
    audience: 'patient-management-users'
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

/**
 * API Key authentication middleware (for external integrations)
 */
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return ApiResponse.unauthorized(res, 'API key is required');
  }

  // In production, store API keys in database
  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key attempt', {
      apiKey: apiKey.substring(0, 8) + '...',
      ip: req.ip,
      url: req.originalUrl
    });
    
    return ApiResponse.unauthorized(res, 'Invalid API key');
  }

  req.apiKey = apiKey;
  next();
};

/**
 * Rate limiting per user
 */
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const userId = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old requests
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    }
    
    // Check current requests
    const currentRequests = requests.get(userId) || [];
    
    if (currentRequests.length >= maxRequests) {
      logger.warn('User rate limit exceeded', {
        userId,
        requestCount: currentRequests.length,
        maxRequests,
        windowMs
      });
      
      return ApiResponse.error(res, 'Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    }
    
    // Add current request
    currentRequests.push(now);
    requests.set(userId, currentRequests);
    
    next();
  };
};

/**
 * Check if user can access specific resource
 */
const canAccessResource = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required');
    }

    const userId = req.user.id;
    const resourceId = req.params.id;

    try {
      switch (resourceType) {
        case 'patient':
          // Check if user can access this patient
          // In a real app, you'd check database permissions
          // For now, allow all authenticated users
          break;
          
        case 'own-profile':
          // User can only access their own profile
          if (userId !== resourceId) {
            return ApiResponse.forbidden(res, 'Can only access your own profile');
          }
          break;
          
        default:
          logger.warn('Unknown resource type for access control', { resourceType });
      }

      next();
    } catch (error) {
      logger.error('Error checking resource access', error);
      return ApiResponse.error(res, 'Access check failed', 500);
    }
  };
};

/**
 * Middleware to extract user context from token
 */
const extractUserContext = (req, res, next) => {
  if (req.user) {
    // Add additional user context that might be useful
    req.userContext = {
      userId: req.user.id,
      email: req.user.email,
      role: req.user.role,
      permissions: req.user.permissions || [],
      isAdmin: req.user.role === 'admin',
      isModerator: ['admin', 'moderator'].includes(req.user.role)
    };
  }
  
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorize,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateApiKey,
  userRateLimit,
  canAccessResource,
  extractUserContext
};