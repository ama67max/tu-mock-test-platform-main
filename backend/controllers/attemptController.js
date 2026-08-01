const prisma = require('../config/db');
const { ApiError } = require('../utils/apiResponse');

// ── Helpers ───────────────────────────────────────────────────────────────────

const isAttemptExpired = (attempt, exam) => {
  const now = Date.now();
  const startedAt = new Date(attempt.startedAt).getTime();
  const elapsedMs = now - startedAt;
  const durationMs = exam.durationMinutes * 60 * 1000;
  return elapsedMs > durationMs;
};

const getServerTimeTaken = (attempt) => {
  return Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
};

// ── Start Attempt ─────────────────────────────────────────────────────────────
const startAttempt = async (userId, examId) => {
  const now = new Date();

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      _count: { select: { examQuestions: true } },
    },
  });

  if (!exam) throw new ApiError(404, 'Exam not found');
  if (!exam.isPublished) throw new ApiError(403, 'This exam is not available');
  if (exam.startTime && now < exam.startTime) {
    throw new ApiError(403, 'This exam has not started yet');
  }
  if (exam.endTime && now > exam.endTime) {
    throw new ApiError(403, 'This exam has ended');
  }
  if (exam._count.examQuestions === 0) {
    throw new ApiError(400, 'This exam has no questions');
  }

  // Atomic check-and-create prevents duplicate active attempts under race conditions
  const attempt = await prisma.$transaction(async (tx) => {
    const existing = await tx.userAttempt.findFirst({
      where: { userId, examId, status: 'IN_PROGRESS' },
    });

    if (existing) {
      throw new ApiError(409, 'You already have an active attempt for this exam');
    }

    return tx.userAttempt.create({
      data: {
        userId,
        examId,
        status: 'IN_PROGRESS',
      },
      include: {
        exam: {
          include: {
            category: { select: { id: true, name: true, slug: true } },
            examQuestions: {
              orderBy: { orderIndex: 'asc' },
              include: {
                question: {
                  select: {
                    id: true,
                    questionText: true,
                    options: true,
                    difficulty: true,
                    marks: true,
                    media: {
                      select: { id: true, mediaType: true, mediaUrl: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  });

  // Flatten junction table for cleaner frontend consumption
  const questions = attempt.exam.examQuestions.map((eq) => ({
    ...eq.question,
    orderIndex: eq.orderIndex,
  }));

  return {
    ...attempt,
    exam: {
      ...attempt.exam,
      examQuestions: undefined,
      questions,
    },
  };
};

// ── Submit Answer ─────────────────────────────────────────────────────────────
const submitAnswer = async (
  userId,
  attemptId,
  questionId,
  selectedOption,
  timeTakenSec
) => {
  const attempt = await prisma.userAttempt.findFirst({
    where: { id: attemptId, userId },
    include: { exam: true },
  });

  if (!attempt) throw new ApiError(404, 'Attempt not found');
  if (attempt.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'This attempt has already been submitted');
  }

  // Server-side time enforcement
  if (isAttemptExpired(attempt, attempt.exam)) {
    await autoSubmitAttempt(attemptId);
    throw new ApiError(409, 'Time expired. Your attempt has been auto-submitted.');
  }

  // Verify question belongs to this exam
  const examQuestion = await prisma.examQuestion.findFirst({
    where: { examId: attempt.examId, questionId },
  });
  if (!examQuestion) {
    throw new ApiError(400, 'Question does not belong to this exam');
  }

  // Evaluate correctness
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { correctAnswer: true, marks: true },
  });

  const hasAnswer = selectedOption !== null && selectedOption !== undefined;
  const isCorrect = hasAnswer ? selectedOption === question.correctAnswer : false;
  const marksObtained = isCorrect ? question.marks : 0;

  const answer = await prisma.attemptAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },
    create: {
      attemptId,
      questionId,
      selectedOption: hasAnswer ? selectedOption : null,
      isCorrect,
      timeTakenSec,
      marksObtained,
    },
    update: {
      selectedOption: hasAnswer ? selectedOption : null,
      isCorrect,
      timeTakenSec,
      marksObtained,
    },
  });

  return answer;
};

// ── Finish Attempt ────────────────────────────────────────────────────────────
const finishAttempt = async (userId, attemptId, clientTimeTakenSec) => {
  const attempt = await prisma.userAttempt.findFirst({
    where: { id: attemptId, userId },
    include: { exam: true },
  });

  if (!attempt) throw new ApiError(404, 'Attempt not found');
  if (attempt.status !== 'IN_PROGRESS') {
    throw new ApiError(409, 'This attempt has already been submitted');
  }

  const expired = isAttemptExpired(attempt, attempt.exam);
  const status = expired ? 'TIME_UP' : 'COMPLETED';

  // Server is source of truth for time, but respect client's clock if reasonable
  const serverTimeTaken = getServerTimeTaken(attempt);
  const maxTime = attempt.exam.durationMinutes * 60;
  const timeTakenSec = expired
    ? Math.min(serverTimeTaken, maxTime)
    : Math.min(Math.max(clientTimeTakenSec, 0), serverTimeTaken);

  const result = await prisma.$transaction(async (tx) => {
    // Aggregate statistics
    const [answers, totalQuestions] = await Promise.all([
      tx.attemptAnswer.findMany({ where: { attemptId } }),
      tx.examQuestion.count({ where: { examId: attempt.examId } }),
    ]);

    const totalCorrect = answers.filter((a) => a.isCorrect).length;
    const totalWrong = answers.filter(
      (a) => !a.isCorrect && a.selectedOption !== null
    ).length;
    const totalUnanswered = totalQuestions - answers.length;
    const score = answers.reduce((sum, a) => sum + a.marksObtained, 0);

    // Finalize attempt
    const updated = await tx.userAttempt.update({
      where: { id: attemptId },
      data: {
        status,
        submittedAt: new Date(),
        score,
        totalCorrect,
        totalWrong,
        totalUnanswered,
        timeTakenSec,
      },
    });

    // Upsert leaderboard (rank calculated asynchronously by background job)
    await tx.leaderboard.upsert({
      where: {
        examId_userId: {
          examId: attempt.examId,
          userId,
        },
      },
      create: {
        examId: attempt.examId,
        userId,
        score,
        completedAt: new Date(),
      },
      update: {
        score,
        completedAt: new Date(),
      },
    });

    return updated;
  });

  return result;
};

// ── Auto Submit (Timeout / Background Job) ────────────────────────────────────
const autoSubmitAttempt = async (attemptId) => {
  const attempt = await prisma.userAttempt.findUnique({
    where: { id: attemptId },
    include: { exam: true },
  });

  if (!attempt || attempt.status !== 'IN_PROGRESS') return null;

  return finishAttempt(attempt.userId, attemptId, attempt.exam.durationMinutes * 60);
};

// ── Get Attempt (State Retrieval) ─────────────────────────────────────────────
const getAttempt = async (attemptId, userId) => {
  const attempt = await prisma.userAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      exam: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              questionText: true,
              options: true,
              difficulty: true,
              marks: true,
            },
          },
        },
      },
    },
  });

  if (!attempt) throw new ApiError(404, 'Attempt not found');

  return attempt;
};

module.exports = {
  startAttempt,
  submitAnswer,
  finishAttempt,
  autoSubmitAttempt,
  getAttempt,
};
