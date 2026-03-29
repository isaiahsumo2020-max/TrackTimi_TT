const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticateToken } = require('../middleware/role.middleware');

// Protect all routes
router.use(authenticateToken);

// POST Routes
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut); // Line 10 - Now properly defined!

// GET Routes
router.get('/summary', attendanceController.getOrgSummary);
router.get('/recent', attendanceController.getRecent);
router.get('/logs', attendanceController.getOrgLogs);
router.get('/report', attendanceController.generateReport);
router.get('/my-history', authenticateToken, attendanceController.getMyHistory);
module.exports = router;