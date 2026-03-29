const db = require('../config/db');
const geo = require('../utils/geo');

// =============================================================
// 1. STATUS CHECK (Helps Frontend toggle Clock In/Out button)
// =============================================================
exports.getCheckinStatus = (req, res) => {
  const userId = req.user.userId;
  // Look for a record that has a check-in time but NO check-out time
  const sql = `SELECT * FROM Attendance WHERE User_ID = ? AND Check_out_time IS NULL LIMIT 1`;
  
  db.get(sql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ 
      checkedIn: !!row, 
      session: row || null 
    });
  });
};

// =============================================================
// 2. CLOCK IN (With GPS Verification)
// =============================================================
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { userId, orgId } = req.user;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'GPS location is required to check in.' });
    }

    // A. SaaS Geofence Check
    const fences = await new Promise((resolve) => {
      db.all('SELECT * FROM Geofence WHERE Org_ID = ? AND Is_Active = 1', [orgId], (err, rows) => resolve(rows || []));
    });

    let withinRange = fences.length === 0; // If no fences set, allow bypass
    for (const fence of fences) {
      const check = geo.isWithinGeofence(latitude, longitude, fence.Latitude, fence.Longitude, fence.Radius);
      if (check.isWithin) { withinRange = true; break; }
    }

    if (!withinRange) {
      return res.status(403).json({ error: 'Denied: You are not within an authorized work zone.' });
    }

    // B. Prevent Double Check-in
    const activeSession = await new Promise((resolve) => {
      db.get('SELECT * FROM Attendance WHERE User_ID = ? AND Check_out_time IS NULL', [userId], (err, row) => resolve(row));
    });
    if (activeSession) return res.status(400).json({ error: 'You are already clocked in.' });

    // C. Record Entry (Method_ID 3 = GPS)
    const sql = `
      INSERT INTO Attendance (
        User_ID, Org_ID, Check_in_time, Status_ID, Method_ID, Latitude, Longitude, Device_ID
      ) VALUES (?, ?, datetime('now', 'localtime'), 1, 3, ?, ?, 1)
    `;

    db.run(sql, [userId, orgId, latitude, longitude], function(err) {
      if (err) return res.status(500).json({ error: 'Check-in failed: ' + err.message });
      res.status(201).json({ success: true, message: 'Clock-in successful' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 3. CLOCK OUT (With GPS Verification)
// =============================================================
exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { userId, orgId } = req.user;

    // A. Geofence Check (Ensures they didn't leave the office before clocking out)
    const fences = await new Promise((resolve) => {
      db.all('SELECT * FROM Geofence WHERE Org_ID = ? AND Is_Active = 1', [orgId], (err, rows) => resolve(rows || []));
    });

    let withinRange = fences.length === 0; 
    for (const fence of fences) {
      const check = geo.isWithinGeofence(latitude, longitude, fence.Latitude, fence.Longitude, fence.Radius);
      if (check.isWithin) { withinRange = true; break; }
    }

    if (!withinRange) {
      return res.status(403).json({ error: 'Denied: You must be at the work zone to clock out.' });
    }

    // B. Update the record
    const sql = `
      UPDATE Attendance 
      SET Check_out_time = datetime('now', 'localtime') 
      WHERE User_ID = ? AND Org_ID = ? AND Check_out_time IS NULL
    `;

    db.run(sql, [userId, orgId], function(err) {
      if (err) return res.status(500).json({ error: 'Check-out failed' });
      if (this.changes === 0) return res.status(400).json({ error: 'No active session found.' });
      res.json({ success: true, message: 'Clock-out successful. Goodbye!' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 4. PERSONAL HISTORY (For usercheckin.vue)
// =============================================================
exports.getMyHistory = (req, res) => {
  const userId = req.user.userId;
  
  const sql = `
    SELECT 
      a.Attend_ID, 
      a.Check_in_time, 
      a.Check_out_time, 
      s.Status_Name,
      m.Method_Name,
      -- Calculate hours worked
      CASE WHEN a.Check_out_time IS NOT NULL 
           THEN (julianday(a.Check_out_time) - julianday(a.Check_in_time)) * 24 
           ELSE 0 END as duration
    FROM Attendance a
    JOIN Attendance_Status s ON a.Status_ID = s.Status_ID
    JOIN Attendance_Method m ON a.Method_ID = m.Method_ID
    WHERE a.User_ID = ?
    ORDER BY a.Check_in_time DESC`;

  db.all(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch history' });
    res.json(rows);
  });
};

// =============================================================
// 5. ADMIN UTILITIES
// =============================================================
exports.getRecent = (req, res) => {
  const orgId = req.user.orgId;
  const sql = `
    SELECT a.*, u.First_Name, u.SurName 
    FROM Attendance a 
    JOIN User u ON a.User_ID = u.User_ID 
    WHERE u.Org_ID = ? 
    ORDER BY a.Check_in_time DESC LIMIT 15`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Fetch failed' });
    res.json(rows || []);
  });
};

exports.getOrgSummary = (req, res) => res.json({ success: true });
exports.getOrgLogs = (req, res) => res.json({ logs: [] });
exports.generateReport = (req, res) => res.json({ success: true });