const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

// =============================================================
// ⭐ SUPER ADMIN MIDDLEWARE
// =============================================================
const authenticateSuperAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Super Admin token required' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Super Admin access required' });
    }
    req.superAdmin = decoded;
    next();
  });
};

router.use(authenticateSuperAdmin);

// =============================================================
// 1. MASTER DASHBOARD & ANALYTICS (Matches Dashboard.vue & Analytics.vue)
// =============================================================
router.get('/dashboard', (req, res) => {
  // SQL for Main Stats
  const sqlStats = `
    SELECT 
      (SELECT COUNT(*) FROM Organization) as totalOrgs,
      (SELECT COUNT(*) FROM User) as totalUsers,
      (SELECT COUNT(*) FROM Attendance WHERE DATE(Check_in_time) = DATE('now', 'localtime')) as todayCheckins,
      (SELECT COUNT(*) FROM Department) as totalDepts
  `;

  // SQL for 7-Day Trend (For the Velocity Charts)
  const sqlTrend = `
    SELECT date(Check_in_time) as day, COUNT(*) as count 
    FROM Attendance 
    WHERE Check_in_time >= date('now', '-6 days')
    GROUP BY day ORDER BY day ASC
  `;

  db.get(sqlStats, [], (err, stats) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(sqlTrend, [], (err2, trend) => {
      res.json({ 
        success: true, 
        stats: stats || { totalOrgs: 0, totalUsers: 0, todayCheckins: 0, totalDepts: 0 },
        trend: trend || []
      });
    });
  });
});

// =============================================================
// 2. TENANT REGISTRY (Matches SuperAdminOrganizations.vue)
// =============================================================
router.get('/organizations', (req, res) => {
  // We fetch Org details plus the count of users in each org
  const sql = `
    SELECT 
      o.Org_ID, o.Org_Name, o.Org_Domain, o.Created_at, o.Is_Active,
      (SELECT COUNT(*) FROM User u WHERE u.Org_ID = o.Org_ID) as userCount,
      -- We assume a default plan if none exists to prevent front-end crashes
      COALESCE(o.Theme_Color, 'Starter') as Plan_Name 
    FROM Organization o
    ORDER BY o.Created_at DESC
  `;

  db.all(sql, [], (err, organizations) => {
    if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
    res.json({ success: true, organizations });
  });
});

