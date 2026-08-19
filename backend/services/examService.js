const prisma = require('../config/db');
const { ApiError } = require('../utils/apiResponse');
const { cacheOrFetch, invalidatePattern, invalidate } = require('../utils/cache');

// ── Cache Key Generators ──────────────────────────────────────────────────────
const CACHE_KEYS = {
  EXAM_LIST: (params) => `exams:list:${params.role}:${params.categoryId || 'all'}:${params.page}:${params.limit}:${params.isPublished ?? 'na'}`,
  EXAM_DETAIL: (examId) => `exams:detail:${examId}`,
  EXAM_QUESTIONS: (examId, forStudent) => `exams:questions:${examId}:${forStudent ? 'student' : 'admin'}`,
};

// ── Cache TTL Constants (seconds) ─────────────────────────────────────────────
const CACHE_TTL = {
  EXAM_LIST: 180,        // 3 minutes
  EXAM_DETAIL: 300,      // 5 minutes
  EXAM_QUESTIONS: 300,   // 5 minutes
};

// ── Question Field Selectors ──────────────────────────────────────────────────
const SAFE_QUESTION_SELECT = {
  id: true,
  categoryId: true,
  questionText: true,
  options: true,
  difficulty: true,
  marks: true,
  isActive: true,
  media: {
    select: { id: true, mediaType: true, mediaUrl: true },
  },
};

const FULL_QUESTION_SELECT = {
  ...SAFE_QUESTION_SELECT,
  correctAnswer: true,
  explanation: true,
};

// ── Create Exam ───────────────────────────────────────────────────────────────
const createExam = async (data) => {
  const { questionIds, ...examData } = data;

  const hasQuestionIds = Array.isArray(questionIds) && questionIds.length > 0;

  if (questionIds && questionIds.length === 0) {
    throw new ApiError(400, 'Exam must include at least one question');
  }

  if (examData.isPublished && !hasQuestionIds) {
    throw new ApiError(400, 'Published exams must include at least one question');
  }

  const exam = await prisma.$transaction(async (tx) => {
    const created = await tx.exam.create({
      data: examData,
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    if (hasQuestionIds) {
      const questions = await tx.question.findMany({
        where: { id: { in: questionIds }, isActive: true },
        select: { id: true },
      });

      if (questions.length !== questionIds.length) {
        throw new ApiError(400, 'One or more questions are invalid or inactive');
      }

      await tx.examQuestion.createMany({
        data: questionIds.map((qId, index) => ({
          examId: created.id,
          questionId: qId,
          orderIndex: index,
        })),
      });
    }

    return created;
  });

  // Invalidate exam list cache since a new exam was created
  await invalidatePattern('exams:list:*');

  return exam;
};

// ── List Exams ────────────────────────────────────────────────────────────────
const getExams = async ({
  categoryId,
  isPublished,
  page = 1,
  limit = 10,
  role = 'STUDENT',
}) => {
  const cacheKey = CACHE_KEYS.EXAM_LIST({ categoryId, isPublished, page, limit, role });

  return cacheOrFetch(cacheKey, async () => {
    const where = {};

    if (categoryId) where.categoryId = categoryId;

    if (role === 'STUDENT') {
      where.isPublished = true;
      const now = new Date();
      where.AND = [
        { examQuestions: { some: {} } },
        { OR: [{ startTime: null }, { startTime: { lte: now } }] },
        { OR: [{ endTime: null }, { endTime: { gte: now } }] },
      ];
    } else if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const skip = (page - 1) * limit;

    const [exams, total] = await prisma.$transaction([
      prisma.exam.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { examQuestions: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.exam.count({ where }),
    ]);

    return { exams, total, page, pages: Math.ceil(total / limit) };
  }, CACHE_TTL.EXAM_LIST);
};

// ── Get Exam by ID ────────────────────────────────────────────────────────────
const getExamById = async (examId) => {
  const cacheKey = CACHE_KEYS.EXAM_DETAIL(examId);

  return cacheOrFetch(cacheKey, async () => {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { examQuestions: true, attempts: true } },
      },
    });

    if (!exam) throw new ApiError(404, 'Exam not found');
    return exam;
  }, CACHE_TTL.EXAM_DETAIL);
};

// ── Get Exam with Questions ───────────────────────────────────────────────────
const getExamWithQuestions = async (examId, forStudent = false) => {
  const cacheKey = CACHE_KEYS.EXAM_QUESTIONS(examId, forStudent);

  return cacheOrFetch(cacheKey, async () => {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        examQuestions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            question: {
              select: forStudent ? SAFE_QUESTION_SELECT : FULL_QUESTION_SELECT,
            },
          },
        },
      },
    });

    if (!exam) throw new ApiError(404, 'Exam not found');

    if (forStudent) {
      if (!exam.isPublished) {
        throw new ApiError(403, 'This exam is not available');
      }
      const now = new Date();
      if (exam.startTime && now < exam.startTime) {
        throw new ApiError(403, 'This exam has not started yet');
      }
      if (exam.endTime && now > exam.endTime) {
        throw new ApiError(403, 'This exam has ended');
      }
    }

    // Flatten junction data for frontend consumption
    const questions = exam.examQuestions.map((eq) => ({
      ...eq.question,
      orderIndex: eq.orderIndex,
    }));

    return { ...exam, questions, examQuestions: undefined };
  }, CACHE_TTL.EXAM_QUESTIONS);
};

