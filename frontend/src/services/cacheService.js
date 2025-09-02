/**
 * Cache Service - Browser-based caching using localStorage and sessionStorage
 * Implements TTL (Time To Live) and provides fallback mechanisms
 */
class CacheService {
    constructor() {
      this.prefix = 'patient_mgmt_';
      this.defaultTTL = 15 * 60 * 1000; // 15 minutes
      this.maxCacheSize = 5 * 1024 * 1024; // 5MB limit
      this.cleanupInterval = 60 * 60 * 1000; // 1 hour cleanup interval
      
      // Start periodic cleanup
      this.startPeriodicCleanup();
      
      // Cleanup on page unload
      window.addEventListener('beforeunload', () => this.cleanup());
    }
  
    /**
     * Check if storage is available
     */
    isStorageAvailable(type = 'localStorage') {
      try {
        const storage = window[type];
        const test = '__storage_test__';
        storage.setItem(test, test);
        storage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    }
  
    /**
     * Get storage instance with fallback
     */
    getStorage(persistent = true) {
      if (persistent && this.isStorageAvailable('localStorage')) {
        return localStorage;
      } else if (this.isStorageAvailable('sessionStorage')) {
        return sessionStorage;
      } else {
        // Fallback to in-memory storage
        return this.memoryStorage;
      }
    }
  
    /**
     * In-memory storage fallback
     */
    memoryStorage = {
      data: new Map(),
      setItem: (key, value) => this.memoryStorage.data.set(key, value),
      getItem: (key) => this.memoryStorage.data.get(key) || null,
      removeItem: (key) => this.memoryStorage.data.delete(key),
      clear: () => this.memoryStorage.data.clear(),
      key: (index) => Array.from(this.memoryStorage.data.keys())[index],
      get length() { return this.memoryStorage.data.size; }
    };
  
    /**
     * Generate cache key with prefix
     */
    generateKey(key) {
      return `${this.prefix}${key}`;
    }
  
    /**
     * Create cache entry with metadata
     */
    createCacheEntry(data, ttl = this.defaultTTL) {
      return {
        data,
        timestamp: Date.now(),
        ttl,
        expiresAt: Date.now() + ttl
      };
    }
  
    /**
     * Set cache item
     */
    set(key, data, ttl = this.defaultTTL, persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        const cacheKey = this.generateKey(key);
        const cacheEntry = this.createCacheEntry(data, ttl);
        
        const serializedEntry = JSON.stringify(cacheEntry);
        
        // Check cache size limit
        if (serializedEntry.length > this.maxCacheSize) {
          console.warn(`Cache entry too large for key: ${key}`);
          return false;
        }
        
        storage.setItem(cacheKey, serializedEntry);
        
        // Update cache metadata
        this.updateCacheMetadata(cacheKey, cacheEntry);
        
        return true;
      } catch (error) {
        console.error('Cache set error:', error);
        
        // Try to free up space and retry
        if (error.name === 'QuotaExceededError') {
          this.freeUpSpace();
          try {
            const storage = this.getStorage(persistent);
            const cacheKey = this.generateKey(key);
            const cacheEntry = this.createCacheEntry(data, ttl);
            storage.setItem(cacheKey, JSON.stringify(cacheEntry));
            return true;
          } catch (retryError) {
            console.error('Cache set retry failed:', retryError);
          }
        }
        
        return false;
      }
    }
  
