const rateLimit = require('express-rate-limit');
const redis = require('../config/redis');
const config = require('../config/env');

/**
 * Custom Redis Store for express-rate-limit v7.
 * Uses atomic MULTI/INCR/PEXPIRE for high-concurrency safety.
 * Fails open (returns 0 hits) if Redis is unavailable.
 */
class RedisRateLimitStore {
  constructor(prefix = 'rl') {
    this.prefix = prefix;
    this.windowMs = 900000;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  async increment(key) {
    const fullKey = `${this.prefix}:${key}`;

    try {
      const results = await redis
        .multi()
        .incr(fullKey)
        .pexpire(fullKey, this.windowMs)
        .exec();

      const totalHits = results[0][1];
      return {
        totalHits,
        resetTime: new Date(Date.now() + this.windowMs),
      };
    } catch (err) {
      // Fail open: if Redis is down, do not block the user
      return {
        totalHits: 0,
        resetTime: new Date(Date.now() + this.windowMs),
      };
    }
  }

  async decrement(key) {
    try {
      await redis.decr(`${this.prefix}:${key}`);
    } catch {
      // Silently ignore Redis errors on decrement
    }
  }

  async resetKey(key) {
    try {
      await redis.del(`${this.prefix}:${key}`);
    } catch {
      // Silently ignore Redis errors on reset
    }
  }
}

// ── General API Rate Limiter ──────────────────────────────────────────────────
const apiRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  store: new RedisRateLimitStore('rl:api'),
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

// ── Auth Endpoint Rate Limiter (stricter) ─────────────────────────────────────
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 attempts per window (increased for load testing)
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore('rl:auth'),
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again after 15 minutes.',
    });
  },
});

module.exports = {
  apiRateLimiter,
  authRateLimiter,
};
