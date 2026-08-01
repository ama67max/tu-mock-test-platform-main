const fs = require('fs');
const questionService = require('../services/questionService');
const csvUploadService = require('../services/csvUploadService');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../config/logger');

/**
 * GET /api/v1/questions
 * List questions with filters and pagination.
 */
const listQuestions = asyncHandler(async (req, res) => {
  const { categoryId, difficulty, isActive, search, page, limit } = req.query;

  const result = await questionService.getQuestions({
    categoryId,
    difficulty,
    isActive,
    search,
    page,
    limit,
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Questions fetched successfully')
  );
});

/**
 * GET /api/v1/questions/:id
 * Get a single question by ID.
 */
const getQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await questionService.getQuestionById(id);

  res.status(200).json(
    new ApiResponse(200, question, 'Question fetched successfully')
  );
});

/**
 * POST /api/v1/questions
 * Create a new question (admin).
 */
const createQuestion = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.body);

  res.status(201).json(
    new ApiResponse(201, question, 'Question created successfully')
  );
});

/**
 * PUT /api/v1/questions/:id
 * Update an existing question (admin).
 */
const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await questionService.updateQuestion(id, req.body);

  res.status(200).json(
    new ApiResponse(200, question, 'Question updated successfully')
  );
});

/**
 * DELETE /api/v1/questions/:id
 * Delete a question (admin).
 */
const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await questionService.deleteQuestion(id);

  res.status(200).json(
    new ApiResponse(200, result, 'Question deleted successfully')
  );
});

/**
 * PATCH /api/v1/questions/:id/toggle
 * Toggle a question's active status (admin).
 */
const toggleActive = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updated = await questionService.toggleQuestionActive(id);

  const message = updated.isActive
    ? 'Question activated successfully'
    : 'Question deactivated successfully';

  res.status(200).json(
    new ApiResponse(200, updated, message)
  );
});

/**
 * POST /api/v1/questions/bulk-upload
 * Upload a CSV file to bulk-create questions (admin).
 * Expects req.file to be populated by Multer middleware.
 */
const bulkUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'CSV file is required');
  }

  let result;
  try {
    result = await csvUploadService.bulkUploadQuestions(req.file.path);
  } finally {
    // Always clean up the uploaded temp file
    try {
      await fs.promises.unlink(req.file.path);
    } catch (err) {
      logger.warn('Failed to clean up uploaded CSV file', {
        path: req.file.path,
        error: err.message,
      });
    }
  }

  res.status(200).json(
    new ApiResponse(200, result, 'Bulk upload completed')
  );
});

module.exports = {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  toggleActive,
  bulkUpload,
};
