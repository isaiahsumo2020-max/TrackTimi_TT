const db = require('../config/db');

exports.createShift = (req, res) => {
  const { userId, shiftStartTime, shiftEndTime, shiftDate } = req.body;
  const orgId = req.user?.orgId || req.user?.Org_ID;
  
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }
  
  const sql = `
    INSERT INTO Shift (User_ID, Org_ID, Shift_Start_Time, Shift_End_Time, Shift_Date)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [userId, orgId, shiftStartTime, shiftEndTime, shiftDate], function(err) {
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
  const orgId = req.user?.orgId || req.user?.Org_ID;
  
  db.all(`
    SELECT * FROM Shift WHERE User_ID = ? AND Org_ID = ? ORDER BY Shift_Date DESC
  `, [userId, orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.removeUserShift = (req, res) => {
  const userId = req.params.userId || req.body.userId;
  const orgId = req.user?.orgId || req.user?.Org_ID;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }
  
  const sql = `DELETE FROM Shift WHERE User_ID = ? AND Org_ID = ?`;
  
  db.run(sql, [userId, orgId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Shift removed successfully', changes: this.changes });
  });
};

exports.updateUserShift = (req, res) => {
  const userId = req.params.userId || req.body.userId;
  const { shiftStartTime, shiftEndTime, shiftDate } = req.body;
  const orgId = req.user?.orgId || req.user?.Org_ID;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  if (!orgId) {
    return res.status(400).json({ error: 'Organization ID is required' });
  }
  
  const sql = `
    UPDATE Shift 
    SET Shift_Start_Time = ?, Shift_End_Time = ?, Shift_Date = ?
    WHERE User_ID = ? AND Org_ID = ?
  `;
  
  db.run(sql, [shiftStartTime, shiftEndTime, shiftDate, userId, orgId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Shift updated successfully', changes: this.changes });
  });
};
