const attemptService = require('../services/attemptService');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ── Start Attempt ─────────────────────────────────────────────────────────────
const startAttempt = asyncHandler(async (req, res) => {
  const { examId } = req.body;
  const userId = req.user?.userId ?? req.user?.id;

  const attempt = await attemptService.startAttempt(userId, examId);

  res.status(201).json(
    new ApiResponse(201, attempt, 'Exam attempt started successfully')
  );
});

// ── Submit Answer ─────────────────────────────────────────────────────────────
const submitAnswer = asyncHandler(async (req, res) => {
  const { attemptId, questionId, selectedOption, timeTakenSec } = req.body;
  const userId = req.user?.userId ?? req.user?.id;

  const answer = await attemptService.submitAnswer(
    userId,
    attemptId,
    questionId,
    selectedOption,
    timeTakenSec
  );

  res.status(200).json(
    new ApiResponse(200, answer, 'Answer submitted successfully')
  );
});

// ── Finish Attempt ────────────────────────────────────────────────────────────
const finishAttempt = asyncHandler(async (req, res) => {
  const { attemptId, timeTakenSec } = req.body;
  const userId = req.user?.userId ?? req.user?.id;

  const result = await attemptService.finishAttempt(userId, attemptId, timeTakenSec);

  res.status(200).json(
    new ApiResponse(200, result, 'Exam submitted successfully')
  );
});

// ── Get Attempt ───────────────────────────────────────────────────────────────
const getAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId ?? req.user?.id;

  const attempt = await attemptService.getAttempt(id, userId);

  res.status(200).json(
    new ApiResponse(200, attempt, 'Attempt retrieved successfully')
  );
});

// ── Background helper used by jobs ─────────────────────────────────────────────
const autoSubmitAttempt = attemptService.autoSubmitAttempt;

module.exports = {
  startAttempt,
  submitAnswer,
  finishAttempt,
  autoSubmitAttempt,
  getAttempt,
};
