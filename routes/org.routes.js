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
      u.Avatar_Data AS avatar,
      u.Avatar_MIME_Type AS avatarMimeType,
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
    console.log(`[USERS] Fetched ${rows.length} users, avatars: ${rows.filter(r => r.avatar).length}`);
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

// =============================================================
// SCHEDULE/SHIFT MANAGEMENT
// =============================================================

// GET: Fetch all shifts for the organization
router.get('/shifts', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;

  const sql = `
    SELECT 
      s.Shift_ID,
      s.User_ID,
      s.Shift_Date,
      s.Shift_Start_Time,
      s.Shift_End_Time,
      u.First_Name,
      u.SurName,
      u.Email,
      u.Job_Title,
      u.Employee_ID
    FROM Shift s
    JOIN User u ON s.User_ID = u.User_ID
    WHERE u.Org_ID = ?
    ORDER BY s.Shift_Date DESC, s.Shift_Start_Time ASC`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) {
      console.error('❌ Shift Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch shifts: ' + err.message });
    }
    res.json(rows || []);
  });
});

// POST: Create a new shift
router.post('/shifts', requireAdmin, (req, res) => {
  const { userId, shiftDate, shiftStartTime, shiftEndTime } = req.body;
  const orgId = req.user.orgId;

  // Validate required fields
  if (!userId || !shiftDate || !shiftStartTime || !shiftEndTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // First verify the user belongs to this organization
  const verifyUserSql = `SELECT User_ID FROM User WHERE User_ID = ? AND Org_ID = ? AND Is_Active = 1`;
  
  db.get(verifyUserSql, [userId, orgId], (err, user) => {
    if (err || !user) {
      return res.status(403).json({ error: 'User not found in your organization' });
    }

    // Create the shift
    const createShiftSql = `
      INSERT INTO Shift (User_ID, Shift_Date, Shift_Start_Time, Shift_End_Time, Org_ID)
      VALUES (?, ?, ?, ?, ?)`;

    db.run(createShiftSql, [userId, shiftDate, shiftStartTime, shiftEndTime, orgId], function(err) {
      if (err) {
        console.error('❌ Shift Create Error:', err.message);
        return res.status(500).json({ error: 'Failed to create shift: ' + err.message });
      }
      res.status(201).json({ success: true, Shift_ID: this.lastID });
    });
  });
});

// PUT: Update a shift
router.put('/shifts/:id', requireAdmin, (req, res) => {
  const shiftId = req.params.id;
  const { userId, shiftDate, shiftStartTime, shiftEndTime } = req.body;
  const orgId = req.user.orgId;

  // First verify the shift belongs to this organization
  const verifySql = `
    SELECT s.Shift_ID FROM Shift s
    JOIN User u ON s.User_ID = u.User_ID
    WHERE s.Shift_ID = ? AND u.Org_ID = ?`;

  db.get(verifySql, [shiftId, orgId], (err, shift) => {
    if (err || !shift) {
      return res.status(403).json({ error: 'Shift not found or access denied' });
    }

    // Update the shift
    const updateSql = `
      UPDATE Shift 
      SET User_ID = ?, Shift_Date = ?, Shift_Start_Time = ?, Shift_End_Time = ?
      WHERE Shift_ID = ?`;

    db.run(updateSql, [userId, shiftDate, shiftStartTime, shiftEndTime, shiftId], function(err) {
      if (err) {
        console.error('❌ Shift Update Error:', err.message);
        return res.status(500).json({ error: 'Failed to update shift: ' + err.message });
      }
      res.json({ success: true, message: 'Shift updated' });
    });
  });
});

// DELETE: Delete a shift
router.delete('/shifts/:id', requireAdmin, (req, res) => {
  const shiftId = req.params.id;
  const orgId = req.user.orgId;

  // First verify the shift belongs to this organization
  const verifySql = `
    SELECT s.Shift_ID FROM Shift s
    JOIN User u ON s.User_ID = u.User_ID
    WHERE s.Shift_ID = ? AND u.Org_ID = ?`;

  db.get(verifySql, [shiftId, orgId], (err, shift) => {
    if (err || !shift) {
      return res.status(403).json({ error: 'Shift not found or access denied' });
    }

    // Delete the shift
    db.run(`DELETE FROM Shift WHERE Shift_ID = ?`, [shiftId], function(err) {
      if (err) {
        console.error('❌ Shift Delete Error:', err.message);
        return res.status(500).json({ error: 'Failed to delete shift: ' + err.message });
      }
      res.json({ success: true, message: 'Shift deleted' });
    });
  });
});

// =============================================================
// SHIFT TYPES MANAGEMENT
// =============================================================

// GET: Fetch all shift types for the organization
router.get('/shift-types', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const sql = `
    SELECT * FROM ShiftType 
    WHERE Org_ID = ? AND Is_Active = 1
    ORDER BY Start_Time ASC`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) {
      console.error('❌ ShiftType Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch shift types: ' + err.message });
    }
    res.json(rows || []);
  });
});

