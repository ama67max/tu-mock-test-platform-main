const prisma = require('../config/db');
const { ApiError } = require('../utils/apiResponse');
const { cacheOrFetch, invalidatePattern, invalidate } = require('../utils/cache');

// ── Cache Key Generators ──────────────────────────────────────────────────────
const CACHE_KEYS = {
  USER_RESULTS: (userId, page, limit) => `results:user:${userId}:${page}:${limit}`,
  RESULT_DETAIL: (attemptId) => `results:detail:${attemptId}`,
  ATTEMPT_ANSWERS: (attemptId) => `results:answers:${attemptId}`,
};

// ── Cache TTL Constants (seconds) ─────────────────────────────────────────────
const CACHE_TTL = {
  USER_RESULTS: 60,      // 1 minute - results change when new attempts complete
  RESULT_DETAIL: 300,    // 5 minutes - individual result rarely changes
  ATTEMPT_ANSWERS: 300,  // 5 minutes - answers don't change after submission
};

// ── Percentile Calculation ────────────────────────────────────────────────────
const calculatePercentile = async (examId, score) => {
  const totalCompleted = await prisma.userAttempt.count({
    where: {
      examId,
      status: { in: ['COMPLETED', 'TIME_UP'] },
    },
  });

  if (totalCompleted === 0) return 0;

  const scoresBelow = await prisma.userAttempt.count({
    where: {
      examId,
      status: { in: ['COMPLETED', 'TIME_UP'] },
      score: { lt: score },
    },
  });

  const sameScores = await prisma.userAttempt.count({
    where: {
      examId,
      status: { in: ['COMPLETED', 'TIME_UP'] },
      score,
    },
  });

  // Standard percentile formula
  const percentile = ((scoresBelow + 0.5 * sameScores) / totalCompleted) * 100;
  return Math.round(percentile * 100) / 100;
};

// ── Leaderboard Position ──────────────────────────────────────────────────────
const getLeaderboardPosition = async (examId, userId) => {
  const entry = await prisma.leaderboard.findUnique({
    where: {
      examId_userId: {
        examId,
        userId,
      },
    },
    select: { rank: true, score: true },
  });

  if (!entry) return null;

  // If rank is stale (background job hasn't run), compute approximate rank
  if (!entry.rank) {
    const betterScores = await prisma.leaderboard.count({
      where: { examId, score: { gt: entry.score } },
    });
    return { rank: betterScores + 1, score: entry.score };
  }

  return { rank: entry.rank, score: entry.score };
};

// ── Get Full Result with Review ───────────────────────────────────────────────
const getResult = async (attemptId) => {
  const cacheKey = CACHE_KEYS.RESULT_DETAIL(attemptId);

  return cacheOrFetch(cacheKey, async () => {
    const attempt = await prisma.userAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            description: true,
            durationMinutes: true,
            totalMarks: true,
            passingMarks: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
        answers: {
          orderBy: { id: 'asc' },
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                difficulty: true,
                marks: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new ApiError(404, 'Attempt not found');
    }

    if (attempt.status === 'IN_PROGRESS') {
      throw new ApiError(409, 'This attempt is still in progress');
    }

    const [percentile, position] = await Promise.all([
      calculatePercentile(attempt.examId, attempt.score),
      getLeaderboardPosition(attempt.examId, attempt.userId),
    ]);

    const totalAnswered = (attempt.totalCorrect || 0) + (attempt.totalWrong || 0);
    const accuracy =
      totalAnswered > 0
        ? Math.round(((attempt.totalCorrect || 0) / totalAnswered) * 100 * 100) / 100
        : 0;

    return {
      attempt: {
        id: attempt.id,
        status: attempt.status,
        score: attempt.score,
        totalCorrect: attempt.totalCorrect,
        totalWrong: attempt.totalWrong,
        totalUnanswered: attempt.totalUnanswered,
        timeTakenSec: attempt.timeTakenSec,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
        accuracy,
        percentile,
        rank: position?.rank || null,
      },
      exam: attempt.exam,
      answers: attempt.answers.map((a) => ({
        questionId: a.questionId,
        questionText: a.question.questionText,
        options: a.question.options,
        selectedOption: a.selectedOption,
        correctAnswer: a.question.correctAnswer,
        explanation: a.question.explanation,
        difficulty: a.question.difficulty,
        marks: a.question.marks,
        marksObtained: a.marksObtained,
        isCorrect: a.isCorrect,
        timeTakenSec: a.timeTakenSec,
      })),
    };
  }, CACHE_TTL.RESULT_DETAIL);
};

// ── User Attempt History ──────────────────────────────────────────────────────
const getUserResults = async (userId, { page = 1, limit = 10 }) => {
  const cacheKey = CACHE_KEYS.USER_RESULTS(userId, page, limit);

  return cacheOrFetch(cacheKey, async () => {
    const skip = (page - 1) * limit;

    const [attempts, total] = await prisma.$transaction([
      prisma.userAttempt.findMany({
        where: {
          userId,
          status: { in: ['COMPLETED', 'TIME_UP'] },
        },
        include: {
          exam: {
            select: {
              id: true,
              title: true,
              durationMinutes: true,
              totalMarks: true,
              passingMarks: true,
              category: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.userAttempt.count({
        where: {
          userId,
          status: { in: ['COMPLETED', 'TIME_UP'] },
        },
      }),
    ]);

    return {
      attempts,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }, CACHE_TTL.USER_RESULTS);
};

const getAttemptAnswers = async (attemptId) => {
  const cacheKey = CACHE_KEYS.ATTEMPT_ANSWERS(attemptId);

  return cacheOrFetch(cacheKey, async () => {
    const attempt = await prisma.userAttempt.findUnique({
      where: { id: attemptId },
      include: {
        answers: {
          orderBy: { id: 'asc' },
          include: {
            question: {
              select: {
                id: true,
                questionText: true,
                options: true,
                correctAnswer: true,
                explanation: true,
                marks: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new ApiError(404, 'Attempt not found');
    }

    if (attempt.status === 'IN_PROGRESS') {
      throw new ApiError(409, 'This attempt is still in progress');
    }

    return attempt.answers.map((answer) => ({
      questionId: answer.questionId,
      questionText: answer.question.questionText,
      options: answer.question.options,
      selectedOption: answer.selectedOption,
      correctAnswer: answer.question.correctAnswer,
      explanation: answer.question.explanation,
      marks: answer.question.marks,
      marksObtained: answer.marksObtained,
      isCorrect: answer.isCorrect,
      timeTakenSec: answer.timeTakenSec,
    }));
  }, CACHE_TTL.ATTEMPT_ANSWERS);
};

// ── Cache Invalidation ────────────────────────────────────────────────────────
/**
 * Invalidate user's results cache (call after exam submission)
 * @param {string|number} userId - User ID
 */
const invalidateUserResults = async (userId) => {
  await invalidatePattern(`results:user:${userId}:*`);
};

/**
 * Invalidate specific result cache
 * @param {string|number} attemptId - Attempt ID
 */
const invalidateResult = async (attemptId) => {
  await invalidate(CACHE_KEYS.RESULT_DETAIL(attemptId));
  await invalidate(CACHE_KEYS.ATTEMPT_ANSWERS(attemptId));
};

module.exports = {
  getResult,
  getUserResults,
  getAttemptAnswers,
  calculatePercentile,
  getLeaderboardPosition,
  invalidateUserResults,
  invalidateResult,
};
