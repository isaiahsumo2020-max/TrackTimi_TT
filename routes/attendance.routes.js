const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');
const { authenticateToken } = require('../middleware/role.middleware');

// Protect all routes
router.use(authenticateToken);

// 1. GET checkin status (The frontend calls this immediately after checkin)
router.get('/status', attendanceController.getCheckinStatus);

// 2. Actions
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', attendanceController.checkOut);

// 3. History
router.get('/my-history', attendanceController.getMyHistory);

// 4. Break Management
router.post('/break-start', attendanceController.startBreak);
router.post('/break-end', attendanceController.endBreak);
router.get('/breaks', attendanceController.getBreaks);

// 5. Analytics & Statistics
router.get('/analytics', attendanceController.getAnalytics);

// 6. Current Shift Information
router.get('/current-shift', attendanceController.getCurrentShift);

// 7. Admin Utilities
router.get('/recent', attendanceController.getRecent);

// 8. USER DASHBOARD - READ-ONLY DATA
router.get('/dashboard/summary', attendanceController.getUserDashboard);

// 9. NOTIFICATIONS
router.get('/notifications', attendanceController.getNotifications);
router.put('/notifications/:notifyId/read', attendanceController.markNotificationAsRead);

// 10. CLOCK-OUT ALERTS (Admin/System - can be called periodically)
router.post('/alerts/check-clock-out', attendanceController.checkAndSendClockOutAlerts);

module.exports = router;