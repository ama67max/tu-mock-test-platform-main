const { PrismaClient } = require('@prisma/client');
const config = require('./env');
const logger = require('./logger');

// ── Prisma Client Singleton ───────────────────────────────────────────────────
// Prevents multiple instances in development during hot-reload (nodemon).
// In production, always creates a fresh instance.

const prisma = globalThis.__prisma || new PrismaClient({
  log: config.isDevelopment
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ]
    : [{ emit: 'event', level: 'error' }],
});

// Store singleton reference in development to survive hot-reloads
if (config.isDevelopment) {
  globalThis.__prisma = prisma;
}

// ── Query Logging Middleware (Development Only) ───────────────────────────────
if (config.isDevelopment) {
  prisma.$on('query', (e) => {
    // Log slow queries (> 1000ms) as warnings
    if (e.duration > 1000) {
      logger.warn('Slow query detected', {
        query: e.query,
        params: e.params,
        durationMs: e.duration,
      });
    }
  });

  prisma.$on('error', (e) => {
    logger.error('Prisma Client Error', { message: e.message });
  });
}

// ── Connection Health Check ───────────────────────────────────────────────────
(async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully via Prisma');
  } catch (err) {
    logger.error('Database connection failed', { error: err.message, stack: err.stack });
    // Fail fast — do not start server without DB
    process.exit(1);
  }
})();

// ── Graceful Shutdown ─────────────────────────────────────────────────────────
// Releases connections back to the pool before process exit.
// Critical for zero-downtime deployments and connection limit compliance.

const gracefulDisconnect = async (signal) => {
  logger.info(`Received ${signal}. Disconnecting Prisma Client...`);
  try {
    await prisma.$disconnect();
    logger.info('Prisma Client disconnected gracefully');
  } catch (err) {
    logger.error('Error during Prisma disconnect', { error: err.message });
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulDisconnect('SIGINT'));
process.on('SIGTERM', () => gracefulDisconnect('SIGTERM'));

// ── Export ────────────────────────────────────────────────────────────────────
module.exports = prisma;
