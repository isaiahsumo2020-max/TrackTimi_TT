const router = require('express').Router();
const shiftController = require('../controllers/shift.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

// Authentication required for all routes
router.use(authenticateToken);

// POST /api/shifts - Create shift
router.post('/', requireAdmin, shiftController.createShift);

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

// DELETE /api/shifts/user/:userId - Remove user from shift
router.delete('/user/:userId', requireAdmin, (req, res) => {
  req.body.userId = req.params.userId;
  shiftController.removeUserShift(req, res);
});

// PUT /api/shifts/user/:userId - Update user shift
router.put('/user/:userId', requireAdmin, (req, res) => {
  req.body.userId = req.params.userId;
  shiftController.updateUserShift(req, res);
});

module.exports = router;