// POST: Create a new shift type
router.post('/shift-types', requireAdmin, (req, res) => {
  const { name, startTime, endTime, description, colorCode } = req.body;
  const orgId = req.user.orgId;

  if (!name || !startTime || !endTime) {
    return res.status(400).json({ error: 'Name, start time, and end time are required' });
  }

  const sql = `
    INSERT INTO ShiftType (Org_ID, ShiftType_Name, Start_Time, End_Time, Description, Color_Code)
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.run(sql, [orgId, name, startTime, endTime, description || null, colorCode || '#3b82f6'], function(err) {
    if (err) {
      console.error('❌ ShiftType Create Error:', err.message);
      return res.status(500).json({ error: 'Failed to create shift type: ' + err.message });
    }
    res.status(201).json({ success: true, ShiftType_ID: this.lastID });
  });
});

// PUT: Update a shift type
router.put('/shift-types/:id', requireAdmin, (req, res) => {
  const { name, startTime, endTime, description, colorCode } = req.body;
  const shiftTypeId = req.params.id;
  const orgId = req.user.orgId;

  const sql = `
    UPDATE ShiftType 
    SET ShiftType_Name = ?, Start_Time = ?, End_Time = ?, Description = ?, Color_Code = ?, Updated_at = CURRENT_TIMESTAMP
    WHERE ShiftType_ID = ? AND Org_ID = ?`;

  db.run(sql, [name, startTime, endTime, description || null, colorCode || '#3b82f6', shiftTypeId, orgId], function(err) {
    if (err) {
      console.error('❌ ShiftType Update Error:', err.message);
      return res.status(500).json({ error: 'Failed to update shift type: ' + err.message });
    }
    res.json({ success: true, message: 'Shift type updated' });
  });
});

// DELETE: Delete a shift type
router.delete('/shift-types/:id', requireAdmin, (req, res) => {
  const shiftTypeId = req.params.id;
  const orgId = req.user.orgId;

  db.run(`UPDATE ShiftType SET Is_Active = 0 WHERE ShiftType_ID = ? AND Org_ID = ?`, [shiftTypeId, orgId], function(err) {
    if (err) {
      console.error('❌ ShiftType Delete Error:', err.message);
      return res.status(500).json({ error: 'Failed to delete shift type: ' + err.message });
    }
    res.json({ success: true, message: 'Shift type deleted' });
  });
});

// =============================================================
// SCHEDULES MANAGEMENT (Multi-employee recurring schedules)
// =============================================================

// GET: Fetch all schedules with employee details
router.get('/schedules', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const sql = `
    SELECT 
      s.Schedule_ID,
      s.Org_ID,
      s.ShiftType_ID,
      s.Schedule_Name,
      s.Start_Date,
      s.End_Date,
      s.Description,
      s.Is_Active,
      s.Created_at,
      st.ShiftType_Name,
      st.Start_Time,
      st.End_Time,
      st.Color_Code,
      u.User_ID,
      u.First_Name,
      u.SurName,
      u.Email
    FROM Schedule s
    JOIN ShiftType st ON s.ShiftType_ID = st.ShiftType_ID
    LEFT JOIN ScheduleEmployee se ON s.Schedule_ID = se.Schedule_ID
    LEFT JOIN User u ON se.User_ID = u.User_ID
    WHERE s.Org_ID = ? AND s.Is_Active = 1
    ORDER BY s.Start_Date DESC, s.Schedule_Name ASC`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) {
      console.error('❌ Schedule Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch schedules: ' + err.message });
    }

    // Group results by Schedule_ID
    const schedulesMap = {};
    rows.forEach(row => {
      if (!schedulesMap[row.Schedule_ID]) {
        schedulesMap[row.Schedule_ID] = {
          Schedule_ID: row.Schedule_ID,
          Schedule_Name: row.Schedule_Name,
          ShiftType_ID: row.ShiftType_ID,
          ShiftType_Name: row.ShiftType_Name,
          Start_Time: row.Start_Time,
          End_Time: row.End_Time,
          Color_Code: row.Color_Code,
          Start_Date: row.Start_Date,
          End_Date: row.End_Date,
          Description: row.Description,
          Is_Active: row.Is_Active,
          Created_at: row.Created_at,
          employees: []
        };
      }
      if (row.User_ID) {
        schedulesMap[row.Schedule_ID].employees.push({
          User_ID: row.User_ID,
          First_Name: row.First_Name,
          SurName: row.SurName,
          Email: row.Email
        });
      }
    });

    res.json(Object.values(schedulesMap) || []);
  });
});

// POST: Create a new schedule with multiple employees
router.post('/schedules', requireAdmin, (req, res) => {
  const { name, shiftTypeId, startDate, endDate, employeeIds, description } = req.body;
  const orgId = req.user.orgId;

  if (!name || !shiftTypeId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Name, shift type, start date, and end date are required' });
  }

  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res.status(400).json({ error: 'At least one employee is required' });
  }

  // Verify ShiftType exists and belongs to org
  const verifyShiftSql = `SELECT ShiftType_ID FROM ShiftType WHERE ShiftType_ID = ? AND Org_ID = ?`;
  
  db.get(verifyShiftSql, [shiftTypeId, orgId], (err, shiftType) => {
    if (err || !shiftType) {
      return res.status(403).json({ error: 'Shift type not found or access denied' });
    }

    // Create the schedule
    const createScheduleSql = `
      INSERT INTO Schedule (Org_ID, ShiftType_ID, Schedule_Name, Start_Date, End_Date, Description)
      VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(createScheduleSql, [orgId, shiftTypeId, name, startDate, endDate, description || null], function(err) {
      if (err) {
        console.error('❌ Schedule Create Error:', err.message);
        return res.status(500).json({ error: 'Failed to create schedule: ' + err.message });
      }

      const scheduleId = this.lastID;

      // Verify all employees belong to org
      const placeholders = employeeIds.map(() => '?').join(',');
      const verifyEmpSql = `SELECT User_ID FROM User WHERE User_ID IN (${placeholders}) AND Org_ID = ? AND Is_Active = 1`;
      const verifyParams = [...employeeIds, orgId];

      db.all(verifyEmpSql, verifyParams, (err, employees) => {
        if (err || employees.length !== employeeIds.length) {
          return res.status(403).json({ error: 'One or more employees not found or access denied' });
        }

        // Insert employees into ScheduleEmployee
        const insertEmpSql = `INSERT INTO ScheduleEmployee (Schedule_ID, User_ID) VALUES (?, ?)`;
        let completed = 0;
        let hasError = false;

        employeeIds.forEach(employeeId => {
          db.run(insertEmpSql, [scheduleId, employeeId], (err) => {
            if (err && !hasError) {
              hasError = true;
              console.error('❌ ScheduleEmployee Insert Error:', err.message);
              return res.status(500).json({ error: 'Failed to add employees to schedule: ' + err.message });
            }
            completed++;
            if (completed === employeeIds.length && !hasError) {
              res.status(201).json({ success: true, Schedule_ID: scheduleId });
            }
          });
        });
      });
    });
  });
});

