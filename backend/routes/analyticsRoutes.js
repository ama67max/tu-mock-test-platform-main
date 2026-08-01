const { Router } = require('express');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = Router();

// All analytics routes require authentication
router.use(authMiddleware);

// ── Platform-Wide Admin Analytics ─────────────────────────────────────────────

router.get(
  '/system',
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  analyticsController.getSystemStats
);

router.get(
  '/categories',
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  analyticsController.getCategoryBreakdown
);

router.get(
  '/trends',
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  analyticsController.getAttemptTrends
);

// ── Personal Student Analytics ────────────────────────────────────────────────

router.get('/my-trends', analyticsController.getMyAttemptTrends);

router.get('/me', analyticsController.getStudentAnalytics);

module.exports = router;
