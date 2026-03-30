const router = require('express').Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');

// Apply authentication to all organization-level routes
router.use(authenticateToken);

// =============================================================
// 1. PERSONNEL MANAGEMENT (Users)
// =============================================================

// GET: Fetch all personnel with their Department details
router.get('/users', requireAdmin, (req, res) => {
  const orgId = req.user.orgId; 

  const sql = `
    SELECT 
      u.User_ID, 
      u.First_Name AS firstName, 
      u.SurName AS surName, 
      u.Email AS email, 
      u.Job_Title AS jobTitle, 
      u.User_Type_ID AS userTypeId,
      u.Employee_ID AS employeeId,
      d.Depart_Name AS departmentName
    FROM User u
    LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
    WHERE u.Org_ID = ? AND u.Is_Active = 1
    ORDER BY u.First_Name ASC`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) {
      console.error("Fetch Users Error:", err.message);
      return res.status(500).json({ error: 'Database sync error' });
    }
    res.json(rows); 
  });
});

// POST: Provision new personnel (With Password Hashing)
router.post('/users', requireAdmin, async (req, res) => {
  const { firstName, surName, email, password, depId, userTypeId, jobTitle } = req.body;
  const { generateUniqueEmployeeId } = require('../utils/employeeId');
  const orgId = req.user.orgId; 

  if (!firstName || !surName || !email || !password) {
    return res.status(400).json({ error: 'Name, Email, and Password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    generateUniqueEmployeeId((err, employeeId) => {
      if (err) return res.status(500).json({ error: 'ID generation failed' });

      const sql = `
        INSERT INTO User (
          First_Name, SurName, Email, Password, Org_ID, 
          User_Type_ID, Employee_ID, Job_Title, Dep_ID, Is_Active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`;

      db.run(sql, [
        firstName, 
        surName, 
        email.toLowerCase(), 
        hashedPassword, 
        orgId, 
        userTypeId || 3, 
        employeeId, 
        jobTitle, 
        depId || null
      ], function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already registered' });
          return res.status(500).json({ error: 'Database write failed: ' + err.message });
        }
        res.status(201).json({ success: true, userId: this.lastID, employeeId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Encryption failed' });
  }
});

// =============================================================
// 2. LIVE DEPARTMENT MANAGEMENT
// =============================================================

// GET: Fetch departments with live member counts
// GET: Fetch departments with a nested list of all personnel
router.get('/departments', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;

  // We fetch everything in one query using a JOIN
  const sql = `
    SELECT 
      d.Dep_ID AS deptId, 
      d.Depart_Name AS deptName,
      u.User_ID AS userId,
      u.First_Name AS firstName,
      u.SurName AS surName,
      u.Email AS email,
      u.Job_Title AS jobTitle
    FROM Department d
    LEFT JOIN User u ON d.Dep_ID = u.Dep_ID AND u.Is_Active = 1
    WHERE d.Org_ID = ? AND d.Is_Active = 1
    ORDER BY d.Depart_Name ASC, u.First_Name ASC`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch department details' });

    // --- DATA TRANSFORMATION ---
    // Since SQL returns flat rows, we group them by Department in JavaScript
    const departmentsMap = {};

    rows.forEach(row => {
      if (!departmentsMap[row.deptId]) {
        departmentsMap[row.deptId] = {
          id: row.deptId,
          name: row.deptName,
          users: [] // This will hold our detailed list
        };
      }
      
      // If there is a user in this row, add them to the users array
      if (row.userId) {
        departmentsMap[row.deptId].users.push({
          id: row.userId,
          name: `${row.firstName} ${row.surName}`,
          email: row.email,
          job: row.jobTitle
        });
      }
    });

    // Convert the map back to an array for the frontend
    res.json(Object.values(departmentsMap));
  });
});

// POST: Create a new department
// POST: Create a new department
router.post('/departments', requireAdmin, (req, res) => {
  const { name } = req.body;
  const orgId = req.user.orgId;

  if (!name) return res.status(400).json({ error: 'Department name is required' });

  const sql = `INSERT INTO Department (Depart_Name, Org_ID, Is_Active) VALUES (?, ?, 1)`;
  
  db.run(sql, [name, orgId], function(err) {
    if (err) {
      // LOG THE REAL ERROR TO YOUR TERMINAL
      console.error("❌ DEPT CREATE ERROR:", err.message);
      // SEND THE REAL ERROR TO THE FRONTEND
      return res.status(500).json({ error: 'Database Error: ' + err.message });
    }
    res.status(201).json({ success: true, id: this.lastID, name });
  });
});

/// =============================================================
// 3. DETAILED DASHBOARD METRICS (PRODUCTION READY)
// =============================================================

router.get('/dashboard-metrics', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  
  // 1. Get ALL active staff members for this Org
  const sqlAllStaff = `SELECT User_ID, First_Name, SurName, Job_Title FROM User WHERE Org_ID = ? AND Is_Active = 1`;

  // 2. Get all attendance records for TODAY (Removing strict localtime to be safe)
  const sqlAttendance = `
    SELECT a.*, u.First_Name, u.SurName, u.Job_Title 
    FROM Attendance a 
    JOIN User u ON a.User_ID = u.User_ID 
    WHERE a.Org_ID = ? AND date(a.Check_in_time) = date('now', 'localtime')`;

  // 3. Get 7-Day Trend
  const sqlTrend = `SELECT date(Check_in_time) as day, COUNT(*) as count FROM Attendance WHERE Org_ID = ? AND Check_in_time >= date('now', '-6 days') GROUP BY day`;

  // 4. Get Departments
  const sqlDepts = `SELECT d.Depart_Name as name, COUNT(u.User_ID) as staff_count FROM Department d LEFT JOIN User u ON d.Dep_ID = u.Dep_ID WHERE d.Org_ID = ? GROUP BY d.Dep_ID`;

  db.all(sqlAllStaff, [orgId], (err, allStaff) => {
    if (err) return res.status(500).json({ error: 'Staff fetch error' });

    db.all(sqlAttendance, [orgId], (err, attendanceToday) => {
      if (err) return res.status(500).json({ error: 'Attendance fetch error' });

      db.all(sqlTrend, [orgId], (err, trend) => {
        db.all(sqlDepts, [orgId], (err, departments) => {

          // DEBUG LOGS - Check your terminal!
          console.log(`SaaS Dashboard Sync [Org ${orgId}]:`);
          console.log(`- Total Staff in DB: ${allStaff.length}`);
          console.log(`- Check-ins Today: ${attendanceToday.length}`);

          // MAP PRESENT LIST
          const presentList = attendanceToday.map(r => ({
            name: `${r.First_Name} ${r.SurName}`,
            job: r.Job_Title,
            checkIn: r.Check_in_time,
            checkOut: r.Check_out_time,
            onSite: r.Check_out_time === null
          }));

          // MAP ABSENT LIST (People in allStaff who are NOT in attendanceToday)
          const presentIds = attendanceToday.map(a => a.User_ID);
          const absentList = allStaff
            .filter(s => !presentIds.includes(s.User_ID))
            .map(s => ({
              name: `${s.First_Name} ${s.SurName}`,
              job: s.Job_Title
            }));

          res.json({
            metrics: {
              total: allStaff.length,
              present: presentList.length,
              onSite: presentList.filter(u => u.onSite).length,
              absent: absentList.length
            },
            presentList,
            absentList,
            departments: departments || [],
            trend: trend || [],
            // Add raw activity logs for the pulse feed
            activityLogs: presentList.map(p => ({
              type: 'attendance',
              actor: p.name,
              action: 'clocked in',
              timestamp: p.checkIn
            })).slice(0, 10)
          });
        });
      });
    });
  });
});

