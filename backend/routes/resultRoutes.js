const { Router } = require('express');
const resultController = require('../controllers/resultController');
const authMiddleware = require('../middleware/authMiddleware');

const router = Router();

// All result routes require authentication
router.use(authMiddleware);

// ── Result Retrieval Routes ───────────────────────────────────────────────────

router.get('/', resultController.getMyResults);
router.get('/:attemptId/answers', resultController.getAttemptAnswers);
router.get('/:attemptId', resultController.getResult);

module.exports = router;