// =============================================================
// 3. TENANT DEEP DIVE (Matches the "Inspect" Drawer logic)
// =============================================================
// GET: Detailed dive into one organization
router.get('/organizations/:id/details', authenticateSuperAdmin, (req, res) => {
  const orgId = req.params.id;

  const queries = {
    info: `SELECT * FROM Organization WHERE Org_ID = ?`,
    departments: `SELECT Dep_ID, Depart_Name, (SELECT COUNT(*) FROM User WHERE Dep_ID = d.Dep_ID) as staff_count FROM Department d WHERE Org_ID = ?`,
    users: `SELECT User_ID, First_Name, SurName, Email, Job_Title, Is_Active FROM User WHERE Org_ID = ?`,
    stats: `SELECT COUNT(*) as checkinsToday FROM Attendance WHERE Org_ID = ? AND date(Check_in_time) = date('now', 'localtime')`
  };

  const pInfo = new Promise(r => db.get(queries.info, [orgId], (e, row) => r(row)));
  const pDepts = new Promise(r => db.all(queries.departments, [orgId], (e, rows) => r(rows)));
  const pUsers = new Promise(r => db.all(queries.users, [orgId], (e, rows) => r(rows)));
  const pStats = new Promise(r => db.get(queries.stats, [orgId], (e, row) => r(row)));

  Promise.all([pInfo, pDepts, pUsers, pStats]).then(([info, departments, users, stats]) => {
    if (!info) return res.status(404).json({ error: 'Organization not found' });
    res.json({ info, departments, users, stats });
  }).catch(err => res.status(500).json({ error: err.message }));
});
// =============================================================
// 4. NETWORK AUDIT LEDGER (Matches SuperAdminAuditLogs.vue)
// =============================================================
router.get('/audit-logs', (req, res) => {
  const sql = `
    SELECT 
      al.Log_ID, al.Action, al.Created_at, al.Table_Name, al.IP_Address, al.New_Data,
      u.Email as User_Email,
      o.Org_Name
    FROM Audit_Log al
    LEFT JOIN User u ON al.User_ID = u.User_ID
    LEFT JOIN Organization o ON al.Org_ID = o.Org_ID
    ORDER BY al.Created_at DESC
    LIMIT 500
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Audit log fetch failed' });
    res.json({ success: true, logs: rows });
  });
});

// =============================================================
// 5. GLOBAL USERS (Matches Global Users page)
// =============================================================
router.get('/users', (req, res) => {
  const sql = `
    SELECT 
      u.User_ID, u.First_Name, u.SurName, u.Email, u.Is_Active, u.Job_Title,
      o.Org_Name, o.Org_Domain
    FROM User u
    JOIN Organization o ON u.Org_ID = o.Org_ID
    ORDER BY u.Created_at DESC
    LIMIT 200
  `;

  db.all(sql, [], (err, users) => {
    if (err) return res.status(500).json({ error: 'User fetch failed' });
    res.json({ success: true, users });
  });
});

// =============================================================
// 6. AUTHORITY OVERRIDES (Suspend / Activate / Global)
// =============================================================

// Toggle Single Org
router.put('/organizations/:id/status', (req, res) => {
  const { isActive } = req.body;
  db.run(`UPDATE Organization SET Is_Active = ? WHERE Org_ID = ?`, [isActive ? 1 : 0, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ success: true, message: 'Node status updated' });
  });
});

// Global Kill-Switch
router.put('/organizations/status/global', (req, res) => {
  const { isActive } = req.body;
  const statusValue = isActive ? 1 : 0;

  db.run(`UPDATE Organization SET Is_Active = ?`, [statusValue], function(err) {
    if (err) return res.status(500).json({ error: 'Global update failed' });
    
    // Log the massive action
    db.run(`INSERT INTO Audit_Log (Action, Table_Name, New_Data) VALUES ('GLOBAL_STATUS_OVERRIDE', 'Organization', ?)`, 
           [JSON.stringify({ active: isActive })]);

    res.json({ success: true, message: `System-wide status set to ${isActive ? 'Active' : 'Suspended'}` });
  });
});

// Create New Organization
router.post('/organizations', (req, res) => {
  const { Org_Name, Org_Domain, Theme_Color } = req.body;
  
  if (!Org_Name || !Org_Domain) {
    return res.status(400).json({ error: 'Organization name and domain are required' });
  }

  const sql = `INSERT INTO Organization (Org_Name, Org_Domain, Theme_Color, Is_Active, Created_at) 
               VALUES (?, ?, ?, 1, datetime('now'))`;
  
  db.run(sql, [Org_Name, Org_Domain, Theme_Color || '#6366f1'], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Domain already exists' });
      }
      return res.status(500).json({ error: 'Failed to create organization' });
    }
    
    // Log the action
    db.run(`INSERT INTO Audit_Log (Action, Table_Name, New_Data) VALUES (?, ?, ?)`,
           ['CREATED_ORGANIZATION', 'Organization', JSON.stringify({ Org_Name, Org_Domain })]);
    
    res.status(201).json({ 
      success: true, 
      message: 'Organization created successfully',
      orgId: this.lastID 
    });
  });
});

// Update Organization Details
router.put('/organizations/:id', (req, res) => {
  const { Org_Name, Org_Domain, Theme_Color } = req.body;
  const orgId = req.params.id;
  
  // Build dynamic update query based on provided fields
  let updateFields = [];
  let params = [];
  
  if (Org_Name) {
    updateFields.push('Org_Name = ?');
    params.push(Org_Name);
  }
  if (Org_Domain) {
    updateFields.push('Org_Domain = ?');
    params.push(Org_Domain);
  }
  if (Theme_Color) {
    updateFields.push('Theme_Color = ?');
    params.push(Theme_Color);
  }
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  params.push(orgId);
  const sql = `UPDATE Organization SET ${updateFields.join(', ')} WHERE Org_ID = ?`;
  
  db.run(sql, params, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Domain already exists' });
      }
      return res.status(500).json({ error: 'Update failed' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    // Log the action
    db.run(`INSERT INTO Audit_Log (Action, Table_Name, New_Data) VALUES (?, ?, ?)`,
           ['UPDATED_ORGANIZATION', 'Organization', JSON.stringify(req.body)]);
    
    res.json({ success: true, message: 'Organization updated successfully' });
  });
});

// Assign User to Organization
router.post('/organizations/:id/users', (req, res) => {
  const { userId } = req.body;
  const orgId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  
  // First verify user exists
  db.get(`SELECT User_ID FROM User WHERE User_ID = ?`, [userId], (err, user) => {
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user's organization
    db.run(`UPDATE User SET Org_ID = ? WHERE User_ID = ?`, [orgId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to assign user' });
      
      // Log the action
      db.run(`INSERT INTO Audit_Log (Action, Table_Name, New_Data, User_ID, Org_ID) VALUES (?, ?, ?, ?, ?)`,
             ['ASSIGNED_USER_TO_ORG', 'User', JSON.stringify({ userId, orgId }), userId, orgId]);
      
      res.json({ success: true, message: 'User assigned to organization' });
    });
  });
});

// Remove User from Organization
router.delete('/organizations/:id/users/:userId', (req, res) => {
  const { id: orgId, userId } = req.params;
  
  // Verify user belongs to this organization
  db.get(`SELECT User_ID, Org_ID FROM User WHERE User_ID = ? AND Org_ID = ?`, [userId, orgId], (err, user) => {
    if (!user) {
      return res.status(404).json({ error: 'User not found in this organization' });
    }
    
    // Set user organization to NULL (orphan status) or delete
    db.run(`UPDATE User SET Org_ID = NULL WHERE User_ID = ?`, [userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to remove user' });
      
      // Log the action
      db.run(`INSERT INTO Audit_Log (Action, Table_Name, New_Data, User_ID, Org_ID) VALUES (?, ?, ?, ?, ?)`,
             ['REMOVED_USER_FROM_ORG', 'User', JSON.stringify({ userId, orgId }), userId, orgId]);
      
      res.json({ success: true, message: 'User removed from organization' });
    });
  });
});

// Update Organization Settings
router.put('/organizations/:id/settings', (req, res) => {
  const orgId = req.params.id;
  const settings = req.body; // Can include Theme_Color, Description, etc
  
  // Build dynamic update based on settings
  let updateFields = [];
  let params = [];
  const allowedFields = ['Theme_Color', 'Description'];
  
  Object.keys(settings).forEach(key => {
    if (allowedFields.includes(key)) {
      updateFields.push(`${key} = ?`);
      params.push(settings[key]);
    }
  });
  
  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No valid settings to update' });
  }
  
  params.push(orgId);
  const sql = `UPDATE Organization SET ${updateFields.join(', ')} WHERE Org_ID = ?`;
  
  db.run(sql, params, function(err) {
    if (err) return res.status(500).json({ error: 'Update failed' });
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }
    
    res.json({ success: true, message: 'Settings updated successfully' });
  });
});

// Delete Organization (Wipe)
router.delete('/organizations/:id', (req, res) => {
  const orgId = req.params.id;
  // SQLite doesn't support easy cascading in all versions, so we delete carefully
  db.serialize(() => {
    db.run(`DELETE FROM User WHERE Org_ID = ?`, [orgId]);
    db.run(`DELETE FROM Attendance WHERE Org_ID = ?`, [orgId]);
    db.run(`DELETE FROM Organization WHERE Org_ID = ?`, [orgId], function(err) {
      if (err) return res.status(500).json({ error: 'Wipe failed' });
      
      // Log the action
      db.run(`INSERT INTO Audit_Log (Action, Table_Name, New_Data) VALUES (?, ?, ?)`,
             ['DELETED_ORGANIZATION', 'Organization', JSON.stringify({ orgId })]);
      
      res.json({ success: true, message: 'Tenant node fully purged.' });
    });
  });
});

// =============================================================
// 7. SYSTEM HEALTH & PERFORMANCE METRICS
// =============================================================
router.get('/system/health', (req, res) => {
  const queries = {
    dbSize: `SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`,
    tableStats: `
      SELECT 
        'Users' as table_name, COUNT(*) as record_count FROM User
      UNION ALL
      SELECT 'Attendances', COUNT(*) FROM Attendance
      UNION ALL
      SELECT 'Organizations', COUNT(*) FROM Organization
      UNION ALL
      SELECT 'Departments', COUNT(*) FROM Department
    `,
    recentErrors: `SELECT * FROM Audit_Log WHERE Action LIKE '%ERROR%' ORDER BY Created_at DESC LIMIT 10`,
    activeUsers: `SELECT COUNT(DISTINCT User_ID) as count FROM Attendance WHERE date(Check_in_time) = date('now', 'localtime')`,
  };

  const results = {};
  let completed = 0;

  db.get(queries.dbSize, [], (err, row) => {
    results.dbSize = row?.size || 0;
    if (++completed === Object.keys(queries).length) sendResponse();
  });

  db.all(queries.tableStats, [], (err, rows) => {
    results.tableStats = rows || [];
    if (++completed === Object.keys(queries).length) sendResponse();
  });

  db.all(queries.recentErrors, [], (err, rows) => {
    results.recentErrors = rows || [];
    if (++completed === Object.keys(queries).length) sendResponse();
  });

  db.get(queries.activeUsers, [], (err, row) => {
    results.activeUsers = row?.count || 0;
    if (++completed === Object.keys(queries).length) sendResponse();
  });

  function sendResponse() {
    res.json({
      success: true,
      health: {
        dbSize: `${(results.dbSize / 1024 / 1024).toFixed(2)} MB`,
        tableStats: results.tableStats,
        recentErrors: results.recentErrors,
        activeUsersToday: results.activeUsers,
        serverStatus: 'Healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  }
});

// =============================================================
// 8. ATTENDANCE ANALYTICS & TRENDS
// =============================================================
router.get('/analytics/attendance', (req, res) => {
  const { days = 30, orgId } = req.query;

  let sql = `
    SELECT 
      DATE(Check_in_time) as date,
      COUNT(*) as total_checkins,
      COUNT(DISTINCT User_ID) as unique_users,
      AVG(julianday(Check_out_time) - julianday(Check_in_time)) * 24 as avg_hours_worked
    FROM Attendance
    WHERE Check_in_time >= date('now', '-' || ? || ' days')
  `;

  const params = [days];

  if (orgId) {
    sql += ` AND Org_ID = ?`;
    params.push(orgId);
  }

  sql += ` GROUP BY DATE(Check_in_time) ORDER BY date DESC`;

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Get department breakdown
    let deptSql = `
      SELECT 
        d.Depart_Name,
        COUNT(a.Attendance_ID) as checkins,
        COUNT(DISTINCT a.User_ID) as users
      FROM Attendance a
      JOIN User u ON a.User_ID = u.User_ID
      JOIN Department d ON u.Dep_ID = d.Dep_ID
      WHERE a.Check_in_time >= date('now', '-' || ? || ' days')
    `;

    let deptParams = [days];
    if (orgId) {
      deptSql += ` AND a.Org_ID = ?`;
      deptParams.push(orgId);
    }
    deptSql += ` GROUP BY d.Depart_Name`;

    db.all(deptSql, deptParams, (err2, deptData) => {
      res.json({
        success: true,
        attendance: rows || [],
        departmentBreakdown: deptData || []
      });
    });
  });
});

// =============================================================
// 9. GEOFENCE MANAGEMENT
// =============================================================
router.get('/geofences', (req, res) => {
  const sql = `
    SELECT 
      g.Geofence_ID, g.Org_ID, g.Department_ID, g.Location_Name,
      g.Latitude, g.Longitude, g.Radius, g.Is_Active, g.Created_at,
      o.Org_Name,
      (SELECT COUNT(*) FROM Attendance WHERE Geofence_ID = g.Geofence_ID AND Check_in_time >= date('now', '-1 day')) as checkins_24h
    FROM Geofence g
    JOIN Organization o ON g.Org_ID = o.Org_ID
    ORDER BY g.Created_at DESC
  `;

  db.all(sql, [], (err, geofences) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, geofences });
  });
});

router.get('/geofences/:id/violations', (req, res) => {
  const geofenceId = req.params.id;
  const sql = `
    SELECT 
      u.First_Name, u.SurName, u.Email,
      a.Check_in_time, a.Latitude, a.Longitude,
      o.Org_Name
    FROM Attendance a
    JOIN User u ON a.User_ID = u.User_ID
    JOIN Organization o ON a.Org_ID = o.Org_ID
    WHERE a.Geofence_ID = ? AND a.Status = 'OUTSIDE_GEOFENCE'
    ORDER BY a.Check_in_time DESC
    LIMIT 100
  `;

  db.all(sql, [geofenceId], (err, violations) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, violations });
  });
});

// =============================================================
// 10. DEPARTMENT & SHIFT MANAGEMENT
// =============================================================
router.get('/departments', (req, res) => {
  const { orgId } = req.query;
  let sql = `
    SELECT 
      d.Dep_ID, d.Depart_Name, d.Org_ID,
      COUNT(u.User_ID) as user_count,
      o.Org_Name,
      (SELECT COUNT(*) FROM Attendance WHERE Org_ID = d.Org_ID AND Date(Check_in_time) = Date('now')) as today_checkins
    FROM Department d
    JOIN Organization o ON d.Org_ID = o.Org_ID
    LEFT JOIN User u ON d.Dep_ID = u.Dep_ID
  `;

  const params = [];
  if (orgId) {
    sql += ` WHERE d.Org_ID = ?`;
    params.push(orgId);
  }

  sql += ` GROUP BY d.Dep_ID ORDER BY d.Depart_Name`;

  db.all(sql, params, (err, departments) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, departments });
  });
});

router.get('/shifts', (req, res) => {
  const sql = `
    SELECT 
      s.Shift_ID, s.Shift_Name, s.Start_Time, s.End_Time, s.Org_ID,
      COUNT(u.User_ID) as assigned_users,
      o.Org_Name
    FROM Shift s
    JOIN Organization o ON s.Org_ID = o.Org_ID
    LEFT JOIN User u ON s.Shift_ID = u.Shift_ID
    GROUP BY s.Shift_ID
    ORDER BY s.Start_Time
  `;

  db.all(sql, [], (err, shifts) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, shifts });
  });
});

// =============================================================
// 11. REVENUE & BILLING (Placeholder for future integration)
// =============================================================
router.get('/revenue/summary', (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as active_orgs,
      SUM(CASE WHEN Is_Active = 1 THEN 1 ELSE 0 END) as revenue_paying_orgs
    FROM Organization
  `;

  db.get(sql, [], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    // Placeholder calculations - update based on your billing model
    const estimatedMonthlyRevenue = (data.revenue_paying_orgs || 0) * 99; // $99/month per organization
    
    res.json({
      success: true,
      revenue: {
        activeOrganizations: data.active_orgs || 0,
        payingOrganizations: data.revenue_paying_orgs || 0,
        estimatedMonthlyRevenue: `$${estimatedMonthlyRevenue}`,
        estimatedAnnualRevenue: `$${estimatedMonthlyRevenue * 12}`
      }
    });
  });
});

