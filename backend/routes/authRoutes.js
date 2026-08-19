const { Router } = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validateMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { authRateLimiter } = require('../middleware/rateLimitMiddleware');
const {
  registerSchema,
  loginSchema,
} = require('../validators/authValidator');

const router = Router();

// ── Public Auth Routes ────────────────────────────────────────────────────────

router.post(
  '/register',
  authRateLimiter,
  validate({ body: registerSchema }),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate({ body: loginSchema }),
  authController.login
);

router.post('/logout', authController.logout);

router.post('/refresh', authController.refresh);

// ── Protected Auth Routes ─────────────────────────────────────────────────────

router.post(
  '/logout-all',
  authMiddleware,
  authController.logoutAll
);

module.exports = router;
