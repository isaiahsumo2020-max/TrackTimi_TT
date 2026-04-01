const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticateToken } = require('../middleware/role.middleware');

// Protect all routes
router.use(authenticateToken);

// 1. GET checkin status (The frontend calls this immediately after checkin)
// THIS IS THE ONE THAT WAS LIKELY MISSING OR CAUSING THE 404
router.get('/status', attendanceController.getCheckinStatus);

// 2. Actions
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// 3. History
router.get('/my-history', attendanceController.getMyHistory);

// 4. Admin Utilities
router.get('/recent', attendanceController.getRecent);

module.exports = router;