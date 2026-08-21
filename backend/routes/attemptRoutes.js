const { Router } = require('express');
const attemptController = require('../controllers/attemptController');
const validate = require('../middleware/validateMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const config = require('../config/env');
const { requireVerifiedPhone } = require('../middleware/requireVerifiedPhone');
const {
  startAttemptSchema,
  submitAnswerSchema,
  finishAttemptSchema,
  getAttemptSchema,
} = require('../validators/attemptValidator');

const router = Router();

// All attempt routes require authentication
router.use(authMiddleware);

// ── Attempt Lifecycle Routes ──────────────────────────────────────────────────

router.post(
  '/start',
  validate({ body: startAttemptSchema }),
  attemptController.startAttempt
);

router.post(
  '/submit-answer',
  validate({ body: submitAnswerSchema }),
  attemptController.submitAnswer
);

router.post(
  '/finish',
  ...(config.AUTH_PROVIDER === 'clerk' ? [requireVerifiedPhone] : []),
  validate({ body: finishAttemptSchema }),
  attemptController.finishAttempt
);

router.get(
  '/:id',
  validate({ params: getAttemptSchema }),
  attemptController.getAttempt
);

module.exports = router;
