const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const questionController = require('../controllers/questionController');
const validate = require('../middleware/validateMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  createQuestionSchema,
  updateQuestionSchema,
  questionQuerySchema,
} = require('../validators/questionValidator');

// ── Multer Configuration ──────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `csv-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,
  },
});

const router = Router();

// ── Public Question Browsing ──────────────────────────────────────────────────

router.get(
  '/',
  validate({ query: questionQuerySchema }),
  questionController.listQuestions
);

router.get('/:id', questionController.getQuestion);

// ── Admin Question Management ─────────────────────────────────────────────────

router.post(
  '/',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  validate({ body: createQuestionSchema }),
  questionController.createQuestion
);

router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  validate({ body: updateQuestionSchema }),
  questionController.updateQuestion
);

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  questionController.deleteQuestion
);

router.patch(
  '/:id/toggle',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  questionController.toggleActive
);

// ── Bulk Upload ───────────────────────────────────────────────────────────────

router.post(
  '/bulk-upload',
  authMiddleware,
  authorizeRoles('ADMIN', 'SUPER_ADMIN'),
  upload.single('file'),
  questionController.bulkUpload
);

module.exports = router;
