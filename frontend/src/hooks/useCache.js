import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheService } from '../services/cacheService';
import { CACHE_CONFIG } from '../utils/constants';

/**
 * Custom hook for browser cache operations
 */
export const useCache = (key, defaultValue = null, options = {}) => {
  const {
    ttl = CACHE_CONFIG.DEFAULT_TTL,
    persistent = true,
    autoRefresh = false,
    refreshInterval = 60000 // 1 minute
  } = options;

  const [data, setData] = useState(() => {
    const cached = cacheService.get(key, persistent);
    return cached !== null ? cached : defaultValue;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const refreshTimeoutRef = useRef(null);

  // Set cache data
  const set = useCallback((value) => {
    try {
      const success = cacheService.set(key, value, ttl, persistent);
      if (success) {
        setData(value);
        setError(null);
      } else {
        setError('Failed to cache data');
      }
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [key, ttl, persistent]);

  // Get cache data
  const get = useCallback(() => {
    try {
      const cached = cacheService.get(key, persistent);
      setData(cached !== null ? cached : defaultValue);
      setError(null);
      return cached;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [key, persistent, defaultValue]);

  // Remove cache data
  const remove = useCallback(() => {
    try {
      const success = cacheService.remove(key, persistent);
      if (success) {
        setData(defaultValue);
        setError(null);
      }
      return success;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [key, persistent, defaultValue]);

  // Check if data exists in cache
  const has = useCallback(() => {
    return cacheService.has(key, persistent);
  }, [key, persistent]);

  // Memoize function with cache
  const memoize = useCallback(async (fetchFn) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await cacheService.memoize(key, fetchFn, ttl, persistent);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, ttl, persistent]);

  // Refresh data
  const refresh = useCallback(() => {
    get();
  }, [get]);

  // Setup auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(refresh, refreshInterval);
      
      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    set,
    get,
    remove,
    has,
    memoize,
    refresh,
    isValid: has(),
    isEmpty: data === null || data === undefined
  };
};

/**
 * Hook for managing multiple cache entries
 */
export const useCacheBatch = (keys = [], options = {}) => {
  const { persistent = true } = options;
  const [batchData, setBatchData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Get batch data
  const getBatch = useCallback(() => {
    try {
      setIsLoading(true);
      const results = cacheService.getBatch(keys, persistent);
      setBatchData(results);
      setErrors({});
      return results;
    } catch (err) {
      setErrors({ general: err.message });
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [keys, persistent]);

  // Set batch data
  const setBatch = useCallback((items, ttl = CACHE_CONFIG.DEFAULT_TTL) => {
    try {
      const results = cacheService.setBatch(
        items.map(({ key, data }) => ({ key, data })),
        ttl,
        persistent
      );
      
      const newBatchData = {};
      items.forEach(({ key, data }, index) => {
        if (results[index]) {
          newBatchData[key] = data;
        }
      });
      
      setBatchData(prev => ({ ...prev, ...newBatchData }));
      setErrors({});
      return results;
    } catch (err) {
      setErrors({ general: err.message });
      return [];
    }
  }, [persistent]);

  // Initialize batch data
  useEffect(() => {
    if (keys.length > 0) {
      getBatch();
    }
  }, [keys, getBatch]);

  return {
    batchData,
    isLoading,
    errors,
    getBatch,
    setBatch,
    hasData: Object.keys(batchData).length > 0
  };
};

/**
 * Hook for cache statistics and management
 */
export const useCacheStats = (persistent = true) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get cache statistics
  const getStats = useCallback(() => {
    try {
      setIsLoading(true);
      const cacheStats = cacheService.getStats(persistent);
      setStats(cacheStats);
      return cacheStats;
    } catch (err) {
      console.error('Failed to get cache stats:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [persistent]);

  // Clear all cache
  const clearAll = useCallback(() => {
    try {
      cacheService.clear(persistent);
      setStats(null);
      return true;
    } catch (err) {
      console.error('Failed to clear cache:', err);
      return false;
    }
  }, [persistent]);

  // Cleanup expired entries
  const cleanup = useCallback(() => {
    try {
      const removedCount = cacheService.cleanup(persistent);
      getStats(); // Refresh stats after cleanup
      return removedCount;
    } catch (err) {
      console.error('Failed to cleanup cache:', err);
      return 0;
    }
  }, [persistent, getStats]);

  // Initialize stats
  useEffect(() => {
    getStats();
  }, [getStats]);

  return {
    stats,
    isLoading,
    getStats,
    clearAll,
    cleanup,
    isEmpty: stats?.totalItems === 0,
    isOverLimit: stats?.sizeMB > 4.5 // Warning when approaching 5MB limit
  };
};

/**
 * Hook for cache pattern operations
 */
export const useCachePattern = (pattern, options = {}) => {
  const { persistent = true } = options;
  const [isLoading, setIsLoading] = useState(false);

  // Remove entries matching pattern
  const removePattern = useCallback(async () => {
    try {
      setIsLoading(true);
      const removedCount = cacheService.removePattern(pattern, persistent);
      return removedCount;
    } catch (err) {
      console.error('Failed to remove cache pattern:', err);
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, [pattern, persistent]);

  return {
    removePattern,
    isLoading
  };
};

export default useCache;