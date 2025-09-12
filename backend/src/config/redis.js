const { createClient } = require('redis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    reconnectDelay: 1000,
    lazyConnect: true,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: 0,
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

// Create Redis client
const redisClient = createClient(redisConfig);

// Redis event listeners
redisClient.on('connect', () => {
  logger.info('Redis client connecting...');
});

redisClient.on('ready', () => {
  logger.info(`Redis connected successfully to ${redisConfig.socket.host}:${redisConfig.socket.port}`);
});

redisClient.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redisClient.on('end', () => {
  logger.info('Redis connection closed');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting...');
});

/**
 * Connect to Redis
 */
async function connectRedis() {
  try {
    await redisClient.connect();
    
    // Test connection
    const pong = await redisClient.ping();
    logger.info(`Redis ping response: ${pong}`);
    
    return true;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
}

/**
 * Cache service wrapper with error handling
 */
class CacheService {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {*} Cached value or null
   */
  static async get(key) {
    try {
      const value = await redisClient.get(key);
      if (value) {
        logger.debug(`Cache HIT for key: ${key}`);
        return JSON.parse(value);
      }
      logger.debug(`Cache MISS for key: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error);
      return null; // Fail gracefully
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 3600)
   */
  static async set(key, value, ttl = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttl, serializedValue);
      logger.debug(`Cache SET for key: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error);
      // Don't throw error, just log it
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   */
  static async del(key) {
    try {
      const result = await redisClient.del(key);
      logger.debug(`Cache DEL for key: ${key} (deleted: ${result})`);
      return result;
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Key pattern
   */
  static async delPattern(pattern) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        const result = await redisClient.del(keys);
        logger.debug(`Cache DEL pattern ${pattern}: ${result} keys deleted`);
        return result;
      }
      return 0;
    } catch (error) {
      logger.error(`Cache DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  static async exists(key) {
    try {
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Set expiration time for a key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   */
  static async expire(key, ttl) {
    try {
      const result = await redisClient.expire(key, ttl);
      logger.debug(`Cache EXPIRE for key: ${key} (TTL: ${ttl}s)`);
      return result;
    } catch (error) {
      logger.error(`Cache EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   * @param {string} key - Cache key
   * @returns {number} TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
   */
  static async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -2;
    }
  }

  /**
   * Increment value (useful for counters)
   * @param {string} key - Cache key
   * @param {number} increment - Increment value (default: 1)
   */
  static async incr(key, increment = 1) {
    try {
      const result = await redisClient.incrBy(key, increment);
      logger.debug(`Cache INCR for key: ${key} (increment: ${increment})`);
      return result;
    } catch (error) {
      logger.error(`Cache INCR error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    try {
      const info = await redisClient.info('memory');
      return info;
    } catch (error) {
      logger.error('Cache STATS error:', error);
      return null;
    }
  }
}

/**
 * Generate cache key with prefix
 * @param {string} prefix - Key prefix
 * @param {...string} parts - Key parts
 * @returns {string} Formatted cache key
 */
function generateCacheKey(prefix, ...parts) {
  return `patient_mgmt:${prefix}:${parts.join(':')}`;
}

/**
 * Close Redis connection
 */
async function closeRedis() {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed gracefully');
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
    throw error;
  }
}

module.exports = {
  redisClient,
  CacheService,
  generateCacheKey,
  connectRedis,
  closeRedis
};