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

// Delete Organization (Wipe)
router.delete('/organizations/:id', (req, res) => {
  const orgId = req.params.id;
  // SQLite doesn't support easy cascading in all versions, so we delete carefully
  db.serialize(() => {
    db.run(`DELETE FROM User WHERE Org_ID = ?`, [orgId]);
    db.run(`DELETE FROM Attendance WHERE Org_ID = ?`, [orgId]);
    db.run(`DELETE FROM Organization WHERE Org_ID = ?`, [orgId], function(err) {
      if (err) return res.status(500).json({ error: 'Wipe failed' });
      res.json({ success: true, message: 'Tenant node fully purged.' });
    });
  });
});

module.exports = router;