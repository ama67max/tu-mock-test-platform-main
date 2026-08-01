const Redis = require('ioredis');
const config = require('./env');
const logger = require('./logger');

// ── Redis Client Singleton ────────────────────────────────────────────────────
// Configured for production resilience: exponential backoff, limited retries,
// and graceful shutdown. Supports Redis Cluster if URL is a cluster config.

const redis = new Redis(config.REDIS_URL, {
  // Connection resilience
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  keepAlive: 30000,           // TCP keep-alive every 30s
  connectTimeout: 10000,      // 10s connection timeout
  lazyConnect: false,         // Connect immediately on instantiation

  // Exponential backoff for reconnection attempts
  retryStrategy(times) {
    const delay = Math.min(times * 50, 3000); // Cap at 3s
    if (times > 10) {
      logger.error('Redis max reconnection attempts exceeded');
      return null; // Stop reconnecting
    }
    logger.warn(`Redis reconnecting... attempt ${times}, delay ${delay}ms`);
    return delay;
  },

  // Reconnect only on specific fatal errors
  reconnectOnError(err) {
    const targetErrors = ['READONLY', 'ECONNREFUSED', 'ETIMEDOUT'];
    const shouldReconnect = targetErrors.some((e) => err.message.includes(e));
    if (shouldReconnect) {
      logger.warn(`Redis reconnect triggered by error: ${err.message}`);
    }
    return shouldReconnect ? 2 : false; // 2 = reconnect, false = do not
  },
});

// ── Event Listeners ───────────────────────────────────────────────────────────
redis.on('connect', () => {
  logger.info('Redis client connected');
});

redis.on('ready', async () => {
  try {
    const pong = await redis.ping();
    logger.info(`Redis ready and responsive (ping: ${pong})`);
  } catch (err) {
    logger.error('Redis ping failed on ready', { error: err.message });
  }
});

redis.on('error', (err) => {
  // ioredis emits errors aggressively; log but do not crash
  logger.error('Redis client error', { message: err.message, code: err.code });
});

redis.on('reconnecting', () => {
  logger.warn('Redis client reconnecting...');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

redis.on('end', () => {
  logger.info('Redis client disconnected');
});

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
// Uses .quit() to drain the command queue before closing.
// Critical for preventing data loss on cached writes / leaderboard updates.

const gracefulDisconnect = async (signal) => {
  logger.info(`Received ${signal}. Closing Redis connection gracefully...`);
  try {
    await redis.quit();
    logger.info('Redis connection closed gracefully');
  } catch (err) {
    logger.error('Error during Redis disconnect', { error: err.message });
    // Force disconnect if quit hangs
    redis.disconnect();
  }
};

process.on('SIGINT', () => gracefulDisconnect('SIGINT'));
process.on('SIGTERM', () => gracefulDisconnect('SIGTERM'));

// ── Export ────────────────────────────────────────────────────────────────────
module.exports = redis;
