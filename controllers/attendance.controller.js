const db = require('../config/db');
const geo = require('../utils/geo');

// =============================================================
// 1. STATUS CHECK
// =============================================================
exports.getCheckinStatus = (req, res) => {
  const userId = req.user.userId;
  const sql = `SELECT * FROM Attendance WHERE User_ID = ? AND Check_out_time IS NULL LIMIT 1`;
  
  db.get(sql, [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ checkedIn: !!row, session: row || null });
  });
};

// =============================================================
// 2. CLOCK IN (With Robust Geofence Validation)
// =============================================================
exports.checkIn = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { userId, orgId } = req.user;

    console.log(`📍 User ${userId} checking in at: Lat ${latitude}, Lng ${longitude}`);

    const fences = await new Promise((resolve) => {
      db.all('SELECT * FROM Geofence WHERE Org_ID = ? AND Is_Active = 1', [orgId], (err, rows) => resolve(rows || []));
    });

    console.log(`🔍 Found ${fences.length} authorized zones for Org ${orgId}`);

    let authorized = false;
    let minDistance = 999999;

    for (const fence of fences) {
      const check = geo.isWithinGeofence(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseFloat(fence.Latitude), 
        parseFloat(fence.Longitude), 
        parseInt(fence.Radius)
      );

      console.log(`📏 Distance to "${fence.Location_Name}": ${check.distance}m (Allowed: ${fence.Radius}m)`);

      if (check.isWithin) {
        authorized = true;
        break;
      }
      if (check.distance < minDistance) minDistance = check.distance;
    }

    if (!authorized) {
      return res.status(403).json({ 
        error: `Denied: Nearest zone is ${minDistance}m away.`,
        distance: minDistance
      });
    }

    // Proceed with INSERT INTO Attendance...

    // C. Double Check-in Prevention
    const active = await new Promise((resolve) => {
      db.get('SELECT * FROM Attendance WHERE User_ID = ? AND Check_out_time IS NULL', [userId], (err, row) => resolve(row));
    });
    if (active) return res.status(400).json({ error: 'You are already clocked in.' });

    // D. Record Attendance (Using Method_ID 3 for GPS)
    const sql = `
      INSERT INTO Attendance (
        User_ID, Org_ID, Check_in_time, Status_ID, Method_ID, Latitude, Longitude, Device_ID
      ) VALUES (?, ?, datetime('now', 'localtime'), 1, 3, ?, ?, 1)
    `;

    db.run(sql, [userId, orgId, latitude, longitude], function(err) {
      if (err) return res.status(500).json({ error: 'DB Error: ' + err.message });
      res.status(201).json({ success: true, message: 'Clock-in successful' });
    });

  } catch (error) {
    console.error("💥 Check-in system error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 3. CLOCK OUT (With Robust Geofence Validation)
// =============================================================
exports.checkOut = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { userId, orgId } = req.user;

    // A. Geofence Check (Ensuring they are still in zone to clock out)
    const fences = await new Promise((resolve) => {
      db.all('SELECT * FROM Geofence WHERE Org_ID = ? AND Is_Active = 1', [orgId], (err, rows) => resolve(rows || []));
    });

    let authorized = fences.length === 0;
    let nearestDist = 999999;

    for (const fence of fences) {
      const check = geo.isWithinGeofence(
        parseFloat(latitude), 
        parseFloat(longitude), 
        parseFloat(fence.Latitude), 
        parseFloat(fence.Longitude), 
        parseInt(fence.Radius || 500)
      );
      if (check.isWithin) { authorized = true; break; }
      if (check.distance < nearestDist) nearestDist = check.distance;
    }

    if (!authorized) {
      return res.status(403).json({ 
        error: `Denied: You must be at the work zone to clock out. (Distance: ${nearestDist}m)` 
      });
    }

    // B. Update record
    const sql = `UPDATE Attendance SET Check_out_time = datetime('now', 'localtime') 
               WHERE User_ID = ? AND Org_ID = ? AND Check_out_time IS NULL`;

    db.run(sql, [userId, orgId], function(err) {
      if (err) return res.status(500).json({ error: 'Check-out failed' });
      if (this.changes === 0) return res.status(400).json({ error: 'No active session found.' });
      res.json({ success: true, message: 'Clock-out successful.' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// =============================================================
// 4. PERSONAL HISTORY
// =============================================================
exports.getMyHistory = (req, res) => {
  const userId = req.user.userId;
  const sql = `
    SELECT 
      a.Attend_ID, a.Check_in_time, a.Check_out_time, 
      s.Status_Name, m.Method_Name,
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