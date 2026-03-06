const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');

// POST /api/attendance/checkin
router.post('/checkin', attendanceController.checkIn);

// GET /api/attendance/recent?limit=20
router.get('/recent', attendanceController.getRecent);

module.exports = router;
