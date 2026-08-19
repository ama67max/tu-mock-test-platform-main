const { Router } = require('express');
const examController = require('../controllers/examController');
const leaderboardController = require('../controllers/leaderboardController');
const validate = require('../middleware/validateMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  createExamSchema,
  updateExamSchema,
  examQuerySchema,
} = require('../validators/examValidator');

const router = Router();

// ── Public Exam Browsing Routes ───────────────────────────────────────────────

router.get(
  '/',
  validate({ query: examQuerySchema }),
  examController.listExams
);

router.get('/:id/leaderboard', authMiddleware, leaderboardController.getTopPerformers);
router.get('/:id', examController.getExam);

router.get('/:id/questions', examController.getExamQuestions);

// ── Admin Exam Management Routes ──────────────────────────────────────────────

router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  validate({ body: createExamSchema }),
  examController.createExam
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  validate({ body: updateExamSchema }),
  examController.updateExam
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  examController.deleteExam
);

// ── Admin Question Assignment Routes ──────────────────────────────────────────

router.post(
  '/:id/questions',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  examController.addQuestions
);

router.put(
  '/:id/questions',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  examController.setQuestions
);

router.delete(
  '/:id/questions',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  examController.removeQuestions
);

router.patch(
  '/:id/questions/reorder',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  examController.reorderQuestions
);

module.exports = router;
