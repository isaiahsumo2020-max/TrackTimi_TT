const router = require('express').Router();
const excuseController = require('../controllers/excuse.controller');
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');

// All routes require authentication
router.use(authenticateToken);

// =============================================================
// USER ENDPOINTS (All users)
// =============================================================

// POST /api/excuses - Submit new excuse
router.post('/', excuseController.submitExcuse);

// GET /api/excuses/my - Get user's own excuses
router.get('/my', excuseController.getMyExcuses);

// =============================================================
// ADMIN ENDPOINTS (Admin only)
// =============================================================

// GET /api/excuses/pending - Get all pending excuses
router.get('/admin/pending', requireAdmin, excuseController.getPendingExcuses);

// POST /api/excuses/:id/approve - Approve excuse
router.post('/:excuseId/approve', requireAdmin, excuseController.approveExcuse);

// POST /api/excuses/:id/reject - Reject excuse
router.post('/:excuseId/reject', requireAdmin, excuseController.rejectExcuse);

module.exports = router;
