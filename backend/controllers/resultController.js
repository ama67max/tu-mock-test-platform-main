const prisma = require('../config/db');
const resultService = require('../services/resultService');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/v1/results/:attemptId
 * Get detailed result for a specific attempt.
 * Requires ownership or admin privileges.
 */
const getResult = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { userId, role } = req.user;

  // Authorization: verify attempt ownership
  const attemptMeta = await prisma.userAttempt.findUnique({
    where: { id: attemptId },
    select: { userId: true },
  });

  if (!attemptMeta) {
    throw new ApiError(404, 'Attempt not found');
  }

  if (attemptMeta.userId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(role)) {
    throw new ApiError(403, 'You do not have access to this result');
  }

  const result = await resultService.getResult(attemptId);

  res.status(200).json(
    new ApiResponse(200, result, 'Result fetched successfully')
  );
});

/**
 * GET /api/v1/results
 * Get paginated attempt history for the authenticated user.
 */
const getMyResults = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { page, limit } = req.query;

  const results = await resultService.getUserResults(userId, {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
  });

  res.status(200).json(
    new ApiResponse(200, results, 'Results fetched successfully')
  );
});

module.exports = {
  getResult,
  getMyResults,
};
