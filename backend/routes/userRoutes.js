const { Router } = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = Router();

// ── Self-Service Profile Routes ───────────────────────────────────────────────

router.get('/me', authMiddleware, userController.getMe);
router.put('/me', authMiddleware, userController.updateMe);
router.put('/profile', authMiddleware, userController.updateMe);
router.post('/change-password', authMiddleware, userController.changePassword);

// ── Admin User Management Routes ──────────────────────────────────────────────

router.get(
  '/search',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  userController.searchUsers
);

router.get(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  userController.getUser
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  userController.updateUser
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  userController.deleteUser
);

router.patch(
  '/:id/toggle',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  userController.toggleActivation
);

module.exports = router;
