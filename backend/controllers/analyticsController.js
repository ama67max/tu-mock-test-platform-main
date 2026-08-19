const analyticsService = require('../services/analyticsService');
const { ApiResponse } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ── Helpers ───────────────────────────────────────────────────────────────────
const clamp = (val, min, max) => Math.min(Math.max(parseInt(val, 10) || min, min), max);

/**
 * GET /api/v1/analytics/system
 * Platform-wide system statistics (admin dashboard KPIs).
 */
const getSystemStats = asyncHandler(async (req, res) => {
  const stats = await analyticsService.getSystemStats();

  res.status(200).json(
    new ApiResponse(200, stats, 'System statistics fetched successfully')
  );
});

/**
 * GET /api/v1/analytics/categories
 * Per-category performance and volume breakdown (admin dashboard).
 */
const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const breakdown = await analyticsService.getCategoryBreakdown();

  res.status(200).json(
    new ApiResponse(200, breakdown, 'Category breakdown fetched successfully')
  );
});

/**
 * GET /api/v1/analytics/trends
 * Platform-wide attempt trends over time (admin dashboard chart).
 */
const getAttemptTrends = asyncHandler(async (req, res) => {
  const days = clamp(req.query.days, 7, 90);

  const trends = await analyticsService.getAttemptTrends({ days });

  res.status(200).json(
    new ApiResponse(200, trends, 'Trends fetched successfully')
  );
});

/**
 * GET /api/v1/analytics/my-trends
 * Personal attempt trends for the authenticated student.
 */
const getMyAttemptTrends = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const days = clamp(req.query.days, 7, 90);

  const trends = await analyticsService.getAttemptTrends({ days, userId });

  res.status(200).json(
    new ApiResponse(200, trends, 'Personal trends fetched successfully')
  );
});

/**
 * GET /api/v1/analytics/me
 * Comprehensive personal analytics for the student dashboard.
 */
const getStudentAnalytics = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const analytics = await analyticsService.getStudentAnalytics(userId);

  res.status(200).json(
    new ApiResponse(200, analytics, 'Student analytics fetched successfully')
  );
});

const getDashboardStats = getSystemStats;

module.exports = {
  getSystemStats,
  getDashboardStats,
  getCategoryBreakdown,
  getAttemptTrends,
  getMyAttemptTrends,
  getStudentAnalytics,
};