// =============================================================
// 12. USER ACTIVITY & LOGIN HISTORY
// =============================================================
router.get('/activity/user-logins', (req, res) => {
  const { days = 7 } = req.query;
  const sql = `
    SELECT 
      u.User_ID, u.First_Name, u.SurName, u.Email,
      o.Org_Name,
      COUNT(a.Attendance_ID) as total_checkins,
      MAX(a.Check_in_time) as last_login,
      MIN(a.Check_in_time) as first_login
    FROM User u
    JOIN Organization o ON u.Org_ID = o.Org_ID
    LEFT JOIN Attendance a ON u.User_ID = a.User_ID AND a.Check_in_time >= date('now', '-' || ? || ' days')
    GROUP BY u.User_ID
    ORDER BY last_login DESC
    LIMIT 500
  `;

  db.all(sql, [days], (err, activity) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, activity });
  });
});

// =============================================================
// 13. DETAILED EMPLOYEE ATTENDANCE (For Analytics Dashboard)
// =============================================================
router.get('/analytics/employees', (req, res) => {
  const { days = 7, orgId } = req.query;

  let sql = `
    SELECT 
      u.User_ID as id,
      u.First_Name || ' ' || u.SurName as name,
      SUBSTR(u.First_Name, 1, 1) || SUBSTR(u.SurName, 1, 1) as initials,
      d.Depart_Name as department,
      o.Org_Name,
      COUNT(a.Attendance_ID) as checkIns,
      ROUND(COUNT(a.Attendance_ID) * 100.0 / ?, 1) as attendanceRate,
      CASE 
        WHEN MAX(a.Check_in_time) >= datetime('now', '-1 hour') THEN 'on-time'
        WHEN MAX(a.Check_in_time) >= datetime('now', '-2 hours') THEN 'late'
        ELSE 'absent'
      END as status
    FROM User u
    LEFT JOIN Attendance a ON u.User_ID = a.User_ID AND a.Check_in_time >= date('now', '-' || ? || ' days')
    JOIN Organization o ON u.Org_ID = o.Org_ID
    LEFT JOIN Department d ON u.Dep_ID = d.Dep_ID
  `;

  const params = [days, days];

  if (orgId) {
    sql += ` WHERE u.Org_ID = ?`;
    params.push(orgId);
  }

  sql += ` GROUP BY u.User_ID ORDER BY u.First_Name LIMIT 100`;

  db.all(sql, params, (err, employees) => {
    if (err) return res.status(500).json({ error: err.message });
    
    res.json({
      success: true,
      employees: employees || [],
      period: { days }
    });
  });
});

