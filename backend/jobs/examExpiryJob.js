const prisma = require('../config/db');
const attemptService = require('../services/attemptService');
const { isExpired } = require('../utils/examTimer');
const logger = require('../config/logger');

let intervalId = null;

/**
 * Scan for expired IN_PROGRESS attempts and auto-submit them.
 * Processes each attempt independently so one failure does not break the batch.
 */
const scanAndExpire = async () => {
  try {
    const activeAttempts = await prisma.userAttempt.findMany({
      where: { status: 'IN_PROGRESS' },
      include: {
        exam: { select: { id: true, durationMinutes: true } },
      },
    });

    if (activeAttempts.length === 0) return;

    let expiredCount = 0;

    for (const attempt of activeAttempts) {
      try {
        if (isExpired(attempt.startedAt, attempt.exam.durationMinutes)) {
          await attemptService.autoSubmitAttempt(attempt.id);
          expiredCount++;
        }
      } catch (err) {
        logger.error(`Auto-submit failed for attempt ${attempt.id}`, {
          error: err.message,
        });
      }
    }

    if (expiredCount > 0) {
      logger.info(`Exam expiry job: auto-submitted ${expiredCount} expired attempt(s)`);
    }
  } catch (err) {
    logger.error('Exam expiry job failed', { error: err.message });
  }
};

/**
 * Start the background job.
 * @param {number} intervalMs - Interval in milliseconds (default: 60 seconds)
 */
const start = (intervalMs = 60 * 1000) => {
  if (intervalId) {
    logger.warn('Exam expiry job already running');
    return;
  }

  scanAndExpire();

  intervalId = setInterval(scanAndExpire, intervalMs);
  logger.info(`Exam expiry job started (interval: ${intervalMs}ms)`);
};

/**
 * Stop the background job.
 */
const stop = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    logger.info('Exam expiry job stopped');
  }
};

module.exports = {
  start,
  stop,
  scanAndExpire,
};