// PUT: Update a schedule
router.put('/schedules/:id', requireAdmin, (req, res) => {
  const { name, shiftTypeId, startDate, endDate, employeeIds, description } = req.body;
  const scheduleId = req.params.id;
  const orgId = req.user.orgId;

  // Verify schedule exists
  const verifySql = `SELECT Schedule_ID FROM Schedule WHERE Schedule_ID = ? AND Org_ID = ?`;
  
  db.get(verifySql, [scheduleId, orgId], (err, schedule) => {
    if (err || !schedule) {
      return res.status(403).json({ error: 'Schedule not found or access denied' });
    }

    // Update schedule basic info
    const updateSql = `
      UPDATE Schedule 
      SET ShiftType_ID = ?, Schedule_Name = ?, Start_Date = ?, End_Date = ?, Description = ?, Updated_at = CURRENT_TIMESTAMP
      WHERE Schedule_ID = ?`;

    db.run(updateSql, [shiftTypeId, name, startDate, endDate, description || null, scheduleId], (err) => {
      if (err) {
        console.error('❌ Schedule Update Error:', err.message);
        return res.status(500).json({ error: 'Failed to update schedule: ' + err.message });
      }

      if (employeeIds && Array.isArray(employeeIds)) {
        // Delete old employee associations
        db.run(`DELETE FROM ScheduleEmployee WHERE Schedule_ID = ?`, [scheduleId], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to update employees: ' + err.message });
          }

          // Add new employee associations
          const insertEmpSql = `INSERT INTO ScheduleEmployee (Schedule_ID, User_ID) VALUES (?, ?)`;
          let completed = 0;
          let hasError = false;

          employeeIds.forEach(employeeId => {
            db.run(insertEmpSql, [scheduleId, employeeId], (err) => {
              if (err && !hasError) {
                hasError = true;
                console.error('❌ ScheduleEmployee Update Error:', err.message);
                return res.status(500).json({ error: 'Failed to update employees: ' + err.message });
              }
              completed++;
              if (completed === employeeIds.length && !hasError) {
                res.json({ success: true, message: 'Schedule updated' });
              }
            });
          });
        });
      } else {
        res.json({ success: true, message: 'Schedule updated' });
      }
    });
  });
});

