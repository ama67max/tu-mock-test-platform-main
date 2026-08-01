const redis = require('../config/redis');
const prisma = require('../config/db');
const logger = require('../config/logger');

const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const MAX_EPOCH_SEC = 2000000000; // ~ year 2033

// ── Key Builders ──────────────────────────────────────────────────────────────
const getLeaderboardKey = (examId) => `leaderboard:exam:${examId}`;
const getScoresKey = (examId) => `leaderboard:exam:${examId}:scores`;

// ── Composite Score (Tie-Breaking) ────────────────────────────────────────────
// Higher raw score always wins. For ties, earlier completion wins.
// Safe inside IEEE 754 double (max ~9e15 exact integer).
const buildCompositeScore = (score, completedAt) => {
  const ts = Math.floor(new Date(completedAt).getTime() / 1000);
  return score * 1e9 + (MAX_EPOCH_SEC - ts);
};

// ── Enrich Rank Entries with User Data ────────────────────────────────────────
const enrichEntries = async (examId, entries) => {
  if (entries.length === 0) return [];

  const userIds = entries.map((e) => e.userId);
  const rawScores = await redis.hmget(getScoresKey(examId), ...userIds);

  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, fullName: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.fullName]));

  return entries.map((entry, idx) => ({
    rank: entry.rank,
    userId: entry.userId,
    fullName: userMap.get(entry.userId) || 'Unknown',
    score: parseInt(rawScores[idx], 10) || 0,
  }));
};

// ── Update Entry ──────────────────────────────────────────────────────────────
const updateEntry = async (examId, userId, score, completedAt) => {
  const key = getLeaderboardKey(examId);
  const scoresKey = getScoresKey(examId);
  const composite = buildCompositeScore(score, completedAt);

  const pipeline = redis.pipeline();
  pipeline.zadd(key, composite, userId);
  pipeline.hset(scoresKey, userId, score);
  pipeline.expire(key, TTL_SECONDS);
  pipeline.expire(scoresKey, TTL_SECONDS);

  await pipeline.exec();
};

// ── Get Top N ─────────────────────────────────────────────────────────────────
const getTopN = async (examId, n = 10) => {
  const key = getLeaderboardKey(examId);
  const results = await redis.zrevrange(key, 0, n - 1, 'WITHSCORES');

  const entries = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      rank: i / 2,
      userId: results[i],
    });
  }

  return enrichEntries(examId, entries);
};

// ── Get User Rank ─────────────────────────────────────────────────────────────
const getUserRank = async (examId, userId) => {
  const key = getLeaderboardKey(examId);
  const scoresKey = getScoresKey(examId);

  const [rank, rawScore] = await Promise.all([
    redis.zrevrank(key, userId),
    redis.hget(scoresKey, userId),
  ]);

  if (rank === null) return null;

  return {
    rank: rank + 1, // 1-based
    score: parseInt(rawScore, 10) || 0,
  };
};

// ── Get Leaderboard Page ──────────────────────────────────────────────────────
const getLeaderboardPage = async (examId, page = 1, limit = 50) => {
  const key = getLeaderboardKey(examId);
  const start = (page - 1) * limit;
  const stop = start + limit - 1;

  const [results, total] = await Promise.all([
    redis.zrevrange(key, start, stop, 'WITHSCORES'),
    redis.zcard(key),
  ]);

  const entries = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      rank: start + i / 2,
      userId: results[i],
    });
  }

  const leaderboard = await enrichEntries(examId, entries);

  return {
    leaderboard,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

// ── Get Nearby Ranks ──────────────────────────────────────────────────────────
const getNearbyRanks = async (examId, userId, range = 2) => {
  const key = getLeaderboardKey(examId);
  const rank = await redis.zrevrank(key, userId);

  if (rank === null) return [];

  const start = Math.max(0, rank - range);
  const stop = rank + range;

  const results = await redis.zrevrange(key, start, stop, 'WITHSCORES');

  const entries = [];
  for (let i = 0; i < results.length; i += 2) {
    entries.push({
      rank: start + i / 2,
      userId: results[i],
    });
  }

  return enrichEntries(examId, entries);
};

// ── Sync from Database ────────────────────────────────────────────────────────
const syncFromDatabase = async (examId) => {
  const entries = await prisma.leaderboard.findMany({
    where: { examId },
    select: { userId: true, score: true, completedAt: true },
  });

  const key = getLeaderboardKey(examId);
  const scoresKey = getScoresKey(examId);

  // Clear existing Redis data first
  const pipeline = redis.pipeline();
  pipeline.del(key);
  pipeline.del(scoresKey);

  for (const entry of entries) {
    const composite = buildCompositeScore(entry.score, entry.completedAt);
    pipeline.zadd(key, composite, entry.userId);
    pipeline.hset(scoresKey, entry.userId, entry.score);
  }

  pipeline.expire(key, TTL_SECONDS);
  pipeline.expire(scoresKey, TTL_SECONDS);

  await pipeline.exec();

  logger.info('Leaderboard synced from database', { examId, synced: entries.length });

  return { synced: entries.length };
};

// ── Delete Leaderboard ────────────────────────────────────────────────────────
const deleteLeaderboard = async (examId) => {
  const key = getLeaderboardKey(examId);
  const scoresKey = getScoresKey(examId);
  await redis.del(key, scoresKey);
};

module.exports = {
  updateEntry,
  getTopN,
  getUserRank,
  getLeaderboardPage,
  getNearbyRanks,
  syncFromDatabase,
  deleteLeaderboard,
};
