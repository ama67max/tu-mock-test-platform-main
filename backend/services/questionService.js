const prisma = require('../config/db');
const redis = require('../config/redis');
const { ApiError } = require('../utils/apiResponse');

const CACHE_TTL = 300; // 5 minutes

// ── Cache Key Builder ─────────────────────────────────────────────────────────
const buildCacheKey = (...parts) => `tu:question:${parts.join(':')}`;

// ── Invalidate List Caches ────────────────────────────────────────────────────
const invalidateListCaches = async () => {
  const keys = await redis.keys(buildCacheKey('list', '*'));
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// ── Create Question ───────────────────────────────────────────────────────────
const createQuestion = async (data) => {
  const question = await prisma.question.create({
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  await invalidateListCaches();
  return question;
};

// ── List Questions (with caching) ─────────────────────────────────────────────
const getQuestions = async ({
  categoryId,
  difficulty,
  isActive,
  search,
  page = 1,
  limit = 10,
}) => {
  const cacheKey = buildCacheKey(
    'list',
    categoryId || 'all',
    difficulty || 'all',
    isActive !== undefined ? isActive : 'all',
    search || 'none',
    page,
    limit
  );

  // Try cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const where = {};
  if (categoryId) where.categoryId = categoryId;
  if (difficulty) where.difficulty = difficulty;
  if (isActive !== undefined) where.isActive = isActive;
  if (search) {
    where.OR = [
      { questionText: { contains: search, mode: 'insensitive' } },
      { explanation: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;

  const [questions, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { examQuestions: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.question.count({ where }),
  ]);

  const result = {
    questions,
    total,
    page,
    pages: Math.ceil(total / limit),
  };

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
  return result;
};

// ── Get Question by ID (with caching) ─────────────────────────────────────────
const getQuestionById = async (id) => {
  const cacheKey = buildCacheKey('detail', id);

  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      media: true,
      _count: { select: { examQuestions: true } },
    },
  });

  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(question));
  return question;
};

// ── Update Question ───────────────────────────────────────────────────────────
const updateQuestion = async (id, data) => {
  const existing = await prisma.question.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, 'Question not found');
  }

  const updated = await prisma.question.update({
    where: { id },
    data,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      media: true,
    },
  });

  await redis.del(buildCacheKey('detail', id));
  await invalidateListCaches();

  return updated;
};

// ── Delete Question ───────────────────────────────────────────────────────────
const deleteQuestion = async (id) => {
  const existing = await prisma.question.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ApiError(404, 'Question not found');
  }

  await prisma.question.delete({ where: { id } });

  await redis.del(buildCacheKey('detail', id));
  await invalidateListCaches();

  return { id };
};

// ── Toggle Question Active Status ─────────────────────────────────────────────
const toggleQuestionActive = async (id) => {
  const question = await prisma.question.findUnique({
    where: { id },
    select: { id: true, isActive: true },
  });

  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  const updated = await prisma.question.update({
    where: { id },
    data: { isActive: !question.isActive },
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  });

  await redis.del(buildCacheKey('detail', id));
  await invalidateListCaches();

  return updated;
};

// ── Get Random Questions (for exam generation) ────────────────────────────────
const getRandomQuestions = async ({ categoryId, count, excludeIds = [] }) => {
  if (!count || count < 1) {
    throw new ApiError(400, 'Count must be at least 1');
  }

  const where = {
    isActive: true,
    id: { notIn: excludeIds },
  };
  if (categoryId) where.categoryId = categoryId;

  const total = await prisma.question.count({ where });

  if (total === 0) {
    return [];
  }

  // Pseudo-random selection using random skip
  const maxSkip = Math.max(0, total - count);
  const randomSkip = Math.floor(Math.random() * (maxSkip + 1));

  const questions = await prisma.question.findMany({
    where,
    skip: randomSkip,
    take: count,
    select: {
      id: true,
      categoryId: true,
      questionText: true,
      options: true,
      difficulty: true,
      marks: true,
      isActive: true,
    },
  });

  return questions;
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  toggleQuestionActive,
  getRandomQuestions,
};
