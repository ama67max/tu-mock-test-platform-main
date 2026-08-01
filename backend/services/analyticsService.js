const { Prisma } = require('@prisma/client');
const prisma = require('../config/db');
const { ApiError } = require('../utils/apiResponse');

// ── System-Wide Stats (Admin Dashboard KPIs) ──────────────────────────────────
const getSystemStats = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [totalUsers, totalExams, totalQuestions, totalAttempts, activeAttemptsToday] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.exam.count(),
      prisma.question.count(),
      prisma.userAttempt.count({
        where: { status: { in: ['COMPLETED', 'TIME_UP'] } },
      }),
      prisma.userAttempt.count({
        where: { startedAt: { gte: todayStart } },
      }),
    ]);

  return {
    totalUsers,
    totalExams,
    totalQuestions,
    totalAttempts,
    activeAttemptsToday,
  };
};

// ── Category Breakdown (Admin Dashboard) ──────────────────────────────────────
const getCategoryBreakdown = async () => {
  const breakdown = await prisma.$queryRaw`
    WITH category_base AS (
      SELECT 
        c.id,
        c.name,
        c.slug,
        (SELECT COUNT(*)::int FROM exams WHERE category_id = c.id) as total_exams,
        (SELECT COUNT(*)::int FROM questions WHERE category_id = c.id) as total_questions
      FROM categories c
    ),
    attempt_agg AS (
      SELECT 
        e.category_id,
        COUNT(ua.id)::int as total_attempts,
        AVG(ua.score)::float as average_score
      FROM user_attempts ua
      JOIN exams e ON e.id = ua.exam_id
      WHERE ua.status IN ('COMPLETED', 'TIME_UP')
      GROUP BY e.category_id
    )
    SELECT 
      cb.id as category_id,
      cb.name as category_name,
      cb.slug,
      cb.total_exams,
      cb.total_questions,
      COALESCE(aa.total_attempts, 0) as total_attempts,
      COALESCE(aa.average_score, 0) as average_score
    FROM category_base cb
    LEFT JOIN attempt_agg aa ON aa.category_id = cb.id
    ORDER BY cb.name ASC
  `;

  return breakdown;
};

// ── Attempt Trends (Time Series) ──────────────────────────────────────────────
const getAttemptTrends = async ({ days = 30, userId } = {}) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  const userFilter = userId ? Prisma.sql`AND user_id = ${userId}` : Prisma.empty;

  const trends = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('day', started_at)::date as date,
      COUNT(*)::int as attempts,
      COALESCE(AVG(score), 0)::float as average_score
    FROM user_attempts
    WHERE started_at >= ${cutoffDate}
      AND status IN ('COMPLETED', 'TIME_UP')
      ${userFilter}
    GROUP BY DATE_TRUNC('day', started_at)::date
    ORDER BY date ASC
  `;

  return trends;
};

// ── Student Personal Analytics ────────────────────────────────────────────────
const getStudentAnalytics = async (userId) => {
  // Base aggregates
  const [attemptMeta, recentAttempts] = await prisma.$transaction([
    prisma.userAttempt.aggregate({
      where: {
        userId,
        status: { in: ['COMPLETED', 'TIME_UP'] },
      },
      _count: { id: true },
      _avg: { score: true },
      _sum: { timeTakenSec: true, totalCorrect: true, totalWrong: true },
    }),
    prisma.userAttempt.findMany({
      where: {
        userId,
        status: { in: ['COMPLETED', 'TIME_UP'] },
      },
      include: {
        exam: {
          select: {
            title: true,
            durationMinutes: true,
            totalMarks: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalAttempts = attemptMeta._count.id;
  const averageScore = attemptMeta._avg.score || 0;
  const totalTimeSpentMinutes = Math.round((attemptMeta._sum.timeTakenSec || 0) / 60);
  const totalAnswered = (attemptMeta._sum.totalCorrect || 0) + (attemptMeta._sum.totalWrong || 0);
  const accuracy = totalAnswered > 0
    ? Math.round(((attemptMeta._sum.totalCorrect || 0) / totalAnswered) * 100 * 100) / 100
    : 0;

  // Subject breakdown
  const allAttempts = await prisma.userAttempt.findMany({
    where: {
      userId,
      status: { in: ['COMPLETED', 'TIME_UP'] },
    },
    include: {
      exam: {
        select: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  const categoryMap = {};
  allAttempts.forEach((a) => {
    const cat = a.exam.category;
    if (!cat) return;

    if (!categoryMap[cat.id]) {
      categoryMap[cat.id] = {
        categoryId: cat.id,
        name: cat.name,
        slug: cat.slug,
        attempts: 0,
        totalScore: 0,
        totalCorrect: 0,
        totalQuestions: 0,
      };
    }

    const entry = categoryMap[cat.id];
    entry.attempts += 1;
    entry.totalScore += a.score || 0;
    entry.totalCorrect += a.totalCorrect || 0;
    entry.totalQuestions += (a.totalCorrect || 0) + (a.totalWrong || 0) + (a.totalUnanswered || 0);
  });

  const subjectBreakdown = Object.values(categoryMap).map((c) => ({
    ...c,
    averageScore: Math.round((c.totalScore / c.attempts) * 100) / 100,
    accuracy: c.totalQuestions > 0
      ? Math.round((c.totalCorrect / c.totalQuestions) * 100 * 100) / 100
      : 0,
  }));

  // Best / worst categories (require at least 1 attempt)
  const ranked = [...subjectBreakdown].sort((a, b) => b.averageScore - a.averageScore);
  const bestCategory = ranked.length > 0 ? { name: ranked[0].name, averageScore: ranked[0].averageScore } : null;
  const worstCategory = ranked.length > 1 ? { name: ranked[ranked.length - 1].name, averageScore: ranked[ranked.length - 1].averageScore } : null;

  return {
    totalAttempts,
    averageScore: Math.round(averageScore * 100) / 100,
    totalTimeSpentMinutes,
    accuracy,
    bestCategory,
    worstCategory,
    recentAttempts,
    subjectBreakdown,
  };
};

module.exports = {
  getSystemStats,
  getCategoryBreakdown,
  getAttemptTrends,
  getStudentAnalytics,
};
