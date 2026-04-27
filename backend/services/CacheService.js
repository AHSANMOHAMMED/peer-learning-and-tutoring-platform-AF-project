let redis;
try {
  redis = require('redis');
} catch (e) {
  console.warn('⚠️  Redis module not found. Caching will be disabled.');
}

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.defaultTTL = 300; // 5 minutes default
    this.keyPrefix = 'peerlearn:';
    
    // Initialize Redis connection if URL is provided
    if (process.env.REDIS_URL) {
      this.initializeRedis();
    }
  }

  async initializeRedis() {
    try {
      if (!redis) {
        console.warn('⚠️  Redis initialization skipped: module not found.');
        return;
      }
      this.client = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          connectTimeout: 1000,
          reconnectStrategy: (retries) => {
            if (process.env.NODE_ENV !== 'production') {
              return false;
            }

            if (retries > 10) {
              return new Error('Max Redis reconnection attempts');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        if (process.env.NODE_ENV === 'production') {
          console.error('Redis Client Error:', err);
        } else {
          console.warn('Redis unavailable; caching disabled.');
        }
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.log('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        console.error('Redis initialization error:', error);
      } else {
        console.warn('Redis unavailable; caching disabled.');
      }
      this.isConnected = false;
      this.client = null;
    }
  }

  /**
   * Get value from cache
   * @param {String} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        return null;
      }

      const fullKey = this.keyPrefix + key;
      const value = await this.client.get(fullKey);
      
      if (value) {
        return JSON.parse(value);
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {String} key - Cache key
   * @param {any} value - Value to cache
   * @param {Number} ttl - Time to live in seconds
   * @returns {Promise<Boolean>} Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const fullKey = this.keyPrefix + key;
      const serializedValue = JSON.stringify(value);
      
      await this.client.setEx(fullKey, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {String} key - Cache key
   * @returns {Promise<Boolean>} Success status
   */
  async delete(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const fullKey = this.keyPrefix + key;
      await this.client.del(fullKey);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Get multiple values from cache
   * @param {Array<String>} keys - Array of cache keys
   * @returns {Promise<Object>} Object with key-value pairs
   */
  async mget(keys) {
    try {
      if (!this.isConnected || !this.client) {
        return {};
      }

      const fullKeys = keys.map(k => this.keyPrefix + k);
      const values = await this.client.mGet(fullKeys);
      
      const result = {};
      keys.forEach((key, index) => {
        if (values[index]) {
          result[key] = JSON.parse(values[index]);
        }
      });
      
      return result;
    } catch (error) {
      console.error('Cache mget error:', error);
      return {};
    }
  }

  /**
   * Set multiple values in cache
   * @param {Object} keyValues - Object with key-value pairs
   * @param {Number} ttl - Time to live in seconds
   * @returns {Promise<Boolean>} Success status
   */
  async mset(keyValues, ttl = this.defaultTTL) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const pipeline = this.client.multi();
      
      Object.entries(keyValues).forEach(([key, value]) => {
        const fullKey = this.keyPrefix + key;
        pipeline.setEx(fullKey, ttl, JSON.stringify(value));
      });
      
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   * @param {String} key - Cache key
   * @returns {Promise<Boolean>} Existence status
   */
  async exists(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const fullKey = this.keyPrefix + key;
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get cached data or fetch from source
   * @param {String} key - Cache key
   * @param {Function} fetchFn - Function to fetch data if not cached
   * @param {Number} ttl - Time to live in seconds
   * @returns {Promise<any>} Data
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch from source
    try {
      const data = await fetchFn();
      
      // Cache the result
      await this.set(key, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Fetch error in getOrSet:', error);
      throw error;
    }
  }

  /**
   * Invalidate cache by pattern
   * @param {String} pattern - Key pattern to match (e.g., 'users:*')
 * @returns {Promise<Number>} Number of keys deleted
   */
  async invalidatePattern(pattern) {
    try {
      if (!this.isConnected || !this.client) {
        return 0;
      }

      const fullPattern = this.keyPrefix + pattern;
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      
      return keys.length;
    } catch (error) {
      console.error('Cache invalidate pattern error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<Boolean>} Success status
   */
  async clear() {
    try {
      if (!this.isConnected || !this.client) {
        return false;
      }

      const keys = await this.client.keys(this.keyPrefix + '*');
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache stats
   */
  async getStats() {
    try {
      if (!this.isConnected || !this.client) {
        return { status: 'disconnected' };
      }

      const info = await this.client.info('memory');
      const keys = await this.client.keys(this.keyPrefix + '*');
      
      return {
        status: 'connected',
        keyCount: keys.length,
        memoryInfo: info,
        isConnected: this.isConnected
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Cache decorator for functions
   * @param {Function} fn - Function to cache
   * @param {Number} ttl - Time to live in seconds
   * @returns {Function} Cached function
   */
  cacheFn(fn, ttl = this.defaultTTL) {
    return async (...args) => {
      const key = `${fn.name}:${JSON.stringify(args)}`;
      return this.getOrSet(key, () => fn(...args), ttl);
    };
  }

  /**
   * Get leaderboard from cache or compute
   * @param {String} type - Leaderboard type
   * @param {Function} computeFn - Function to compute leaderboard
   * @returns {Promise<Array>} Leaderboard data
   */
  async getLeaderboard(type, computeFn) {
    return this.getOrSet(
      `leaderboard:${type}`,
      computeFn,
      300 // 5 minutes for leaderboards
    );
  }

  /**
   * Cache tutor listings
   * @param {Object} filters - Search filters
   * @param {Function} fetchFn - Function to fetch tutors
   * @returns {Promise<Array>} Tutor listings
   */
  async getTutors(filters, fetchFn) {
    const key = `tutors:${JSON.stringify(filters)}`;
    return this.getOrSet(key, fetchFn, 180); // 3 minutes
  }

  /**
   * Cache session data
   * @param {String} sessionId - Session ID
   * @param {Function} fetchFn - Function to fetch session
   * @returns {Promise<Object>} Session data
   */
  async getSession(sessionId, fetchFn) {
    const key = `session:${sessionId}`;
    return this.getOrSet(key, fetchFn, 60); // 1 minute for active sessions
  }

  /**
   * Cache user profile
   * @param {String} userId - User ID
   * @param {Function} fetchFn - Function to fetch user
   * @returns {Promise<Object>} User data
   */
  async getUser(userId, fetchFn) {
    const key = `user:${userId}`;
    return this.getOrSet(key, fetchFn, 600); // 10 minutes for user profiles
  }

  /**
   * Invalidate user cache
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} Success status
   */
  async invalidateUser(userId) {
    await this.delete(`user:${userId}`);
    await this.invalidatePattern(`user:${userId}:*`);
    return true;
  }

  /**
   * Invalidate session cache
   * @param {String} sessionId - Session ID
   * @returns {Promise<Boolean>} Success status
   */
  async invalidateSession(sessionId) {
    await this.delete(`session:${sessionId}`);
    await this.invalidatePattern(`session:${sessionId}:*`);
    return true;
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;
