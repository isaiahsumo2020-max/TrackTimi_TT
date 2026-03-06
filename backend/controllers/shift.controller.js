const db = require('../config/db');

exports.createShift = (req, res) => {
  const { userId, shiftStartTime, shiftEndTime, shiftDate } = req.body;
  
  const sql = `
    INSERT INTO Shift (User_ID, Shift_Start_Time, Shift_End_Time, Shift_Date)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(sql, [userId, shiftStartTime, shiftEndTime, shiftDate], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ Shift_ID: this.lastID });
  });
};

// ADD THIS NEW FUNCTION - BOTTOM of file, before module.exports
exports.getTodayShifts = (req, res) => {
  const db = require('../config/db');
  const today = new Date().toISOString().split('T')[0];
  
  db.all(`
    SELECT S.*, U.First_Name, U.SurName 
    FROM Shift S 
    JOIN User U ON S.User_ID = U.User_ID 
    WHERE date(S.Shift_Date) = ?
  `, [today], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getUserShifts = (req, res) => {
  const userId = req.params.userId;
  db.all(`
    SELECT * FROM Shift WHERE User_ID = ? ORDER BY Shift_Date DESC
  `, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
