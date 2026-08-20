const { ApiError, ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const leaderboardService = require('../services/leaderboardService');

const getTopPerformers = asyncHandler(async (req, res) => {
  const examId = req.params.id || req.query.examId;
  const limit = Math.min(Number(req.query.limit || 10), 50);

  if (!examId || !Number.isInteger(limit) || limit < 1) {
    throw new ApiError(400, 'A valid examId is required');
  }

  const leaderboard = await leaderboardService.getTopN(examId, limit);

  res.status(200).json(
    new ApiResponse(200, leaderboard, 'Top performers fetched successfully')
  );
});

module.exports = {
  getTopPerformers,
};
