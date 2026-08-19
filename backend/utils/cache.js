const redis = require('../config/redis');
const logger = require('../config/logger');

/**
 * Cache Utility Module
 * Provides Redis caching with TTL support and invalidation patterns
 */

/**
 * Get from cache or execute function and cache result
 * @param {string} key - Cache key
 * @param {Function} fn - Async function to execute if cache miss
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 min)
 * @returns {Promise<any>} - Cached or fresh result
 */
async function cacheOrFetch(key, fn, ttl = 300) {
  try {
    // Try to get from cache first
    const cached = await redis.get(key);
    
    if (cached !== null) {
      logger.debug(`[Cache HIT] ${key}`);
      return JSON.parse(cached);
    }

    logger.debug(`[Cache MISS] ${key}`);
    
    // Execute the function to get fresh data
    const result = await fn();

    // Only cache non-null/non-undefined results
    if (result !== null && result !== undefined) {
      await redis.setex(key, ttl, JSON.stringify(result));
      logger.debug(`[Cache SET] ${key} (TTL: ${ttl}s)`);
    }

    return result;
  } catch (err) {
    // On cache error, fall back to direct execution
    logger.error(`[Cache ERROR] ${key}: ${err.message}`);
    return fn();
  }
}

/**
 * Get multiple keys at once
 * @param {string[]} keys - Array of cache keys
 * @returns {Promise<Object>} - Object with key-value pairs
 */
async function getMultiple(keys) {
  if (!keys || keys.length === 0) return {};
  
  try {
    const values = await redis.mget(keys);
    const result = {};
    
    keys.forEach((key, index) => {
      if (values[index] !== null) {
        result[key] = JSON.parse(values[index]);
      }
    });
    
    return result;
  } catch (err) {
    logger.error(`[Cache MGET ERROR]: ${err.message}`);
    return {};
  }
}

/**
 * Set multiple keys at once
 * @param {Object} keyValuePairs - Object with key-value pairs
 * @param {number} ttl - Time to live in seconds
 */
async function setMultiple(keyValuePairs, ttl = 300) {
  if (!keyValuePairs || Object.keys(keyValuePairs).length === 0) return;
  
  try {
    const multi = redis.multi();
    
    Object.entries(keyValuePairs).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        multi.setex(key, ttl, JSON.stringify(value));
      }
    });
    
    await multi.exec();
    logger.debug(`[Cache MSET] ${Object.keys(keyValuePairs).length} keys (TTL: ${ttl}s)`);
  } catch (err) {
    logger.error(`[Cache MSET ERROR]: ${err.message}`);
  }
}

/**
 * Invalidate a single cache key
 * @param {string} key - Cache key to delete
 */
async function invalidate(key) {
  try {
    const result = await redis.del(key);
    if (result > 0) {
      logger.debug(`[Cache INVALIDATE] ${key}`);
    }
    return result;
  } catch (err) {
    logger.error(`[Cache INVALIDATE ERROR] ${key}: ${err.message}`);
    return 0;
  }
}

/**
 * Invalidate multiple cache keys by pattern
 * @param {string} pattern - Key pattern (e.g., 'exams:*', 'analytics:user:123:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
async function invalidatePattern(pattern) {
  try {
    // Use SCAN instead of KEYS for production safety
    const keys = [];
    let cursor = '0';
    
    do {
      const [nextCursor, matchedKeys] = await redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100
      );
      cursor = nextCursor;
      keys.push(...matchedKeys);
    } while (cursor !== '0');
    
    if (keys.length > 0) {
      await redis.del(keys);
      logger.debug(`[Cache INVALIDATE PATTERN] ${pattern} - ${keys.length} keys deleted`);
    }
    
    return keys.length;
  } catch (err) {
    logger.error(`[Cache INVALIDATE PATTERN ERROR] ${pattern}: ${err.message}`);
    return 0;
  }
}

/**
 * Invalidate all keys matching multiple patterns
 * @param {string[]} patterns - Array of patterns
 */
async function invalidatePatterns(patterns) {
  if (!patterns || patterns.length === 0) return;
  
  const results = await Promise.all(
    patterns.map(pattern => invalidatePattern(pattern))
  );
  
  const totalDeleted = results.reduce((sum, count) => sum + count, 0);
  logger.debug(`[Cache BATCH INVALIDATE] ${totalDeleted} total keys deleted`);
}

/**
 * Get cache statistics
 * @returns {Promise<Object>} - Cache stats
 */
async function getStats() {
  try {
    const info = await redis.info('memory');
    const dbSize = await redis.dbsize();
    
    return {
      totalKeys: dbSize,
      memoryInfo: info,
    };
  } catch (err) {
    logger.error(`[Cache STATS ERROR]: ${err.message}`);
    return { totalKeys: 0, memoryInfo: null };
  }
}

/**
 * Check if a key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>}
 */
async function exists(key) {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (err) {
    logger.error(`[Cache EXISTS ERROR] ${key}: ${err.message}`);
    return false;
  }
}

/**
 * Get TTL remaining for a key
 * @param {string} key - Cache key
 * @returns {Promise<number>} - TTL in seconds, -1 if no expiry, -2 if key doesn't exist
 */
async function getTTL(key) {
  try {
    return await redis.ttl(key);
  } catch (err) {
    logger.error(`[Cache TTL ERROR] ${key}: ${err.message}`);
    return -2;
  }
}

/**
 * Refresh TTL for an existing key
 * @param {string} key - Cache key
 * @param {number} ttl - New TTL in seconds
 * @returns {Promise<boolean>}
 */
async function refreshTTL(key, ttl) {
  try {
    const result = await redis.expire(key, ttl);
    return result === 1;
  } catch (err) {
    logger.error(`[Cache REFRESH TTL ERROR] ${key}: ${err.message}`);
    return false;
  }
}

module.exports = {
  cacheOrFetch,
  getMultiple,
  setMultiple,
  invalidate,
  invalidatePattern,
  invalidatePatterns,
  getStats,
  exists,
  getTTL,
  refreshTTL,
};
