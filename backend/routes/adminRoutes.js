const { Router } = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = Router();

// ── Global Admin Guard ────────────────────────────────────────────────────────
// Every route below requires ADMIN or SUPER_ADMIN role.
router.use(authMiddleware, authorizeRoles('ADMIN', 'SUPER_ADMIN'));

// ── Dashboard Overview ────────────────────────────────────────────────────────

router.get('/overview', adminController.getOverview);
router.get('/results/export', adminController.exportResults);

// ── Category Management ───────────────────────────────────────────────────────

router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

module.exports = router;
