const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');

// POST /api/attendance/checkin
router.post('/checkin', attendanceController.checkIn);

// GET /api/attendance/recent?limit=20
router.get('/recent', attendanceController.getRecent);

// GET /api/attendance/logs?page=1&limit=25
router.get('/logs', attendanceController.getOrgLogs);

// GET /api/attendance/summary
router.get('/summary', attendanceController.getOrgSummary);

// GET /api/attendance/report
router.get('/report', attendanceController.generateReport);

module.exports = router;
