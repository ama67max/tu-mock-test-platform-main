const leaderboardService = require('../services/leaderboardService');
const prisma = require('../config/db');
const logger = require('../config/logger');

let intervalId = null;

/**
 * Sync leaderboards for exams that have had recent activity.
 * Processes each exam independently so one failure does not break the batch.
 */
const syncActiveLeaderboards = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const activeExams = await prisma.userAttempt.findMany({
      where: {
        status: { in: ['COMPLETED', 'TIME_UP'] },
        submittedAt: { gte: oneDayAgo },
      },
      select: { examId: true },
      distinct: ['examId'],
    });

    if (activeExams.length === 0) {
      logger.info('Leaderboard cache job: no active exams to sync');
      return;
    }

    logger.info(`Leaderboard cache job: syncing ${activeExams.length} exam(s)`);

    for (const { examId } of activeExams) {
      try {
        await leaderboardService.syncFromDatabase(examId);
      } catch (err) {
        logger.error(`Leaderboard sync failed for exam ${examId}`, {
          error: err.message,
        });
      }
    }

    logger.info('Leaderboard cache job: sync cycle completed');
  } catch (err) {
    logger.error('Leaderboard cache job failed', { error: err.message });
  }
};

/**
 * Start the background job.
 * @param {number} intervalMs - Interval in milliseconds (default: 5 minutes)
 */
const start = (intervalMs = 5 * 60 * 1000) => {
  if (intervalId) {
    logger.warn('Leaderboard cache job already running');
    return;
  }

  // Immediate first run for cache warming
  syncActiveLeaderboards();

  intervalId = setInterval(syncActiveLeaderboards, intervalMs);
  logger.info(`Leaderboard cache job started (interval: ${intervalMs}ms)`);
};

/**
 * Stop the background job.
 */
const stop = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Leaderboard cache job stopped');
  }
};

module.exports = {
  start,
  stop,
  syncActiveLeaderboards,
};
