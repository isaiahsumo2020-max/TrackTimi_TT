const router = require('express').Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');
const { notifyNewUser, notifyNewDepartment, notifyNewGeofence, notifyOrgAdminAction } = require('../utils/notificationHelper');
const { notifyLocationCreated } = require('../utils/notificationService');

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

// POST: Provision new personnel (Send invitation email instead of direct creation)
router.post('/users', requireAdmin, async (req, res) => {
  const { firstName, surName, email, password, depId, userTypeId, jobTitle } = req.body;
  const { generateUniqueEmployeeId } = require('../utils/employeeId');
  const { sendInvitationEmail } = require('../utils/emailService');
  const Invitation = require('../models/Invitation');
  const crypto = require('crypto');
  
  const orgId = req.user.orgId;
  const userId = req.user.userId;

  if (!firstName || !surName || !email) {
    return res.status(400).json({ error: 'Name and Email are required' });
  }

  try {
    // Check if user already exists
    const existingUser = await new Promise((resolve) => {
      db.get('SELECT User_ID FROM User WHERE Email = ? AND Org_ID = ?', [email.toLowerCase(), orgId], (err, row) => resolve(row));
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered in this organization' });
    }

    // Check if invitation already pending
    const existingInvitation = await new Promise((resolve) => {
      db.get('SELECT Invitation_ID FROM Invitation WHERE Email = ? AND Org_ID = ? AND Is_Used = 0 AND Expires_At > datetime("now")', [email.toLowerCase(), orgId], (err, row) => resolve(row));
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An invitation is already pending for this email' });
    }

    // Generate invitation token and temporary password
    const invitationToken = crypto.randomBytes(24).toString('hex');
    const tempPassword = password || (Math.random().toString(36).slice(2, 10) + '!@');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create Invitation record
    const invitationSql = `INSERT INTO Invitation (Email, Org_ID, User_Type_ID, Token, Expires_At, Is_Used, Created_By, Created_at) VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))`;
    
    db.run(invitationSql, [email.toLowerCase(), orgId, userTypeId || 3, invitationToken, expiresAt, userId], async function(err) {
      if (err) {
        console.error('❌ Invitation creation error:', err);
        return res.status(500).json({ error: 'Failed to create invitation' });
      }

      const invitationId = this.lastID;
      console.log('✅ Invitation created for:', email);

      // Store pending employee details
      const pendingSql = `INSERT INTO Pending_Employee (Email, First_Name, SurName, Job_Title, Depart_ID, Org_ID, Invitation_ID, User_Type_ID, Created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`;
      db.run(pendingSql, [email.toLowerCase(), firstName, surName, jobTitle || null, depId || null, orgId, invitationId, userTypeId || 3], (errPending) => {
        if (errPending) console.error('Pending insert error:', errPending);
      });

      // Fetch organization name and inviter details
      db.get('SELECT Org_Name FROM Organization WHERE Org_ID = ?', [orgId], async (errOrg, org) => {
        if (errOrg) console.error('Org fetch error:', errOrg);
        
        db.get('SELECT First_Name, SurName FROM User WHERE User_ID = ?', [userId], async (errInviter, inviter) => {
          if (errInviter) console.error('Inviter fetch error:', errInviter);

          const orgName = org?.Org_Name || 'TrackTimi';
          const inviterName = inviter ? `${inviter.First_Name} ${inviter.SurName}` : 'Admin';

          console.log('📧 Sending invitation to:', email, 'from:', inviterName);

          // Send invitation email
          const emailResult = await sendInvitationEmail(email.toLowerCase(), invitationToken, orgName, inviterName, tempPassword);

          if (emailResult.success) {
            console.log('✅ Invitation email sent to:', email);
          } else {
            console.error('❌ Failed to send invitation email:', emailResult.error);
          }

          res.status(201).json({ 
            success: true, 
            message: `Invitation sent to ${email}. User will be created after they activate their account.`,
            email: email.toLowerCase(),
            status: 'pending'
          });
        });
      });
    });

  } catch (error) {
    console.error('❌ Provision error:', error);
    res.status(500).json({ error: 'Server error' });
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
  const userId = req.user.userId;

  if (!name) return res.status(400).json({ error: 'Department name is required' });

  const sql = `INSERT INTO Department (Depart_Name, Org_ID, Is_Active) VALUES (?, ?, 1)`;
  
  db.run(sql, [name, orgId], function(err) {
    if (err) {
      console.error("❌ DEPT CREATE ERROR:", err.message);
      return res.status(500).json({ error: 'Database Error: ' + err.message });
    }

    const newDeptId = this.lastID;
    const deptData = { 
      Dep_ID: newDeptId, 
      Depart_Name: name, 
      Org_ID: orgId 
    };

    console.log('\n📌 [DEPT CREATION] Starting notification trigger...');
    console.log('📌 [DEPT CREATION] OrgId:', orgId);
    console.log('📌 [DEPT CREATION] Dept Data:', deptData);

    // Trigger notification to superadmins
    notifyNewDepartment(deptData, { Org_ID: orgId }, (err) => {
      if (err) {
        console.error('❌ [DEPT CREATION] Failed to send department creation notification:', err);
      } else {
        console.log('✅ [DEPT CREATION] Notification trigger completed');
      }
    });

    // Notify org admin about their action
    notifyOrgAdminAction(
      userId,
      orgId,
      '🏢 Department Created',
      `You successfully created the department "${name}"`,
      'department',
      `/org/departments/${newDeptId}`
    );

    res.status(201).json({ success: true, id: newDeptId, name });
  });
});

// Update department name
router.put('/departments/:id', requireAdmin, (req, res) => {
  const { name } = req.body;
  const deptId = req.params.id;
  const orgId = req.user.orgId;
  const userId = req.user.userId;

  if (!name) return res.status(400).json({ error: 'Department name is required' });

  const sql = `UPDATE Department SET Depart_Name = ? WHERE Dep_ID = ? AND Org_ID = ?`;
  
  db.run(sql, [name, deptId, orgId], function(err) {
    if (err) {
      console.error("❌ DEPT UPDATE ERROR:", err.message);
      return res.status(500).json({ error: 'Database Error: ' + err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    console.log(`✅ Department ${deptId} updated successfully`);

    // Notify org admin about their action
    notifyOrgAdminAction(
      userId,
      orgId,
      '🏢 Department Updated',
      `You successfully updated the department to "${name}"`,
      'department',
      `/org/departments/${deptId}`
    );

    res.json({ success: true, id: deptId, name });
  });
});

// Delete department (soft delete)
router.delete('/departments/:id', requireAdmin, (req, res) => {
  const deptId = parseInt(req.params.id);
  const orgId = req.user.orgId;
  const userId = req.user.userId;

  console.log(`🗑️ [DELETE DEPT] Attempting to delete deptId: ${deptId}, orgId: ${orgId}`);

  // First get the department name for notification
  const getNameSql = `SELECT Depart_Name FROM Department WHERE Dep_ID = ? AND Org_ID = ?`;
  
  db.get(getNameSql, [deptId, orgId], (err, dept) => {
    if (err) {
      console.error("❌ [DELETE DEPT] Query error:", err.message);
      return res.status(500).json({ error: 'Database Error: ' + err.message });
    }

    if (!dept) {
      console.error(`❌ [DELETE DEPT] Department not found - deptId: ${deptId}, orgId: ${orgId}`);
      return res.status(404).json({ error: 'Department not found' });
    }

    const deptName = dept.Depart_Name;
    console.log(`✅ [DELETE DEPT] Found department: ${deptName}`);

    // Soft delete
    const deleteSql = `UPDATE Department SET Is_Active = 0 WHERE Dep_ID = ? AND Org_ID = ?`;
    
    db.run(deleteSql, [deptId, orgId], function(err) {
      if (err) {
        console.error("❌ [DELETE DEPT] Update error:", err.message);
        return res.status(500).json({ error: 'Failed to delete department: ' + err.message });
      }

      if (this.changes === 0) {
        console.error(`❌ [DELETE DEPT] No rows updated for deptId: ${deptId}`);
        return res.status(400).json({ error: 'Department not found or already deleted' });
      }

      console.log(`✅ [DELETE DEPT] Successfully deleted department ${deptId} (${deptName})`);

      // Notify org admin about their action
      notifyOrgAdminAction(
        userId,
        orgId,
        '🗑️ Department Deleted',
        `You successfully deleted the department "${deptName}"`,
        'department',
        `/org/departments`
      );

      res.json({ success: true, message: 'Department deleted successfully' });
    });
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
  const userId = req.user.userId;

  console.log("📥 Attempting to save zone:", { locationName, latitude, longitude, orgId });

  const sql = `INSERT INTO Geofence (Org_ID, Location_Name, Latitude, Longitude, Radius, Is_Active) VALUES (?, ?, ?, ?, ?, 1)`;
  
  db.run(sql, [orgId, locationName, latitude, longitude, radius || 200], function(err) {
    if (err) {
      console.error("❌ SQLITE ERROR:", err.message);
      return res.status(500).json({ error: `Database Error: ${err.message}` });
    }
    
    console.log("✅ Zone saved successfully with ID:", this.lastID);
    
    const newFenceId = this.lastID;
    const geofenceData = {
      Fence_ID: newFenceId,
      Location_Name: locationName,
      Latitude: latitude,
      Longitude: longitude,
      Radius: radius || 200,
      Org_ID: orgId
    };

    console.log('\n📌 [GEOFENCE CREATION] Starting notification trigger...');
    console.log('📌 [GEOFENCE CREATION] OrgId:', orgId);
    console.log('📌 [GEOFENCE CREATION] Geofence Data:', geofenceData);

    // Trigger notification to superadmins
    notifyNewGeofence(geofenceData, { Org_ID: orgId }, (err) => {
      if (err) {
        console.error('❌ [GEOFENCE CREATION] Failed to send geofence creation notification:', err);
      } else {
        console.log('✅ [GEOFENCE CREATION] Notification trigger completed');
      }
    });

    // Also notify org admin using new notification service
    db.get('SELECT Org_Name FROM Organization WHERE Org_ID = ?', [orgId], (orgErr, org) => {
      if (!orgErr && org) {
        notifyLocationCreated(locationName, orgId, org.Org_Name, newFenceId)
          .catch((err) => console.error('⚠️  Failed to send location creation notification:', err.message));
      }
    });

    // Notify org admin about their action
    notifyOrgAdminAction(
      userId,
      orgId,
      '📍 Geofence Created',
      `You successfully created the geofence "${locationName}"`,
      'location',
      `/org/geofences/${newFenceId}`
    );

    res.status(201).json({ success: true, id: newFenceId });
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

// 1. GET: Fetch settings for the current Org (accessible to all authenticated users)
router.get('/settings', authenticateToken, (req, res) => {
  const orgId = req.user.orgId;
  const sql = `SELECT * FROM Organization WHERE Org_ID = ?`;

  db.get(sql, [orgId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to load settings' });
    res.json(row);
  });
});

// PUT: Upload organization logo (accessible to organization admins)
router.put('/logo', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const { logoData, mimeType } = req.body;

  if (!logoData || !mimeType) {
    return res.status(400).json({ error: 'Logo data and MIME type are required' });
  }

  // Validate MIME type
  const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!validMimeTypes.includes(mimeType.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid image MIME type. Allowed: PNG, JPEG, GIF, WebP' });
  }

  // Validate logo size (max 500KB for base64)
  const logoSizeInBytes = Buffer.byteLength(logoData, 'utf8');
  if (logoSizeInBytes > 500 * 1024) {
    return res.status(400).json({ error: 'Logo size exceeds 500KB limit' });
  }

  const sql = `
    UPDATE Organization 
    SET Logo_Path = ?, Logo_MIME_Type = ?, Updated_at = DATETIME('now')
    WHERE Org_ID = ?
  `;

  db.run(sql, [logoData, mimeType, orgId], function (err) {
    if (err) {
      console.error('❌ Failed to update organization logo:', err.message);
      return res.status(500).json({ error: 'Failed to update logo: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Add to Audit Log
    db.run(`INSERT INTO Audit_Log (User_ID, Org_ID, Action, Table_Name) VALUES (?, ?, 'UPLOAD_LOGO', 'Organization')`, 
           [req.user.userId, orgId]);

    console.log(`✅ Logo uploaded for organization ${orgId} by user ${req.user.userId}`);
    res.json({ 
      success: true, 
      message: 'Organization logo uploaded successfully',
      orgId,
      logoUpdated: true
    });
  });
});

// DELETE: Remove organization logo (accessible to organization admins)
router.delete('/logo', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;

  const sql = `
    UPDATE Organization 
    SET Logo_Path = NULL, Logo_MIME_Type = NULL, Updated_at = DATETIME('now')
    WHERE Org_ID = ?
  `;

  db.run(sql, [orgId], function (err) {
    if (err) {
      console.error('❌ Failed to delete organization logo:', err.message);
      return res.status(500).json({ error: 'Failed to delete logo: ' + err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Add to Audit Log
    db.run(`INSERT INTO Audit_Log (User_ID, Org_ID, Action, Table_Name) VALUES (?, ?, 'DELETE_LOGO', 'Organization')`, 
           [req.user.userId, orgId]);

    console.log(`✅ Logo deleted for organization ${orgId} by user ${req.user.userId}`);
    res.json({ 
      success: true, 
      message: 'Organization logo deleted successfully'
    });
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
  const verifyShiftSql = `SELECT ShiftType_ID, ShiftType_Name FROM ShiftType WHERE ShiftType_ID = ? AND Org_ID = ?`;
  
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
      const verifyEmpSql = `SELECT User_ID, First_Name, SurName FROM User WHERE User_ID IN (${placeholders}) AND Org_ID = ? AND Is_Active = 1`;
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
            
            // After all employees are added, create notifications
            if (completed === employeeIds.length && !hasError) {
              // Create notifications for each employee
              const notifSql = `
                INSERT INTO Notification (User_ID, Org_ID, Title, Message, Type, Category, Created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
              `;

              let notifCompleted = 0;
              
              employeeIds.forEach(empId => {
                const empName = employees.find(e => e.User_ID === empId);
                const title = `New Schedule Assigned: ${name}`;
                const message = `You have been assigned to "${name}" schedule starting ${startDate} (${shiftType.ShiftType_Name}). Please review your schedule.`;
                
                db.run(notifSql, [empId, orgId, title, message, 'info', 'schedule'], (err) => {
                  if (err) {
                    console.error('❌ Notification creation error:', err.message);
                  } else {
                    console.log(`✅ Notification sent to user ${empId}`);
                  }
                  
                  notifCompleted++;
                  if (notifCompleted === employeeIds.length) {
                    res.status(201).json({ 
                      success: true, 
                      Schedule_ID: scheduleId,
                      message: `Schedule created and ${employeeIds.length} notifications sent`
                    });
                  }
                });
              });
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
    INNER JOIN User u ON se.User_ID = u.User_ID
    LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
    WHERE se.User_ID = ? 
      AND s.Org_ID = ? 
      AND date(s.End_Date) >= date(?)
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
    INNER JOIN User u ON se.User_ID = u.User_ID
    LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
    WHERE se.User_ID = ? 
      AND s.Org_ID = ? 
      AND date(?) >= date(s.Start_Date)
      AND date(?) <= date(s.End_Date)
      AND s.Is_Active = 1
    ORDER BY s.Start_Date ASC
    LIMIT 1`;

  db.get(sql, [userId, orgId, today, today], (err, row) => {
    if (err) {
      console.error('❌ Current Shift Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch current shift: ' + err.message });
    }
    res.json(row || null);
  });
});

// =============================================================
// ORGANIZATION SETTINGS
// =============================================================

// GET: Fetch organization settings (attendance policies, etc.)
router.get('/settings', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;

  const sql = `
    SELECT 
      Org_ID,
      Clock_In_Window_Minutes,
      Clock_Out_Alert_Minutes,
      Max_Breaks_Per_Shift
    FROM Organization 
    WHERE Org_ID = ?`;

  db.get(sql, [orgId], (err, row) => {
    if (err) {
      console.error('❌ Settings Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
    res.json(row || { 
      Clock_In_Window_Minutes: 30, 
      Clock_Out_Alert_Minutes: 15,
      Max_Breaks_Per_Shift: 2
    });
  });
});

// PUT: Update organization settings (admin only)
router.put('/settings', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const { Clock_In_Window_Minutes, Clock_Out_Alert_Minutes, maxBreaksPerShift } = req.body;

  // Validate inputs
  if (Clock_In_Window_Minutes !== undefined && (Clock_In_Window_Minutes < 0 || Clock_In_Window_Minutes > 120)) {
    return res.status(400).json({ error: 'Clock-in window must be between 0 and 120 minutes' });
  }
  
  if (Clock_Out_Alert_Minutes !== undefined && (Clock_Out_Alert_Minutes < 5 || Clock_Out_Alert_Minutes > 60)) {
    return res.status(400).json({ error: 'Clock-out alert must be between 5 and 60 minutes' });
  }

  if (maxBreaksPerShift !== undefined && (maxBreaksPerShift < 1 || maxBreaksPerShift > 10)) {
    return res.status(400).json({ error: 'Maximum breaks per shift must be between 1 and 10' });
  }

  const updates = [];
  const values = [];

  if (Clock_In_Window_Minutes !== undefined) {
    updates.push('Clock_In_Window_Minutes = ?');
    values.push(Clock_In_Window_Minutes);
  }

  if (Clock_Out_Alert_Minutes !== undefined) {
    updates.push('Clock_Out_Alert_Minutes = ?');
    values.push(Clock_Out_Alert_Minutes);
  }

  if (maxBreaksPerShift !== undefined) {
    updates.push('Max_Breaks_Per_Shift = ?');
    values.push(maxBreaksPerShift);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No settings to update' });
  }

  values.push(orgId);

  const sql = `UPDATE Organization SET ${updates.join(', ')} WHERE Org_ID = ?`;

  db.run(sql, values, function(err) {
    if (err) {
      console.error('❌ Settings Update Error:', err.message);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    // Get all active users in the organization to notify
    db.all(`SELECT User_ID FROM User WHERE Org_ID = ? AND Is_Active = 1`, [orgId], (err, users) => {
      if (err || !users || users.length === 0) {
        return res.json({ success: true, message: 'Settings updated successfully' });
      }

      // Create notifications for all users about the policy change
      const notifSql = `
        INSERT INTO Notification (User_ID, Org_ID, Title, Message, Type, Category, Created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
      `;

      let changes = [];
      if (Clock_In_Window_Minutes !== undefined) {
        changes.push(`Clock-in window changed to ${Clock_In_Window_Minutes} minutes`);
      }
      if (Clock_Out_Alert_Minutes !== undefined) {
        changes.push(`Clock-out alert changed to ${Clock_Out_Alert_Minutes} minutes`);
      }
      if (maxBreaksPerShift !== undefined) {
        changes.push(`Maximum breaks per shift changed to ${maxBreaksPerShift}`);
      }

      const message = `Attendance policy updated: ${changes.join(', ')}. Please review your dashboard for details.`;

      let notifiedCount = 0;
      users.forEach(user => {
        db.run(
          notifSql,
          [user.User_ID, orgId, 'Attendance Policy Updated', message, 'info', 'policy'],
          (err) => {
            notifiedCount++;
            if (notifiedCount === users.length) {
              console.log(`✅ Policy change notified to ${notifiedCount} users`);
            }
          }
        );
      });

      res.json({ success: true, message: `Settings updated successfully and ${users.length} notifications sent` });
    });
  });
});

// GET: Fetch geofences for the organization
router.get('/geofences', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;

  const sql = `
    SELECT * FROM Geofence 
    WHERE Org_ID = ? 
    ORDER BY Created_at DESC`;

  db.all(sql, [orgId], (err, rows) => {
    if (err) {
      console.error('❌ Geofences Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch geofences' });
    }
    res.json(rows || []);
  });
});

// =============================================================
// ORGANIZATION ACTIVITY TRACKING (Break Activities)
// =============================================================

// POST: Record break activity when user clocks out
router.post('/track-breaks', authenticateToken, (req, res) => {
  const { orgId } = req.user;
  const userId = req.user.userId;
  const { totalBreaks, totalBreakMinutes, breaks } = req.body;
  const activityDate = new Date().toISOString().split('T')[0];

  if (!totalBreaks || totalBreaks === 0) {
    console.log(`ℹ️  No breaks taken by user ${userId} on ${activityDate}`);
    return res.json({ success: true, message: 'No breaks recorded' });
  }

  // Create breaks summary
  const breaksSummary = breaks 
    ? JSON.stringify(breaks.map(b => ({
        type: b.breakType,
        duration: b.durationMinutes || 0,
        startTime: b.startTime
      })))
    : null;

  const sql = `
    INSERT INTO Organization_Activity 
    (Org_ID, User_ID, Activity_Type, Activity_Date, Total_Breaks, Total_Break_Minutes, Breaks_Summary)
    VALUES (?, ?, 'break', ?, ?, ?, ?)
  `;

  db.run(sql, [orgId, userId, activityDate, totalBreaks, totalBreakMinutes || 0, breaksSummary], function(err) {
    if (err) {
      console.error('❌ Break Activity Recording Error:', err.message);
      return res.status(500).json({ error: 'Failed to record break activity' });
    }
    console.log(`✅ Break activity recorded for user ${userId}: ${totalBreaks} breaks, ${totalBreakMinutes} minutes`);
    res.json({ 
      success: true, 
      message: 'Break activity recorded',
      activityId: this.lastID 
    });
  });
});

// GET: Fetch organization break activities (admin only)
router.get('/activities', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const { startDate, endDate, userId } = req.query;

  let sql = `
    SELECT 
      a.Activity_ID,
      a.User_ID,
      a.Activity_Date,
      a.Total_Breaks,
      a.Total_Break_Minutes,
      a.Breaks_Summary,
      u.First_Name,
      u.SurName,
      u.Email,
      u.Employee_ID
    FROM Organization_Activity a
    JOIN User u ON a.User_ID = u.User_ID
    WHERE a.Org_ID = ? AND a.Activity_Type = 'break'
  `;

  const params = [orgId];

  if (startDate) {
    sql += ` AND a.Activity_Date >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND a.Activity_Date <= ?`;
    params.push(endDate);
  }

  if (userId) {
    sql += ` AND a.User_ID = ?`;
    params.push(userId);
  }

  sql += ` ORDER BY a.Activity_Date DESC, a.Activity_ID DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ Activities Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch activities' });
    }

    // Map rows to include userName from First_Name and SurName, and userEmail
    const activities = (rows || []).map(row => ({
      ...row,
      userName: `${row.First_Name} ${row.SurName}`,
      userEmail: row.Email,
      breaks: row.Breaks_Summary ? JSON.parse(row.Breaks_Summary) : []
    }));

    res.json(activities);
  });
});

// GET: Fetch user break summary for today (for dashboard)
router.get('/activities-today', authenticateToken, (req, res) => {
  const orgId = req.user.orgId;
  const userId = req.user.userId;
  const today = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      Total_Breaks,
      Total_Break_Minutes,
      Breaks_Summary
    FROM Organization_Activity
    WHERE Org_ID = ? AND User_ID = ? AND Activity_Date = ? AND Activity_Type = 'break'
    LIMIT 1
  `;

  db.get(sql, [orgId, userId, today], (err, row) => {
    if (err) {
      console.error('❌ Today Activity Fetch Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch today activity' });
    }

    if (!row) {
      return res.json({
        totalBreaks: 0,
        totalBreakMinutes: 0,
        breaks: []
      });
    }

    res.json({
      totalBreaks: row.Total_Breaks || 0,
      totalBreakMinutes: row.Total_Break_Minutes || 0,
      breaks: row.Breaks_Summary ? JSON.parse(row.Breaks_Summary) : []
    });
  });
});

// ============================================================
// 🕐 TIME TRACKING REPORT: Complete attendance & breaks for admins
// ============================================================

/**
 * GET /org/time-tracking-report
 * Admin endpoint to view complete time tracking data for all employees
 * Combines Attendance (clock-in/out) with Organization_Activity (breaks)
 * 
 * Query Parameters:
 *   - startDate: YYYY-MM-DD (filter from this date)
 *   - endDate: YYYY-MM-DD (filter to this date)
 *   - userId: INTEGER (filter by specific employee)
 *   - departmentId: INTEGER (filter by department)
 *   - status: STRING (present/absent/late/half-day)
 */
router.get('/time-tracking-report', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const { startDate, endDate, userId, departmentId, status } = req.query;

  // Build dynamic SQL query to fetch attendance and break data
  let sql = `
    SELECT 
      a.Attend_ID,
      a.User_ID,
      u.First_Name,
      u.SurName,
      u.Email,
      u.Employee_ID,
      d.Depart_Name AS departmentName,
      DATE(a.Check_in_time) AS attendanceDate,
      TIME(a.Check_in_time) AS clockInTime,
      TIME(a.Check_out_time) AS clockOutTime,
      CASE 
        WHEN a.Check_out_time IS NULL THEN 'Active'
        ELSE 'Completed'
      END AS shiftStatus,
      a.Is_Late_Clock_In AS isLateClockIn,
      a.Minutes_Late AS minutesLate,
      CAST((julianday(COALESCE(a.Check_out_time, datetime('now', 'localtime'))) - julianday(a.Check_in_time)) * 24 * 60 AS INTEGER) AS totalShiftMinutes,
      COALESCE(oa.Total_Breaks, 0) AS totalBreaks,
      COALESCE(oa.Total_Break_Minutes, 0) AS totalBreakMinutes,
      oa.Breaks_Summary,
      a.Check_in_time,
      a.Check_out_time
    FROM Attendance a
    LEFT JOIN User u ON a.User_ID = u.User_ID
    LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
    LEFT JOIN Organization_Activity oa ON a.User_ID = oa.User_ID 
      AND DATE(a.Check_in_time) = oa.Activity_Date 
      AND oa.Org_ID = a.Org_ID
    WHERE a.Org_ID = ? AND u.Is_Active = 1
  `;

  const params = [orgId];

  // Add filters
  if (startDate) {
    sql += ` AND DATE(a.Check_in_time) >= ?`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND DATE(a.Check_in_time) <= ?`;
    params.push(endDate);
  }

  if (userId) {
    sql += ` AND a.User_ID = ?`;
    params.push(userId);
  }

  if (departmentId) {
    sql += ` AND u.Dep_ID = ?`;
    params.push(departmentId);
  }

  sql += ` ORDER BY a.Check_in_time DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.error('❌ Time Tracking Report Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch time tracking data' });
    }

    // Process and enhance the data
    const report = (rows || []).map(row => {
      let rowStatus = 'present';
      
      if (!row.Check_in_time) {
        rowStatus = 'absent';
      } else if (row.isLateClockIn) {
        rowStatus = 'late';
      } else if (!row.Check_out_time) {
        rowStatus = 'active';
      }

      // Apply status filter if requested
      if (status && rowStatus !== status) {
        return null;
      }

      // Parse breaks summary
      let breaksList = [];
      try {
        if (row.Breaks_Summary) {
          breaksList = JSON.parse(row.Breaks_Summary);
        }
      } catch (e) {
        console.error('Error parsing breaks:', e.message);
      }

      return {
        attendId: row.Attend_ID,
        userId: row.User_ID,
        employeeId: row.Employee_ID,
        firstName: row.First_Name,
        surName: row.SurName,
        email: row.Email,
        fullName: `${row.First_Name} ${row.SurName}`,
        department: row.departmentName || 'Unassigned',
        date: row.attendanceDate,
        clockInTime: row.clockInTime,
        clockOutTime: row.clockOutTime || 'Active',
        shiftStatus: row.shiftStatus,
        totalShiftMinutes: row.totalShiftMinutes || 0,
        totalShiftHours: ((row.totalShiftMinutes || 0) / 60).toFixed(2),
        isLate: row.isLateClockIn === 1,
        minutesLate: row.minutesLate || 0,
        totalBreaks: row.totalBreaks,
        totalBreakMinutes: row.totalBreakMinutes,
        breaks: breaksList,
        status: rowStatus
      };
    }).filter(item => item !== null); // Remove filtered items

    // Calculate summary statistics
    const summary = {
      totalRecords: report.length,
      presentCount: report.filter(r => r.status === 'present' || r.status === 'active').length,
      absentCount: report.filter(r => r.status === 'absent').length,
      lateCount: report.filter(r => r.status === 'late').length,
      averageShiftHours: report.length > 0 
        ? (report.reduce((sum, r) => sum + parseFloat(r.totalShiftHours), 0) / report.length).toFixed(2)
        : 0,
      totalBreakTime: report.reduce((sum, r) => sum + r.totalBreakMinutes, 0),
      uniqueEmployees: new Set(report.map(r => r.userId)).size
    };

    res.json({
      success: true,
      summary,
      report
    });
  });
});

/**
 * GET /org/time-tracking-summary
 * Quick summary statistics for dashboard
 */
router.get('/time-tracking-summary', requireAdmin, (req, res) => {
  const orgId = req.user.orgId;
  const today = new Date().toISOString().split('T')[0];

  const sql = `
    SELECT 
      COUNT(DISTINCT a.User_ID) AS totalEmployees,
      COUNT(CASE WHEN DATE(a.Check_in_time) = ? AND a.Check_out_time IS NOT NULL THEN 1 END) AS completedShifts,
      COUNT(CASE WHEN DATE(a.Check_in_time) = ? AND a.Check_out_time IS NULL THEN 1 END) AS activeShifts,
      COUNT(CASE WHEN a.Is_Late_Clock_In = 1 AND DATE(a.Check_in_time) = ? THEN 1 END) AS lateArrivals,
      ROUND(AVG(CAST((julianday(COALESCE(a.Check_out_time, datetime('now', 'localtime'))) - julianday(a.Check_in_time)) * 24 * 60 AS INTEGER))) AS avgShiftMinutes,
      SUM(COALESCE(oa.Total_Break_Minutes, 0)) AS totalBreakMinutes
    FROM Attendance a
    LEFT JOIN User u ON a.User_ID = u.User_ID
    LEFT JOIN Organization_Activity oa ON a.User_ID = oa.User_ID 
      AND DATE(a.Check_in_time) = oa.Activity_Date 
      AND oa.Org_ID = a.Org_ID
    WHERE a.Org_ID = ? AND DATE(a.Check_in_time) = ?
  `;

  db.get(sql, [today, today, today, orgId, today], (err, row) => {
    if (err) {
      console.error('❌ Summary Error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch summary' });
    }

    res.json({
      date: today,
      totalEmployees: row.totalEmployees || 0,
      completedShifts: row.completedShifts || 0,
      activeShifts: row.activeShifts || 0,
      lateArrivals: row.lateArrivals || 0,
      averageShiftHours: row.avgShiftMinutes ? (row.avgShiftMinutes / 60).toFixed(2) : 0,
      totalBreakHours: row.totalBreakMinutes ? (row.totalBreakMinutes / 60).toFixed(2) : 0
    });
  });
});

module.exports = router;