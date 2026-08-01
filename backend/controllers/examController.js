const examService = require('../services/examService');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/exams
 * List exams with pagination and filters.
 * Students see only published, active-window exams.
 */
const listExams = asyncHandler(async (req, res) => {
  const { categoryId, isPublished, page, limit } = req.query;
  const role = req.user?.role || 'STUDENT';

  const result = await examService.getExams({
    categoryId,
    isPublished,
    page,
    limit,
    role,
  });

  res.status(200).json(
    new ApiResponse(200, result, 'Exams fetched successfully')
  );
});

/**
 * GET /api/v1/exams/:id
 * Get lightweight exam metadata (no questions).
 */
const getExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exam = await examService.getExamById(id);

  res.status(200).json(
    new ApiResponse(200, exam, 'Exam fetched successfully')
  );
});

/**
 * GET /api/v1/exams/:id/questions
 * Get exam with full question list.
 * Admins see correct answers; students do not.
 */
const getExamQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user && ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
  const forStudent = !isAdmin;

  const exam = await examService.getExamWithQuestions(id, forStudent);

  res.status(200).json(
    new ApiResponse(200, exam, 'Exam questions fetched successfully')
  );
});

/**
 * POST /api/v1/exams
 * Create a new exam (admin).
 */
const createExam = asyncHandler(async (req, res) => {
  const exam = await examService.createExam(req.body);

  res.status(201).json(
    new ApiResponse(201, exam, 'Exam created successfully')
  );
});

/**
 * PUT /api/v1/exams/:id
 * Update exam metadata (admin).
 */
const updateExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const exam = await examService.updateExam(id, req.body);

  res.status(200).json(
    new ApiResponse(200, exam, 'Exam updated successfully')
  );
});

/**
 * DELETE /api/v1/exams/:id
 * Delete an exam (admin).
 */
const deleteExam = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await examService.deleteExam(id);

  res.status(200).json(
    new ApiResponse(200, result, 'Exam deleted successfully')
  );
});

/**
 * POST /api/v1/exams/:id/questions
 * Append questions to an existing exam (admin).
 */
const addQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionIds } = req.body;

  const result = await examService.assignQuestions(id, questionIds);

  res.status(200).json(
    new ApiResponse(200, result, 'Questions assigned successfully')
  );
});

/**
 * PUT /api/v1/exams/:id/questions
 * Replace all questions in an exam (admin).
 */
const setQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionIds } = req.body;

  const result = await examService.setExamQuestions(id, questionIds);

  res.status(200).json(
    new ApiResponse(200, result, 'Exam questions updated successfully')
  );
});

/**
 * DELETE /api/v1/exams/:id/questions
 * Remove specific question assignments (admin).
 */
const removeQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { questionIds } = req.body;

  const result = await examService.removeQuestions(id, questionIds);

  res.status(200).json(
    new ApiResponse(200, result, 'Questions removed successfully')
  );
});

/**
 * PATCH /api/v1/exams/:id/questions/reorder
 * Reorder questions within an exam (admin).
 */
const reorderQuestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { orders } = req.body;

  const result = await examService.reorderQuestions(id, orders);

  res.status(200).json(
    new ApiResponse(200, result, 'Questions reordered successfully')
  );
});

module.exports = {
  listExams,
  getExam,
  getExamQuestions,
  createExam,
  updateExam,
  deleteExam,
  addQuestions,
  setQuestions,
  removeQuestions,
  reorderQuestions,
};