// DELETE: Delete a schedule
router.delete('/schedules/:id', requireAdmin, (req, res) => {
  const scheduleId = req.params.id;
  const orgId = req.user.orgId;

  db.run(`UPDATE Schedule SET Is_Active = 0 WHERE Schedule_ID = ? AND Org_ID = ?`, [scheduleId, orgId], function(err) {
    if (err) {
      console.error('❌ Schedule Delete Error:', err.message);
      return res.status(500).json({ error: 'Failed to delete schedule: ' + err.message });
    }
    res.json({ success: true, message: 'Schedule deleted' });
  });
});

// GET: User's current and upcoming schedule
router.get('/my-schedule', (req, res) => {
  const userId = req.user.userId;
  const orgId = req.user.orgId;
  const today = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      s.Schedule_ID,
      s.Schedule_Name,
      s.Start_Date,
      s.End_Date,
      st.ShiftType_Name,
      st.Start_Time,
      st.End_Time,
      st.Color_Code,
      d.Depart_Name
    FROM Schedule s
    INNER JOIN ScheduleEmployee se ON s.Schedule_ID = se.Schedule_ID
    INNER JOIN ShiftType st ON s.ShiftType_ID = st.ShiftType_ID
    LEFT JOIN Department d ON se.Dep_ID = d.Dep_ID
    WHERE se.User_ID = ? 
      AND s.Org_ID = ? 
      AND s.Start_Date >= ? 
      AND s.Is_Active = 1
    ORDER BY s.Start_Date ASC
    LIMIT 10`;

  db.all(sql, [userId, orgId, today], (err, rows) => {
    if (err) {
      console.error('❌ User Schedule Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch schedule: ' + err.message });
    }
    res.json(rows || []);
  });
});

// GET: User's current shift (for dashboard display)
router.get('/my-current-shift', (req, res) => {
  const userId = req.user.userId;
  const orgId = req.user.orgId;
  const today = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      s.Schedule_ID,
      s.Schedule_Name,
      s.Start_Date as Shift_Date,
      st.ShiftType_Name,
      st.Start_Time as Shift_Start_Time,
      st.End_Time as Shift_End_Time,
      st.Color_Code,
      d.Depart_Name as Depart_Name
    FROM Schedule s
    INNER JOIN ScheduleEmployee se ON s.Schedule_ID = se.Schedule_ID
    INNER JOIN ShiftType st ON s.ShiftType_ID = st.ShiftType_ID
    LEFT JOIN Department d ON se.Dep_ID = d.Dep_ID
    WHERE se.User_ID = ? 
      AND s.Org_ID = ? 
      AND s.Start_Date >= ? 
      AND s.Is_Active = 1
    ORDER BY s.Start_Date ASC
    LIMIT 1`;

  db.get(sql, [userId, orgId, today], (err, row) => {
    if (err) {
      console.error('❌ Current Shift Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch current shift: ' + err.message });
    }
    res.json(row || null);
  });
});

module.exports = router;