// =============================================================
// GEOFENCING MANAGEMENT (Work Zones)
// =============================================================

// 1. GET: Fetch work zones (Accessible by BOTH Admin and Staff)
router.get('/geofences', authenticateToken, (req, res) => {
  const orgId = req.user.orgId;
  const sql = `SELECT Fence_ID, Location_Name, Latitude, Longitude, Radius FROM Geofence WHERE Org_ID = ? AND Is_Active = 1`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows); // Abraham Fallah needs this list to calculate his distance!
  });
});


router.post('/geofences', requireAdmin, (req, res) => {
  const { locationName, latitude, longitude, radius } = req.body;
  const orgId = req.user.orgId;

  // Log exactly what is arriving to the backend
  console.log("📥 Attempting to save zone:", { locationName, latitude, longitude, orgId });

  const sql = `INSERT INTO Geofence (Org_ID, Location_Name, Latitude, Longitude, Radius, Is_Active) VALUES (?, ?, ?, ?, ?, 1)`;
  
  db.run(sql, [orgId, locationName, latitude, longitude, radius || 200], function(err) {
    if (err) {
      // THIS WILL SHOW THE EXACT ERROR IN YOUR TERMINAL
      console.error("❌ SQLITE ERROR:", err.message);
      return res.status(500).json({ error: `Database Error: ${err.message}` });
    }
    
    console.log("✅ Zone saved successfully with ID:", this.lastID);
    res.status(201).json({ success: true, id: this.lastID });
  });
});

// 3. DELETE (Soft delete) a work zone
router.delete('/geofences/:id', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const fenceId = req.params.id;

  db.run(`UPDATE Geofence SET Is_Active = 0 WHERE Fence_ID = ? AND Org_ID = ?`, [fenceId, orgId], function(err) {
    if (err || this.changes === 0) return res.status(500).json({ error: 'Delete failed' });
    res.json({ success: true, message: 'Zone removed' });
  });
});

// --- ORGANIZATION SETTINGS MANAGEMENT ---

// 1. GET: Fetch settings for the current Org
router.get('/settings', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const sql = `SELECT * FROM Organization WHERE Org_ID = ?`;

  db.get(sql, [orgId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to load settings' });
    res.json(row);
  });
});

// 2. PUT: Update settings
router.put('/settings', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const { orgName, email, phone, address, themeColor, logoPath, logoMimeType } = req.body;

  const sql = `
    UPDATE Organization 
    SET Org_Name = ?, Email = ?, Phone_Num = ?, Address = ?, 
        Theme_Color = ?, Logo_Path = ?, Logo_MIME_Type = ?, Updated_at = CURRENT_TIMESTAMP
    WHERE Org_ID = ?`;

  db.run(sql, [orgName, email, phone, address, themeColor, logoPath, logoMimeType, orgId], function(err) {
    if (err) return res.status(500).json({ error: 'Database update failed' });
    
    // Add to Audit Log for SaaS tracking
    db.run(`INSERT INTO Audit_Log (User_ID, Org_ID, Action, Table_Name) VALUES (?, ?, 'UPDATE_SETTINGS', 'Organization')`, 
           [req.user.userId, orgId]);

    res.json({ success: true, message: 'Settings updated' });
  });
});
module.exports = router;