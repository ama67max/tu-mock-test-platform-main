/**
 * Exam Timer Utilities
 *
 * Pure, stateless functions for server-side time validation.
 * All functions accept Date objects and return primitives.
 */

/**
 * Check if an exam attempt has exceeded its allotted duration.
 * @param {Date} startedAt - When the attempt began
 * @param {number} durationMinutes - Exam duration in minutes
 * @returns {boolean}
 */
const isExpired = (startedAt, durationMinutes) => {
  const now = Date.now();
  const start = new Date(startedAt).getTime();
  const elapsedMs = now - start;
  const durationMs = durationMinutes * 60 * 1000;
  return elapsedMs > durationMs;
};

/**
 * Get elapsed seconds since the attempt started.
 * @param {Date} startedAt
 * @returns {number} Whole seconds elapsed
 */
const getElapsedSeconds = (startedAt) => {
  return Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
};

/**
 * Get remaining seconds for an active attempt.
 * Returns 0 if time has expired.
 * @param {Date} startedAt
 * @param {number} durationMinutes
 * @returns {number} Whole seconds remaining
 */
const getRemainingSeconds = (startedAt, durationMinutes) => {
  const elapsed = getElapsedSeconds(startedAt);
  const total = durationMinutes * 60;
  return Math.max(total - elapsed, 0);
};

/**
 * Reconcile client-reported time with server-authoritative elapsed time.
 * Prevents clients from cheating by reporting false times.
 * @param {Date} startedAt
 * @param {number} clientTimeTakenSec - Time reported by client
 * @param {number} durationMinutes - Maximum allowed time
 * @returns {number} Finalized time taken in seconds
 */
const calculateTimeTaken = (startedAt, clientTimeTakenSec, durationMinutes) => {
  const serverElapsed = getElapsedSeconds(startedAt);
  const maxTime = durationMinutes * 60;

  // Client cannot report more than server has measured
  const clampedClient = Math.min(Math.max(clientTimeTakenSec, 0), serverElapsed);
  
  // Cap at exam duration
  return Math.min(clampedClient, maxTime);
};

/**
 * Format seconds into MM:SS display string.
 * @param {number} totalSeconds
 * @returns {string} e.g. "45:03"
 */
const formatDuration = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

module.exports = {
  isExpired,
  getElapsedSeconds,
  getRemainingSeconds,
  calculateTimeTaken,
  formatDuration,
};