// ── Update Exam ───────────────────────────────────────────────────────────────
const updateExam = async (examId, data) => {
  const existing = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });

  if (!existing) throw new ApiError(404, 'Exam not found');

  const updated = await prisma.exam.update({
    where: { id: examId },
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  // Invalidate all caches related to this exam
  await invalidatePattern('exams:list:*');
  await invalidate(CACHE_KEYS.EXAM_DETAIL(examId));
  await invalidatePattern(`exams:questions:${examId}:*`);

  return updated;
};

// ── Delete Exam ───────────────────────────────────────────────────────────────
const deleteExam = async (examId) => {
  const existing = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });

  if (!existing) throw new ApiError(404, 'Exam not found');

  await prisma.exam.delete({ where: { id: examId } });

  // Invalidate all caches related to this exam
  await invalidatePattern('exams:list:*');
  await invalidate(CACHE_KEYS.EXAM_DETAIL(examId));
  await invalidatePattern(`exams:questions:${examId}:*`);

  return { id: examId };
};

// ── Assign Questions (Append) ─────────────────────────────────────────────────
const assignQuestions = async (examId, questionIds) => {
  if (!questionIds || questionIds.length === 0) {
    throw new ApiError(400, 'No questions provided');
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });
  if (!exam) throw new ApiError(404, 'Exam not found');

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds }, isActive: true },
    select: { id: true },
  });
  if (questions.length !== questionIds.length) {
    throw new ApiError(400, 'One or more questions are invalid or inactive');
  }

  const last = await prisma.examQuestion.findFirst({
    where: { examId },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true },
  });
  const startIndex = last ? last.orderIndex + 1 : 0;

  await prisma.examQuestion.createMany({
    data: questionIds.map((qId, idx) => ({
      examId,
      questionId: qId,
      orderIndex: startIndex + idx,
    })),
    skipDuplicates: true,
  });

  // Invalidate exam list (question count changed) and question cache
  await invalidatePattern('exams:list:*');
  await invalidatePattern(`exams:questions:${examId}:*`);

  return { assigned: questionIds.length };
};

// ── Set Exam Questions (Replace All) ──────────────────────────────────────────
const setExamQuestions = async (examId, questionIds) => {
  if (!questionIds) throw new ApiError(400, 'No questions provided');

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });
  if (!exam) throw new ApiError(404, 'Exam not found');

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds }, isActive: true },
    select: { id: true },
  });
  if (questions.length !== questionIds.length) {
    throw new ApiError(400, 'One or more questions are invalid or inactive');
  }

  await prisma.$transaction(async (tx) => {
    await tx.examQuestion.deleteMany({ where: { examId } });

    if (questionIds.length > 0) {
      await tx.examQuestion.createMany({
        data: questionIds.map((qId, idx) => ({
          examId,
          questionId: qId,
          orderIndex: idx,
        })),
      });
    }
  });

  // Invalidate exam list (question count changed) and question cache
  await invalidatePattern('exams:list:*');
  await invalidatePattern(`exams:questions:${examId}:*`);

  return { assigned: questionIds.length };
};

// ── Remove Questions ──────────────────────────────────────────────────────────
const removeQuestions = async (examId, questionIds) => {
  if (!questionIds || questionIds.length === 0) {
    throw new ApiError(400, 'No questions provided');
  }

  const result = await prisma.examQuestion.deleteMany({
    where: { examId, questionId: { in: questionIds } },
  });

  // Invalidate exam list (question count changed) and question cache
  await invalidatePattern('exams:list:*');
  await invalidatePattern(`exams:questions:${examId}:*`);

  return { removed: result.count };
};

// ── Reorder Questions ─────────────────────────────────────────────────────────
const reorderQuestions = async (examId, orders) => {
  if (!Array.isArray(orders) || orders.length === 0) {
    throw new ApiError(400, 'No order data provided');
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });
  if (!exam) throw new ApiError(404, 'Exam not found');

  await prisma.$transaction(async (tx) => {
    for (const o of orders) {
      await tx.examQuestion.updateMany({
        where: { examId, questionId: o.questionId },
        data: { orderIndex: o.orderIndex },
      });
    }
  });

  // Invalidate question cache (order changed)
  await invalidatePattern(`exams:questions:${examId}:*`);

  return { updated: orders.length };
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  getExamWithQuestions,
  updateExam,
  deleteExam,
  assignQuestions,
  setExamQuestions,
  removeQuestions,
  reorderQuestions,
};
