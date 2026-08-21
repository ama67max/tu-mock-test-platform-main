const { Router } = require('express');
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');
const config = require('../config/env');
const { requireVerifiedPhone } = require('../middleware/requireVerifiedPhone');

const router = Router();

// All result routes require authentication
router.use(authMiddleware);

// ── Result Retrieval Routes ───────────────────────────────────────────────────

const phoneVerifiedRoute = config.AUTH_PROVIDER === 'clerk'
	? [requireVerifiedPhone]
	: [];

router.get('/', ...phoneVerifiedRoute, resultController.getMyResults);
router.get('/:attemptId/answers', ...phoneVerifiedRoute, resultController.getAttemptAnswers);
router.get('/:attemptId', ...phoneVerifiedRoute, resultController.getResult);

module.exports = router;
