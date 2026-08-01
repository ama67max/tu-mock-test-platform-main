const http = require('http');
const app = require('./app');
const config = require('./config/env');
const logger = require('./config/logger');
const prisma = require('./config/db');
const redis = require('./config/redis');
const leaderboardCacheJob = require('./jobs/leaderboardCacheJob');
const examExpiryJob = require('./jobs/examExpiryJob');

const PORT = config.PORT;

const server = http.createServer(app);

server.listen(PORT, (err) => {
  if (err) {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  }

  logger.info(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);

  // Start background jobs after server is live and DB is connected
  leaderboardCacheJob.start();
  examExpiryJob.start();
});

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  // Stop background jobs first to prevent new work during shutdown
  leaderboardCacheJob.stop();
  examExpiryJob.stop();

  server.close(async () => {
    logger.info('HTTP server closed. No longer accepting connections.');

    try {
      await redis.quit();
      logger.info('Redis connection closed gracefully');
    } catch (err) {
      logger.error('Error closing Redis connection', { error: err.message });
    }

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed gracefully');
    } catch (err) {
      logger.error('Error closing database connection', { error: err.message });
    }

    logger.info('Graceful shutdown complete. Exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Graceful shutdown timed out after 15s. Forcing exit.');
    process.exit(1);
  }, 15000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', {
    error: err.message,
    stack: err.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason: String(reason) });
  process.exit(1);
});