    /**
     * Get cache item
     */
    get(key, persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        const cacheKey = this.generateKey(key);
        const cachedItem = storage.getItem(cacheKey);
        
        if (!cachedItem) {
          return null;
        }
        
        const cacheEntry = JSON.parse(cachedItem);
        
        // Check if expired
        if (Date.now() > cacheEntry.expiresAt) {
          this.remove(key, persistent);
          return null;
        }
        
        // Update access metadata
        this.updateAccessMetadata(cacheKey);
        
        return cacheEntry.data;
      } catch (error) {
        console.error('Cache get error:', error);
        return null;
      }
    }
  
    /**
     * Remove cache item
     */
    remove(key, persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        const cacheKey = this.generateKey(key);
        storage.removeItem(cacheKey);
        this.removeCacheMetadata(cacheKey);
        return true;
      } catch (error) {
        console.error('Cache remove error:', error);
        return false;
      }
    }
  
    /**
     * Check if cache item exists and is valid
     */
    has(key, persistent = true) {
      return this.get(key, persistent) !== null;
    }
  
    /**
     * Clear all cache items
     */
    clear(persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        const keysToRemove = [];
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
        this.clearCacheMetadata();
        
        return true;
      } catch (error) {
        console.error('Cache clear error:', error);
        return false;
      }
    }
  
    /**
     * Remove items matching pattern
     */
    removePattern(pattern, persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        const keysToRemove = [];
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix) && key.includes(pattern)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
        
        return keysToRemove.length;
      } catch (error) {
        console.error('Cache remove pattern error:', error);
        return 0;
      }
    }
  
    /**
     * Get cache statistics
     */
    getStats(persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        let totalItems = 0;
        let totalSize = 0;
        let expiredItems = 0;
        const now = Date.now();
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            totalItems++;
            const item = storage.getItem(key);
            if (item) {
              totalSize += item.length;
              try {
                const cacheEntry = JSON.parse(item);
                if (now > cacheEntry.expiresAt) {
                  expiredItems++;
                }
              } catch (e) {
                expiredItems++;
              }
            }
          }
        }
        
        return {
          totalItems,
          totalSize,
          expiredItems,
          validItems: totalItems - expiredItems,
          sizeMB: (totalSize / (1024 * 1024)).toFixed(2)
        };
      } catch (error) {
        console.error('Cache stats error:', error);
        return null;
      }
    }
  
    /**
     * Cleanup expired items
     */
    cleanup(persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        const keysToRemove = [];
        const now = Date.now();
        
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            const item = storage.getItem(key);
            if (item) {
              try {
                const cacheEntry = JSON.parse(item);
                if (now > cacheEntry.expiresAt) {
                  keysToRemove.push(key);
                }
              } catch (e) {
                keysToRemove.push(key); // Remove corrupted entries
              }
            }
          }
        }
        
        keysToRemove.forEach(key => storage.removeItem(key));
        
        return keysToRemove.length;
      } catch (error) {
        console.error('Cache cleanup error:', error);
        return 0;
      }
    }
  
    /**
     * Free up cache space by removing oldest items
     */
    freeUpSpace(targetPercentage = 0.5, persistent = true) {
      try {
        const storage = this.getStorage(persistent);
        const cacheItems = [];
        
        // Collect all cache items with timestamps
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.prefix)) {
            const item = storage.getItem(key);
            if (item) {
              try {
                const cacheEntry = JSON.parse(item);
                cacheItems.push({
                  key,
                  timestamp: cacheEntry.timestamp,
                  size: item.length
                });
              } catch (e) {
                // Remove corrupted entries
                storage.removeItem(key);
              }
            }
          }
        }
        
        // Sort by timestamp (oldest first)
        cacheItems.sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove target percentage of items
        const itemsToRemove = Math.floor(cacheItems.length * targetPercentage);
        const keysToRemove = cacheItems.slice(0, itemsToRemove);
        
        keysToRemove.forEach(item => storage.removeItem(item.key));
        
        return itemsToRemove;
      } catch (error) {
        console.error('Free up space error:', error);
        return 0;
      }
    }
  
    /**
     * Update cache metadata
     */
    updateCacheMetadata(key, entry) {
      // This could be extended to track usage statistics
    }
  
    /**
     * Update access metadata
     */
    updateAccessMetadata(key) {
      // This could be extended to track access patterns
    }
  
    /**
     * Remove cache metadata
     */
    removeCacheMetadata(key) {
      // This could be extended to clean up metadata
    }
  
    /**
     * Clear cache metadata
     */
    clearCacheMetadata() {
      // This could be extended to clean up all metadata
    }
  
    /**
     * Start periodic cleanup
     */
    startPeriodicCleanup() {
      setInterval(() => {
        this.cleanup(true); // localStorage
        this.cleanup(false); // sessionStorage
      }, this.cleanupInterval);
    }
  
    /**
     * Get or set with callback (memoization pattern)
     */
    async memoize(key, fetchFn, ttl = this.defaultTTL, persistent = true) {
      // Try to get from cache first
      const cached = this.get(key, persistent);
      if (cached !== null) {
        return cached;
      }
      
      // Fetch new data
      try {
        const data = await fetchFn();
        this.set(key, data, ttl, persistent);
        return data;
      } catch (error) {
        console.error('Memoize fetch error:', error);
        throw error;
      }
    }
  
    /**
     * Batch operations
     */
    setBatch(items, ttl = this.defaultTTL, persistent = true) {
      const results = [];
      items.forEach(({ key, data }) => {
        results.push(this.set(key, data, ttl, persistent));
      });
      return results;
    }
  
    getBatch(keys, persistent = true) {
      const results = {};
      keys.forEach(key => {
        results[key] = this.get(key, persistent);
      });
      return results;
    }
  }
  
  // Create singleton instance
  export const cacheService = new CacheService();
  export default cacheService;