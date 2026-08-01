const redis = require('../config/redis');
const logger = require('../config/logger');

/**
 * Cache Service
 *
 * Thin abstraction over Redis with automatic JSON serialization,
 * TTL support, and fail-open error handling.
 */

const get = async (key) => {
  try {
    const value = await redis.get(key);
    if (value === null) return null;
    return JSON.parse(value);
  } catch (err) {
    logger.warn('Cache get failed', { key, error: err.message });
    return null;
  }
};

const set = async (key, value, ttlSeconds) => {
  try {
    const serialized = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await redis.setex(key, ttlSeconds, serialized);
    } else {
      await redis.set(key, serialized);
    }
  } catch (err) {
    logger.warn('Cache set failed', { key, error: err.message });
  }
};

const setex = async (key, ttlSeconds, value) => {
  return set(key, value, ttlSeconds);
};

const del = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    logger.warn('Cache del failed', { key, error: err.message });
  }
};

const exists = async (key) => {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (err) {
    logger.warn('Cache exists failed', { key, error: err.message });
    return false;
  }
};

const flushPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      return keys.length;
    }
    return 0;
  } catch (err) {
    logger.warn('Cache flushPattern failed', { pattern, error: err.message });
    return 0;
  }
};

/**
 * Read-through cache helper.
 * @param {string} key
 * @param {Function} factory - Async function that returns the value on cache miss
 * @param {number} [ttlSeconds] - Optional TTL
 */
const getOrSet = async (key, factory, ttlSeconds) => {
  const cached = await get(key);
  if (cached !== null) return cached;

  const value = await factory();

  // Set cache asynchronously; don't block response on Redis failure
  set(key, value, ttlSeconds).catch(() => {});

  return value;
};

module.exports = {
  get,
  set,
  setex,
  del,
  exists,
  flushPattern,
  getOrSet,
};