// =============================================================
// 14. SYSTEM ALERTS (Placeholder for alert management)
// =============================================================
router.get('/alerts', (req, res) => {
  // This would connect to your alerts table if you have one
  // For now, we'll return system-generated alerts based on conditions
  const alerts = [];

  // Check for inactive organizations
  db.all(`SELECT * FROM Organization WHERE Is_Active = 0 LIMIT 5`, [], (err, inactiveOrgs) => {
    if (inactiveOrgs?.length > 0) {
      alerts.push({
        id: 'inactive-orgs',
        type: 'warning',
        title: 'Inactive Organizations',
        message: `${inactiveOrgs.length} organizations are currently inactive`,
        timestamp: new Date().toISOString(),
        organizations: inactiveOrgs.map(o => o.Org_Name)
      });
    }

    // Check for low active users
    db.get(`SELECT COUNT(*) as count FROM User WHERE Is_Active = 1`, [], (err, data) => {
      if ((data?.count || 0) < 10) {
        alerts.push({
          id: 'low-users',
          type: 'info',
          title: 'Low Active Users',
          message: `Only ${data.count} active users in the system`,
          timestamp: new Date().toISOString()
        });
      }

      res.json({ success: true, alerts });
    });
  });
});

// =============================================================
// 8. ADMIN PASSWORD RESET (SuperAdmin only)
// =============================================================
router.put('/organizations/:id/reset-admin-password', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { newPassword } = req.body;
  const orgId = req.params.id;

  // Validate input
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Hash the password OUTSIDE the callback
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find the organization's admin user (User_Type_ID = 1 is Admin)
    db.get(
      `SELECT User_ID, Email FROM User WHERE Org_ID = ? AND User_Type_ID = 1 LIMIT 1`,
      [orgId],
      (err, admin) => {
        if (err) {
          return res.status(500).json({ error: 'Database error: ' + err.message });
        }

        if (!admin) {
          return res.status(404).json({ error: 'Organization admin user not found' });
        }

        // Update the admin password
        db.run(
          `UPDATE User SET Password = ?, Updated_at = datetime('now') WHERE User_ID = ?`,
          [hashedPassword, admin.User_ID],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update password: ' + err.message });
            }

            // Log the action
            db.run(
              `INSERT INTO Audit_Log (Action, Table_Name, New_Data, Org_ID) VALUES (?, ?, ?, ?)`,
              ['RESET_ADMIN_PASSWORD', 'User', JSON.stringify({ User_ID: admin.User_ID, Email: admin.Email }), orgId]
            );

            res.json({
              success: true,
              message: 'Admin password reset successfully',
              admin_email: admin.Email
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Password hashing failed: ' + error.message });
  }
});

module.exports = router;