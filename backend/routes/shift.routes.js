const router = require('express').Router();
const shiftController = require('../controllers/shift.controller');

// POST /api/shifts - Create shift
router.post('/', shiftController.createShift);

// GET /api/shifts/user/:userId - Get user shifts
router.get('/user/:userId', shiftController.getUserShifts);

// GET /api/shifts/today - Today's shifts
router.get('/today', (req, res) => {
  const db = require('../config/db');
  const today = new Date().toISOString().split('T')[0];
  
  db.all(`
    SELECT S.*, U.First_Name, U.SurName 
    FROM Shift S 
    JOIN User U ON S.User_ID = U.User_ID 
    WHERE date(S.Shift_Date) = ?
    ORDER BY S.Shift_Start_Time
  `, [today], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
