const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();
const { notifyNewOrganization, notifyNewDepartment, notifyNewGeofence, notifySystemAlert } = require('../utils/notificationHelper');

const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

// =============================================================
// ⭐ SUPER ADMIN MIDDLEWARE
// =============================================================
const authenticateSuperAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.error('❌ No token provided');
    return res.status(401).json({ error: 'Super Admin token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('❌ Token verification error:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (decoded.role !== 'SuperAdmin') {
      console.error('❌ Not a SuperAdmin token, role:', decoded.role);
      return res.status(403).json({ error: 'Super Admin access required' });
    }
    console.log('✅ SuperAdmin authenticated with userId:', decoded.userId);
    req.superAdmin = decoded;
    req.user = { userId: decoded.userId || decoded.id }; // Store userId for notification queries
    next();
  });
};

router.use(authenticateSuperAdmin);

// =============================================================
// 0. SUPERADMIN SETTINGS & PREFERENCES
// =============================================================
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    settings: {
      profile: {
        email: 'superadmin@tracktimi.com',
        fullName: 'TrackTimi System Admin',
        role: 'Super Administrator',
        joinedDate: '2024-01-01',
        avatar: null,
        phone: '',
        address: ''
      },
      preferences: {
        theme: 'light',
        sidebarCollapsed: false,
        compactView: false,
        language: 'en',
        timezone: 'Africa/Monrovia',
        dateFormat: 'YYYY-MM-DD'
      },
      notifications: {
        emailOnOrgCreation: true,
        emailOnHighAbsence: true,
        emailOnSubscriptionExpiry: true,
        emailOnSecurityIssues: true,
        emailDigestFrequency: 'daily',
        pushNotifications: true,
        smsAlerts: false
      },
      dashboard: {
        defaultView: 'overview',
        chartType: 'line',
        itemsPerPage: 25,
        autoRefreshInterval: 300,
        showHiddenOrgs: false,
        highlightAnomalies: true
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        ipWhitelist: false,
        allowRemoteLogin: true,
        requirePasswordChange: false,
        passwordExpiryDays: 90
      },
      integrations: {
        slackWebhook: '',
        googleAnalytics: '',
        sendgridApiKey: '',
        stripePublicKey: ''
      }
    }
  });
});

router.put('/settings', (req, res) => {
  const { category, settings } = req.body;

  console.log('📝 Updating settings:', { category, settingsKeys: Object.keys(settings) });

  if (!category || !settings) {
    console.error('❌ Missing category or settings in request');
    return res.status(400).json({ error: 'category and settings are required' });
  }

  // Validate categories
  const validCategories = ['profile', 'preferences', 'notifications', 'dashboard', 'security', 'integrations'];
  if (!validCategories.includes(category)) {
    console.error('❌ Invalid category:', category);
    return res.status(400).json({ error: 'Invalid category' });
  }

  // Get Admin ID safely
  const adminId = req.superAdmin?.id || req.superAdmin?.userId || 1;

  // Log settings change
  db.run(
    `INSERT INTO Audit_Log (Action, Table_Name, New_Data, User_ID) VALUES (?, ?, ?, ?)`,
    ['UPDATE_SETTINGS', 'SuperAdmin_Settings', JSON.stringify({ category, settings }), adminId],
    (err) => {
      if (err) {
        console.error('⚠️ Failed to log settings change:', err);
        // Don't fail the response, just log the warning
      } else {
        console.log('✅ Settings change logged successfully');
      }

      // Always return success response
      return res.json({
        success: true,
        message: `${category} settings updated successfully`,
        updated: {
          category,
          settings,
          timestamp: new Date().toISOString()
        }
      });
    }
  );
});

router.put('/settings/password', async (req, res) => {
  const bcrypt = require('bcryptjs');
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'All password fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    db.run(
      `UPDATE Super_Admin SET Password = ? WHERE Email = ?`,
      [hashedPassword, 'superadmin@tracktimi.com'],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update password' });
        }

        // Log password change
        db.run(
          `INSERT INTO Audit_Log (Action, Table_Name, User_ID) VALUES (?, ?, ?)`,
          ['PASSWORD_CHANGE', 'Super_Admin', req.superAdmin.id || req.superAdmin.userId],
          (logErr) => {
            if (!logErr) console.log('✅ Password change logged');
          }
        );

        res.json({
          success: true,
          message: 'Password changed successfully'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to process password change' });
  }
});

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
      o.Logo_Path, o.Logo_MIME_Type, o.Address, o.Phone_Num, o.Email,
      o.Theme_Color,
      (SELECT COUNT(*) FROM User u WHERE u.Org_ID = o.Org_ID) as userCount
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
    info: `
      SELECT 
        o.*,
        COALESCE(ot.Type_Name, 'Not Set') as Org_Type_Name,
        COALESCE(r.Region_Name, 'Not Set') as Region_Name
      FROM Organization o
      LEFT JOIN Organization_Type ot ON o.Org_Type_ID = ot.Org_Type_ID
      LEFT JOIN Region r ON o.Region_ID = r.Region_ID
      WHERE o.Org_ID = ?
    `,
    subscription: `
      SELECT 
        os.Sub_ID,
        os.Status,
        os.Start_Date,
        os.End_Date,
        sp.Plan_Name,
        sp.Max_Users,
        sp.Max_Devices,
        sp.Price_Monthly
      FROM OrganizationSubscription os
      LEFT JOIN SubscriptionPlan sp ON os.Plan_ID = sp.Plan_ID
      WHERE os.Org_ID = ? AND os.Status = 'active'
      ORDER BY os.Start_Date DESC LIMIT 1
    `,
    adminUser: `
      SELECT User_ID, First_Name, SurName, Email, Phone_Num, Created_at
      FROM User
      WHERE Org_ID = ? AND Role_ID = (SELECT Role_ID FROM Role WHERE Role_Name = 'OrgAdmin')
      ORDER BY Created_at ASC LIMIT 1
    `,
    departments: `SELECT Dep_ID, Depart_Name, (SELECT COUNT(*) FROM User WHERE Dep_ID = d.Dep_ID) as staff_count FROM Department d WHERE Org_ID = ?`,
    users: `SELECT User_ID, First_Name, SurName, Email, Job_Title, Is_Active FROM User WHERE Org_ID = ?`,
    geofences: `SELECT Geo_ID, Name, Latitude, Longitude, Radius, Is_Active FROM Geofence WHERE Org_ID = ? ORDER BY Created_at DESC`,
    stats: `SELECT COUNT(*) as checkinsToday FROM Attendance WHERE Org_ID = ? AND date(Check_in_time) = date('now', 'localtime')`
  };

  const pInfo = new Promise(r => db.get(queries.info, [orgId], (e, row) => r(row)));
  const pSubscription = new Promise(r => db.get(queries.subscription, [orgId], (e, row) => r(row)));
  const pAdminUser = new Promise(r => db.get(queries.adminUser, [orgId], (e, row) => r(row)));
  const pDepts = new Promise(r => db.all(queries.departments, [orgId], (e, rows) => r(rows)));
  const pUsers = new Promise(r => db.all(queries.users, [orgId], (e, rows) => r(rows)));
  const pGeofences = new Promise(r => db.all(queries.geofences, [orgId], (e, rows) => r(rows || [])));
  const pStats = new Promise(r => db.get(queries.stats, [orgId], (e, row) => r(row)));

  Promise.all([pInfo, pSubscription, pAdminUser, pDepts, pUsers, pGeofences, pStats]).then(([info, subscription, adminUser, departments, users, geofences, stats]) => {
    if (!info) return res.status(404).json({ error: 'Organization not found' });
    
    // Add workspace capacity from subscription
    info.Workspace_Capacity = subscription ? `${subscription.Plan_Name} (${subscription.Max_Users} Users)` : 'Not Set';
    info.Plan_Details = subscription || null;
    
    // Add master credentials (admin user info)
    info.Master_Credentials = adminUser ? {
      name: `${adminUser.First_Name} ${adminUser.SurName}`,
      email: adminUser.Email,
      phone: adminUser.Phone_Num,
      createdAt: adminUser.Created_at
    } : { name: 'Not Set', email: 'N/A', phone: 'N/A', createdAt: null };
    
    // Log fetched data for verification
    console.log(`✅ Organization ${info.Org_ID} details fetched:`);
    console.log(`   - Workspace Capacity: ${info.Workspace_Capacity}`);
    console.log(`   - Master Credentials: ${info.Master_Credentials.name} (${info.Master_Credentials.email})`);
    console.log(`   - Geofences: ${geofences.length}`);
    console.log(`   - Departments: ${departments?.length || 0}`);
    console.log(`   - Users: ${users?.length || 0}`);
    console.log(`   - Check-ins Today: ${stats?.checkinsToday || 0}`);
    
    res.json({ info, departments, users, geofences, stats });
  }).catch(err => res.status(500).json({ error: err.message }));
});

// GET: Organization geofences only (for separate requests)
router.get('/organizations/:id/geofences', authenticateSuperAdmin, (req, res) => {
  const orgId = req.params.id;
  const sql = `SELECT Geo_ID, Name, Latitude, Longitude, Radius, Is_Active FROM Geofence WHERE Org_ID = ? ORDER BY Created_at DESC`;
  
  db.all(sql, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: rows || [], geofences: rows || [] });
  });
});

// PUT: Upload organization logo
router.put('/organizations/:id/logo', (req, res) => {
  const orgId = req.params.id;
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
    console.log(`✅ Logo uploaded for organization ${orgId}`);
    res.json({ 
      success: true, 
      message: 'Organization logo uploaded successfully',
      orgId,
      logoUpdated: true
    });
  });
});

// DELETE: Remove organization logo
router.delete('/organizations/:id/logo', (req, res) => {
  const orgId = req.params.id;

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
    console.log(`✅ Logo deleted for organization ${orgId}`);
    res.json({ 
      success: true, 
      message: 'Organization logo deleted successfully'
    });
  });
});

// =============================================================
// 4. NETWORK AUDIT LEDGER (Enhanced audit logs with comprehensive tracking)
// =============================================================
router.get('/audit-logs', (req, res) => {
  const { action, table, days = 30, limit = 500 } = req.query;

  let sql = `
    SELECT 
      al.Log_ID, al.User_ID, al.Org_ID, al.Action, al.Table_Name, al.Record_ID,
      al.Old_Data, al.New_Data, al.IP_Address, al.Created_at,
      u.First_Name as User_First_Name, u.SurName as User_Last_Name, u.Email as User_Email,
      o.Org_Name
    FROM Audit_Log al
    LEFT JOIN User u ON al.User_ID = u.User_ID
    LEFT JOIN Organization o ON al.Org_ID = o.Org_ID
    WHERE al.Created_at >= DATE('now', '-' || ? || ' days')
  `;

  const params = [days];

  // Optional filters
  if (action) {
    sql += ` AND al.Action = ?`;
    params.push(action);
  }
  if (table) {
    sql += ` AND al.Table_Name = ?`;
    params.push(table);
  }

  sql += ` ORDER BY al.Created_at DESC LIMIT ?`;
  params.push(parseInt(limit) || 500);

  db.all(sql, params, (err, logs) => {
    if (err) return res.status(500).json({ error: 'Audit log fetch failed: ' + err.message });
    
    // Parse JSON data fields
    const parsedLogs = logs.map(log => ({
      ...log,
      Old_Data: tryParseJSON(log.Old_Data),
      New_Data: tryParseJSON(log.New_Data),
      User_Name: log.User_First_Name && log.User_Last_Name 
        ? `${log.User_First_Name} ${log.User_Last_Name}` 
        : (log.User_Email || 'System'),
      changesSummary: getChangesSummary(log.Old_Data, log.New_Data)
    }));

    // Get action types and tables for filters
    db.all(
      `SELECT DISTINCT Action FROM Audit_Log WHERE Created_at >= DATE('now', '-' || ? || ' days') ORDER BY Action`,
      [days],
      (err, actions) => {
        db.all(
          `SELECT DISTINCT Table_Name FROM Audit_Log WHERE Created_at >= DATE('now', '-' || ? || ' days') ORDER BY Table_Name`,
          [days],
          (err, tables) => {
            res.json({
              success: true,
              logs: parsedLogs,
              count: parsedLogs.length,
              filters: {
                actions: actions?.map(a => a.Action) || [],
                tables: tables?.map(t => t.Table_Name) || []
              },
              dateRange: { days }
            });
          }
        );
      }
    );
  });
});

// Helper function to parse JSON safely
function tryParseJSON(str) {
  if (!str) return null;
  try {
    return typeof str === 'string' ? JSON.parse(str) : str;
  } catch {
    return str;
  }
}

// Helper function to get summary of changes
function getChangesSummary(oldData, newData) {
  if (!oldData && !newData) return 'No data';
  if (!oldData) return 'Created';
  if (!newData) return 'Deleted';
  
  // Parse if strings
  const old = typeof oldData === 'string' ? tryParseJSON(oldData) : oldData;
  const neu = typeof newData === 'string' ? tryParseJSON(newData) : newData;
  
  if (typeof old !== 'object' || typeof neu !== 'object') return 'Modified';
  
  const changes = [];
  for (const key in neu) {
    if (old[key] !== neu[key]) {
      changes.push(`${key}: ${old[key]} → ${neu[key]}`);
    }
  }
  return changes.length > 0 ? changes.slice(0, 2).join(', ') : 'Modified';
}

// =============================================================
// 5. GLOBAL USERS (Matches Global Users page)
// =============================================================
router.get('/users', (req, res) => {
  const sql = `
    SELECT 
      u.User_ID, u.First_Name, u.SurName, u.Email, u.Is_Active, u.Job_Title,
      u.Avatar_Data, u.Avatar_MIME_Type,
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

// 6A. SEND WARNING TO ORGANIZATION
router.post('/organizations/:id/warning', (req, res) => {
  const { message, sentAt } = req.body;
  const orgId = req.params.id;

  if (!message) {
    return res.status(400).json({ error: 'Warning message is required' });
  }

  // Log warning in audit log
  db.run(
    `INSERT INTO Audit_Log (Action, Table_Name, Record_ID, New_Data) 
     VALUES ('WARNING_SENT', 'Organization', ?, ?)`,
    [orgId, JSON.stringify({ message, sentAt, sentBy: 'SuperAdmin' })],
    (err) => {
      if (err) {
        console.error('❌ Failed to log warning:', err);
        return res.status(500).json({ error: 'Failed to log warning' });
      }
      res.json({ success: true, message: 'Warning logged successfully' });
    }
  );
});

// 6A2. POST RESET ADMIN PASSWORD
router.post('/organizations/:id/reset-password', (req, res) => {
  const orgId = req.params.id;

  console.log(`🔐 [SUPER ADMIN] Resetting admin password for org: ${orgId}`);

  // Generate random password
  const newPassword = Math.random().toString(36).slice(-12).toUpperCase() + Math.random().toString(36).slice(-3);

  // Try to get the organization's master/admin user
  // First try OrgAdmin role, then Admin, then just get first user
  const getUserSql = `
    SELECT User_ID, Email, First_Name, SurName FROM User 
    WHERE Org_ID = ? 
    ORDER BY CASE 
      WHEN Role = 'OrgAdmin' THEN 1
      WHEN Role = 'Admin' THEN 2
      ELSE 3
    END
    LIMIT 1
  `;
  
  db.get(getUserSql, [orgId], (err, user) => {
    if (err) {
      console.error('❌ Failed to fetch org user:', err);
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    if (!user) {
      console.error('❌ No users found for org:', orgId);
      return res.status(404).json({ error: 'No admin user found for this organization' });
    }

    console.log(`Found user: ${user.Email} (ID: ${user.User_ID})`);

    // Update user password
    db.run(
      `UPDATE User SET Password = ? WHERE User_ID = ?`,
      [newPassword, user.User_ID],
      function(err) {
        if (err) {
          console.error('❌ Failed to update password:', err);
          return res.status(500).json({ error: 'Update error: ' + err.message });
        }

        console.log(`✅ Password updated for user ${user.User_ID}`);

        // Log the password reset
        db.run(
          `INSERT INTO Audit_Log (Action, Table_Name, Record_ID, New_Data) 
           VALUES ('ADMIN_PASSWORD_RESET', 'User', ?, ?)`,
          [user.User_ID, JSON.stringify({ 
            adminEmail: user.Email, 
            adminName: `${user.First_Name} ${user.SurName}`,
            resetBy: 'SuperAdmin', 
            resetAt: new Date().toISOString() 
          })],
          (logErr) => {
            if (logErr) console.error('Failed to log password reset:', logErr);
            
            console.log(`✅ Admin password reset for ${user.Email}`);
            res.json({ 
              success: true, 
              message: 'Admin password reset successfully',
              newPassword: newPassword,
              adminEmail: user.Email,
              adminName: `${user.First_Name} ${user.SurName}`
            });
          }
        );
      }
    );
  });
});

// 6B. GET ORGANIZATION SPENDING
router.get('/organizations/:id/spending', (req, res) => {
  const orgId = req.params.id;

  // Get organization subscription and user count
  const sql = `
    SELECT 
      o.Org_ID,
      o.Org_Name,
      (SELECT COUNT(*) FROM User WHERE Org_ID = o.Org_ID) as total_users,
      os.Subscription_Type,
      os.Monthly_Cost,
      os.Created_at as subscription_date
    FROM Organization o
    LEFT JOIN OrganizationSubscription os ON o.Org_ID = os.Org_ID
    WHERE o.Org_ID = ?
  `;

  db.get(sql, [orgId], (err, data) => {
    if (err) {
      console.error('❌ Spending query error:', err);
      return res.status(500).json({ error: 'Failed to fetch spending data' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      success: true,
      spending: {
        orgId: data.Org_ID,
        orgName: data.Org_Name,
        totalUsers: data.total_users,
        subscriptionType: data.Subscription_Type || 'Basic',
        monthlyCost: data.Monthly_Cost || 0,
        subscriptionDate: data.subscription_date
      }
    });
  });
});

// 6C. DELETE ORGANIZATION
router.delete('/organizations/:id', (req, res) => {
  const orgId = req.params.id;

  console.log(`🔴 [SUPER ADMIN] Deleting organization: ${orgId}`);

  // Get organization name for logging
  db.get(
    `SELECT Org_Name FROM Organization WHERE Org_ID = ?`,
    [orgId],
    (err, org) => {
      if (err) {
        console.error('Database error fetching org:', err);
        return res.status(500).json({ error: 'Unable to complete deletion. Please try again.' });
      }
      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      // Log deletion before deleting
      db.run(
        `INSERT INTO Audit_Log (Action, Table_Name, Record_ID, New_Data) 
         VALUES ('ORGANIZATION_DELETED', 'Organization', ?, ?)`,
        [orgId, JSON.stringify({ orgName: org.Org_Name, deletedAt: new Date().toISOString() })],
        (logErr) => {
          if (logErr) console.error('Failed to log deletion:', logErr);

          // Disable foreign key checks temporarily for cascade delete
          db.run('PRAGMA foreign_keys = OFF', (pragmaErr) => {
            if (pragmaErr) console.error('Failed to disable FK checks:', pragmaErr);

            // Delete all related records in order
            db.serialize(() => {
              db.run(`DELETE FROM Attendance WHERE Org_ID = ?`, [orgId], (err) => {
                if (err) console.error('Failed to delete attendance:', err);
              });
              db.run(`DELETE FROM Department WHERE Org_ID = ?`, [orgId], (err) => {
                if (err) console.error('Failed to delete departments:', err);
              });
              db.run(`DELETE FROM Shift WHERE Org_ID = ?`, [orgId], (err) => {
                if (err) console.error('Failed to delete shifts:', err);
              });
              db.run(`DELETE FROM OrganizationSubscription WHERE Org_ID = ?`, [orgId], (err) => {
                if (err) console.error('Failed to delete subscription:', err);
              });
              db.run(`DELETE FROM User WHERE Org_ID = ?`, [orgId], (err) => {
                if (err) console.error('Failed to delete users:', err);
              });
              
              // Delete organization last
              db.run(
                `DELETE FROM Organization WHERE Org_ID = ?`,
                [orgId],
                function(err) {
                  // Re-enable foreign key checks
                  db.run('PRAGMA foreign_keys = ON', (pragmaErr2) => {
                    if (pragmaErr2) console.error('Failed to enable FK checks:', pragmaErr2);
                  });

                  if (err) {
                    console.error('❌ Delete organization error:', err);
                    return res.status(500).json({ error: 'Unable to delete organization. Error: ' + err.message });
                  }

                  console.log(`✅ Organization deleted: ${org.Org_Name}`);
                  res.json({ success: true, message: `${org.Org_Name} has been permanently deleted` });
                }
              );
            });
          });
        }
      );
    }
  );
});

// Create New Organization
router.post('/organizations', (req, res) => {
  const { Org_Name, Org_Domain, Theme_Color } = req.body;
  
  console.log('\n🔵 [SUPER ADMIN] Creating organization:', { Org_Name, Org_Domain });
  
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
    
    const newOrgId = this.lastID;
    const orgData = {
      Org_ID: newOrgId,
      Org_Name: Org_Name,
      Org_Domain: Org_Domain,
      Theme_Color: Theme_Color || '#6366f1'
    };

    console.log('🔵 [SUPER ADMIN] Organization created with ID:', newOrgId);
    
    // Log the action
    db.run(`INSERT INTO Audit_Log (Action, Table_Name, New_Data) VALUES (?, ?, ?)`,
           ['CREATED_ORGANIZATION', 'Organization', JSON.stringify({ Org_Name, Org_Domain })]);
    
    // Send notification to all superadmins
    console.log('🔵 [SUPER ADMIN] Calling notifyNewOrganization...');
    notifyNewOrganization(orgData, (err) => {
      if (err) {
        console.error('🔵 [SUPER ADMIN] Error from notifyNewOrganization:', err);
      } else {
        console.log('🔵 [SUPER ADMIN] notifyNewOrganization completed successfully');
      }
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Organization created successfully',
      orgId: newOrgId 
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
      g.Fence_ID, g.Org_ID, g.Location_Name, g.Latitude, g.Longitude, g.Radius, 
      g.Is_Active, g.Created_at,
      o.Org_Name,
      (SELECT COUNT(*) FROM Attendance WHERE Fence_ID = g.Fence_ID AND Check_in_time >= date('now', '-1 day')) as checkins_24h
    FROM Geofence g
    JOIN Organization o ON g.Org_ID = o.Org_ID
    ORDER BY g.Created_at DESC
  `;

  db.all(sql, [], (err, geofences) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, geofences });
  });
});

// GET: Geofences with full organization details
router.get('/geofences-with-orgs', (req, res) => {
  const sql = `
    SELECT 
      g.Fence_ID, g.Org_ID, g.Location_Name, g.Latitude, g.Longitude, g.Radius, 
      g.Is_Active, g.Created_at,
      o.Org_ID, o.Org_Name, o.Address, o.Email, o.Phone_Num,
      (SELECT COUNT(*) FROM Attendance WHERE Fence_ID = g.Fence_ID AND Check_in_time >= date('now', '-1 day')) as checkins_24h
    FROM Geofence g
    JOIN Organization o ON g.Org_ID = o.Org_ID
    ORDER BY o.Org_Name ASC, g.Created_at DESC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!rows || rows.length === 0) {
      return res.json({ 
        success: true, 
        data: [],
        count: 0
      });
    }

    // Fetch location history for each geofence
    let completedGeofences = 0;
    const geofences = rows.map(geo => ({
      Fence_ID: geo.Fence_ID,
      Org_ID: geo.Org_ID,
      Location_Name: geo.Location_Name,
      Latitude: geo.Latitude,
      Longitude: geo.Longitude,
      Radius: geo.Radius,
      Is_Active: geo.Is_Active,
      Created_at: geo.Created_at,
      OrgName: geo.Org_Name,
      Address: geo.Address,
      Email: geo.Email,
      Phone_Num: geo.Phone_Num,
      checkins_24h: geo.checkins_24h,
      history: []
    }));

    // Fetch location history from audit logs
    geofences.forEach((geo, index) => {
      const historySql = `
        SELECT 
          New_Data as locationData,
          Created_at as changedAt
        FROM Audit_Log
        WHERE Table_Name = 'Geofence' 
          AND Record_ID = ? 
          AND (Action = 'UPDATE' OR Action = 'CREATE')
        ORDER BY Created_at DESC
        LIMIT 10
      `;

      db.all(historySql, [geo.Fence_ID], (err, history) => {
        if (history && history.length > 0) {
          geo.history = history.map(h => {
            try {
              const data = JSON.parse(h.locationData);
              return {
                latitude: data.Latitude || data.latitude || geo.Latitude,
                longitude: data.Longitude || data.longitude || geo.Longitude,
                changedAt: h.changedAt
              };
            } catch {
              return {
                latitude: geo.Latitude,
                longitude: geo.Longitude,
                changedAt: h.changedAt
              };
            }
          });
        }

        completedGeofences++;
        if (completedGeofences === geofences.length) {
          res.json({ 
            success: true, 
            data: geofences,
            count: geofences.length
          });
        }
      });
    });
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
// 14. SYSTEM ALERTS (Comprehensive alert management)
// =============================================================
router.get('/alerts', (req, res) => {
  const alerts = [];
  let completedQueries = 0;
  const totalQueries = 6;

  // Helper to check if all queries completed
  const checkAllComplete = () => {
    completedQueries++;
    if (completedQueries === totalQueries) {
      // Sort by severity and timestamp
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      alerts.sort((a, b) => {
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });
      res.json({ success: true, alerts, count: alerts.length });
    }
  };

  // 1. INACTIVE ORGANIZATIONS
  db.all(
    `SELECT Org_ID, Org_Name, Created_at FROM Organization WHERE Is_Active = 0 ORDER BY Org_Name`,
    [],
    (err, inactiveOrgs) => {
      if (inactiveOrgs?.length > 0) {
        alerts.push({
          id: 'inactive-orgs-' + Date.now(),
          type: 'organizations',
          severity: 'warning',
          title: `${inactiveOrgs.length} Inactive Organization${inactiveOrgs.length > 1 ? 's' : ''}`,
          message: `${inactiveOrgs.length} organization${inactiveOrgs.length > 1 ? 's are' : ' is'} currently inactive and need attention`,
          timestamp: new Date().toISOString(),
          count: inactiveOrgs.length,
          details: inactiveOrgs.slice(0, 5).map(o => o.Org_Name),
          actionRequired: true
        });
      }
      checkAllComplete();
    }
  );

  // 2. USERS WITHOUT CLOCK OUT (Currently checked in)
  db.all(
    `SELECT u.User_ID, u.First_Name, u.SurName, o.Org_Name, a.Check_in_time 
     FROM Attendance a
     JOIN User u ON a.User_ID = u.User_ID
     JOIN Organization o ON a.Org_ID = o.Org_ID
     WHERE a.Check_out_time IS NULL 
       AND DATE(a.Check_in_time) = DATE('now', 'localtime')
     LIMIT 20`,
    [],
    (err, usersCheckedIn) => {
      if (usersCheckedIn?.length > 0) {
        alerts.push({
          id: 'active-checkins-' + Date.now(),
          type: 'attendance',
          severity: 'info',
          title: `${usersCheckedIn.length} User${usersCheckedIn.length > 1 ? 's' : ''} Currently Checked In`,
          message: `${usersCheckedIn.length} user${usersCheckedIn.length > 1 ? 's are' : ' is'} currently checked in and haven't clocked out`,
          timestamp: new Date().toISOString(),
          count: usersCheckedIn.length,
          details: usersCheckedIn.slice(0, 5).map(u => `${u.First_Name} ${u.SurName} (${u.Org_Name})`),
          actionRequired: false
        });
      }
      checkAllComplete();
    }
  );

  // 3. LATE ARRIVALS TODAY
  db.all(
    `SELECT u.User_ID, u.First_Name, u.SurName, o.Org_Name, a.Check_in_time, s.Shift_Start_Time 
     FROM Attendance a
     JOIN User u ON a.User_ID = u.User_ID
     JOIN Organization o ON a.Org_ID = o.Org_ID
     JOIN Shift s ON u.User_ID = s.User_ID
     WHERE DATE(a.Check_in_time) = DATE('now', 'localtime')
       AND TIME(a.Check_in_time) > TIME(s.Shift_Start_Time)
     LIMIT 20`,
    [],
    (err, lateArrivals) => {
      if (lateArrivals?.length > 0) {
        alerts.push({
          id: 'late-arrivals-' + Date.now(),
          type: 'attendance',
          severity: 'warning',
          title: `${lateArrivals.length} Late Arrival${lateArrivals.length > 1 ? 's' : ''} Today`,
          message: `${lateArrivals.length} user${lateArrivals.length > 1 ? 's have' : ' has'} arrived late today`,
          timestamp: new Date().toISOString(),
          count: lateArrivals.length,
          details: lateArrivals.slice(0, 5).map(u => `${u.First_Name} ${u.SurName}`),
          actionRequired: true
        });
      }
      checkAllComplete();
    }
  );

  // 4. HIGH ABSENCE RATE (Last 7 days)
  db.all(
    `SELECT o.Org_ID, o.Org_Name, 
            COUNT(*) as total_records,
            SUM(CASE WHEN a.Status_ID = 3 THEN 1 ELSE 0 END) as absences
     FROM Attendance a
     JOIN Organization o ON a.Org_ID = o.Org_ID
     WHERE a.Check_in_time >= DATE('now', '-7 days')
     GROUP BY o.Org_ID
     HAVING absences > (total_records * 0.2)
     ORDER BY (CAST(absences AS FLOAT) / total_records) DESC
     LIMIT 10`,
    [],
    (err, highAbsenceOrgs) => {
      if (highAbsenceOrgs?.length > 0) {
        alerts.push({
          id: 'high-absence-' + Date.now(),
          type: 'attendance',
          severity: 'critical',
          title: `High Absence Rate in ${highAbsenceOrgs.length} Organization${highAbsenceOrgs.length > 1 ? 's' : ''}`,
          message: `Organizations with >20% absence rate in the last 7 days need review`,
          timestamp: new Date().toISOString(),
          count: highAbsenceOrgs.length,
          details: highAbsenceOrgs.slice(0, 5).map(o => `${o.Org_Name} (${o.absences}/${o.total_records})`),
          actionRequired: true
        });
      }
      checkAllComplete();
    }
  );

  // 5. EXPIRING SUBSCRIPTIONS (Within 30 days)
  db.all(
    `SELECT o.Org_ID, o.Org_Name, sub.End_Date, p.Plan_Name
     FROM OrganizationSubscription sub
     JOIN Organization o ON sub.Org_ID = o.Org_ID
     JOIN SubscriptionPlan p ON sub.Plan_ID = p.Plan_ID
     WHERE sub.Status = 'active'
       AND sub.End_Date BETWEEN DATE('now') AND DATE('now', '+30 days')
     ORDER BY sub.End_Date ASC`,
    [],
    (err, expiringSubscriptions) => {
      if (expiringSubscriptions?.length > 0) {
        alerts.push({
          id: 'expiring-subs-' + Date.now(),
          type: 'billing',
          severity: 'warning',
          title: `${expiringSubscriptions.length} Subscription${expiringSubscriptions.length > 1 ? 's' : ''} Expiring Soon`,
          message: `${expiringSubscriptions.length} organization${expiringSubscriptions.length > 1 ? 's have' : ' has'} subscriptions expiring within 30 days`,
          timestamp: new Date().toISOString(),
          count: expiringSubscriptions.length,
          details: expiringSubscriptions.slice(0, 5).map(s => `${s.Org_Name} (${s.Plan_Name}) - ${s.End_Date}`),
          actionRequired: true
        });
      }
      checkAllComplete();
    }
  );

  // 6. SYSTEM HEALTH
  db.all(
    `SELECT 
      (SELECT COUNT(*) FROM Organization) as totalOrgs,
      (SELECT COUNT(*) FROM Organization WHERE Is_Active = 1) as activeOrgs,
      (SELECT COUNT(*) FROM User WHERE Is_Active = 1) as activeUsers,
      (SELECT COUNT(*) FROM Attendance WHERE DATE(Check_in_time) = DATE('now', 'localtime')) as todayCheckins`,
    [],
    (err, systemStats) => {
      if (err) {
        console.error('Error fetching system stats:', err);
        checkAllComplete();
        return;
      }
      
      const stats = (systemStats && systemStats[0]) || {};
      
      // Generate system health alert if needed
      if ((stats.activeOrgs || 0) === 0) {
        alerts.push({
          id: 'no-active-orgs-' + Date.now(),
          type: 'system',
          severity: 'critical',
          title: 'No Active Organizations',
          message: 'The system has no active organizations. This is unusual.',
          timestamp: new Date().toISOString(),
          actionRequired: true
        });
      }
      
      // Store system stats in response for dashboard
      checkAllComplete();
    }
  );
});

// =============================================================
// 15. SYSTEM CONFIGURATION (Global settings & management)
// =============================================================
router.get('/system/config', (req, res) => {
  const config = {
    system: {
      name: 'TrackTimi',
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'production',
      apiUrl: process.env.API_URL || 'http://localhost:4000',
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      supportEmail: 'support@tracktimi.com',
      timezone: 'Africa/Monrovia',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      currency: 'USD'
    },
    security: {
      jwtExpiry: '7d',
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      sessionTimeout: '30m',
      twoFactorAuth: false,
      ipWhitelist: false,
      requireHttps: false
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      slackIntegration: false,
      emailProvider: 'Mailtrap',
      dailyDigest: true,
      realTimeAlerts: true
    },
    features: {
      geofencing: true,
      attendanceTracking: true,
      departmentManagement: true,
      advancedReporting: true,
      customBranding: true,
      userInvitations: true,
      auditLogs: true,
      notificationSystem: true,
      multipleTimeZones: true,
      bulkUserImport: false
    },
    performance: {
      cachingEnabled: true,
      maxConcurrentConnections: 1000,
      databasePoolSize: 10,
      logRetentionDays: 90,
      autoBackupEnabled: true,
      backupFrequency: 'daily'
    },
    billing: {
      stripeEnabled: false,
      paypalEnabled: false,
      freeTrialDays: 14,
      gracePeriodDays: 7,
      requirePaymentInfo: false,
      allowFreePlan: true
    }
  };

  // Get real database stats
  db.all(
    `SELECT 
      (SELECT COUNT(*) FROM Organization) as totalOrgs,
      (SELECT COUNT(*) FROM User) as totalUsers,
      (SELECT COUNT(*) FROM Device) as totalDevices,
      (SELECT COUNT(*) FROM Attendance) as totalAttendance,
      (SELECT COUNT(*) FROM Geofence) as totalGeofences`,
    [],
    (err, stats) => {
      const dbStats = stats[0] || {};
      
      // Get database size
      db.get(
        `SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`,
        [],
        (err, row) => {
          config.database = {
            type: 'SQLite',
            version: '3.42.0',
            location: 'backend/data/tracktimi.db',
            sizeInMB: ((row?.size || 0) / 1024 / 1024).toFixed(2),
            backupStatus: 'Active',
            totalOrganizations: dbStats.totalOrgs || 0,
            totalUsers: dbStats.totalUsers || 0,
            totalDevices: dbStats.totalDevices || 0,
            totalAttendanceRecords: dbStats.totalAttendance || 0,
            totalGeofences: dbStats.totalGeofences || 0
          };

          res.json({
            success: true,
            config,
            lastUpdated: new Date().toISOString()
          });
        }
      );
    }
  );
});

// Update system configuration
router.put('/system/config', (req, res) => {
  const { category, settings } = req.body;

  if (!category || !settings) {
    return res.status(400).json({ error: 'category and settings are required' });
  }

  // Here you would typically update a system_settings table
  // For now, we'll validate and return success
  const validCategories = ['system', 'security', 'notifications', 'features', 'performance', 'billing'];
  
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  // Log configuration change
  db.run(
    `INSERT INTO Audit_Log (Action, Table_Name, New_Data) VALUES (?, ?, ?)`,
    ['UPDATE', 'System_Config', JSON.stringify({ category, settings, timestamp: new Date().toISOString() })],
    (err) => {
      if (err) {
        console.error('Failed to log config change:', err);
      }

      res.json({
        success: true,
        message: `${category} configuration updated successfully`,
        updated: {
          category,
          settings,
          timestamp: new Date().toISOString()
        }
      });
    }
  );
});

// Test system health with detailed diagnostics
router.get('/system/diagnostics', (req, res) => {
  const diagnostics = {
    checks: {},
    issues: [],
    recommendations: []
  };

  // Check database connectivity
  db.get('SELECT 1', [], (err) => {
    diagnostics.checks.database = err ? 'Failed' : 'Healthy';
    if (err) diagnostics.issues.push('Database connectivity issue');
  });

  // Check organization count
  db.get('SELECT COUNT(*) as count FROM Organization', [], (err, row) => {
    const count = row?.count || 0;
    diagnostics.checks.organizations = count > 0 ? 'Healthy' : 'Warning';
    if (count === 0) diagnostics.recommendations.push('Add organizations to the system');
  });

  // Check active users
  db.get('SELECT COUNT(*) as count FROM User WHERE Is_Active = 1', [], (err, row) => {
    const count = row?.count || 0;
    diagnostics.checks.activeUsers = count > 10 ? 'Healthy' : 'Warning';
    if (count < 10) diagnostics.recommendations.push(`Low active user count (${count})`);
  });

  // Check recent errors
  db.all('SELECT COUNT(*) as count FROM Audit_Log WHERE Action LIKE "%ERROR%" AND Created_at >= DATE("now", "-1 day")', [], (err, rows) => {
    const count = rows?.[0]?.count || 0;
    diagnostics.checks.recentErrors = count === 0 ? 'Healthy' : 'Warning';
    if (count > 0) diagnostics.recommendations.push(`${count} errors in last 24 hours`);
  });

  // Check database size
  db.get('SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()', [], (err, row) => {
    const sizeMB = ((row?.size || 0) / 1024 / 1024).toFixed(2);
    diagnostics.checks.databaseSize = sizeMB < 500 ? 'Healthy' : 'Warning';
    if (sizeMB > 500) diagnostics.recommendations.push(`Database size is large (${sizeMB}MB) - consider pruning old logs`);
  });

  setTimeout(() => {
    res.json({
      success: true,
      diagnostics,
      timestamp: new Date().toISOString(),
      systemHealth: diagnostics.issues.length === 0 ? 'Excellent' : (diagnostics.issues.length < 3 ? 'Good' : 'Fair')
    });
  }, 500);
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

// =============================================================
// 15. SUPERADMIN NOTIFICATIONS
// =============================================================

// Get superadmin notifications with counts by category
router.get('/notifications', authenticateSuperAdmin, (req, res) => {
  try {
    const userId = req.user?.userId;
    const limit = parseInt(req.query.limit) || 50;

    console.log('🔔 Backend: Fetching notifications for userId:', userId);

    if (!userId) return res.status(401).json({ error: 'User ID not found in token' });

    // Get all notifications
    const sqlNotifications = `
      SELECT 
        Notify_ID, 
        Title, 
        Message, 
        Type, 
        Category, 
        Is_Read, 
        Created_at, 
        Read_at, 
        Action_URL
      FROM Notification
      WHERE User_ID = ?
      ORDER BY Is_Read ASC, Created_at DESC
      LIMIT ?
    `;

    // Get counts by category
    const sqlCounts = `
      SELECT 
        Category,
        COUNT(*) as count
      FROM Notification
      WHERE User_ID = ?
      GROUP BY Category
    `;

    // Get unread count
    const sqlUnreadCount = `
      SELECT COUNT(*) as unreadCount FROM Notification 
      WHERE User_ID = ? AND Is_Read = 0
    `;

    db.all(sqlNotifications, [userId, limit], (err, notifications) => {
      if (err) {
        console.error('❌ Database error fetching notifications:', err.message);
        console.log('⚠️ Returning empty response due to DB error');
        return res.json({
          notifications: [],
          unreadCount: 0,
          counts: {
            all: 0,
            unread: 0,
            organization: 0,
            user: 0,
            department: 0,
            location: 0,
            attendance: 0,
            system: 0
          }
        });
      }

      // Get category counts
      db.all(sqlCounts, [userId], (err2, counts) => {
        const categoryCount = {};
        if (counts) {
          counts.forEach(row => {
            categoryCount[row.Category] = row.count;
          });
        }

        // Get unread count
        db.get(sqlUnreadCount, [userId], (err3, unreadRow) => {
          const unreadCount = unreadRow?.unreadCount || 0;
          
          console.log('✅ Found', notifications?.length || 0, 'notifications for userId:', userId);
          
          res.json({
            notifications: notifications || [],
            unreadCount: unreadCount,
            counts: {
              all: notifications?.length || 0,
              unread: unreadCount,
              organization: categoryCount['organization'] || 0,
              user: categoryCount['user'] || 0,
              department: categoryCount['department'] || 0,
              location: categoryCount['location'] || 0,
              attendance: categoryCount['attendance'] || 0,
              system: categoryCount['system'] || 0
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('❌ Error in notifications endpoint:', error);
    res.json({
      notifications: [],
      unreadCount: 0,
      counts: {
        all: 0,
        unread: 0,
        organization: 0,
        user: 0,
        department: 0,
        location: 0,
        attendance: 0,
        system: 0
      }
    });
  }
});

// Get unread superadmin notifications count
router.get('/notifications/unread/count', authenticateSuperAdmin, (req, res) => {
  try {
    const userId = req.user?.userId;

    console.log('📊 Backend: Fetching unread count for userId:', userId);

    if (!userId) return res.status(401).json({ error: 'User ID not found in token' });

    const sql = `
      SELECT COUNT(*) as unread_count FROM Notification
      WHERE User_ID = ? AND Is_Read = 0
    `;

    db.get(sql, [userId], (err, row) => {
      if (err) {
        console.error('❌ Database error fetching unread count:', err.message);
        console.log('⚠️ Returning 0 as fallback');
        return res.json({ unreadCount: 0 });
      }
      const count = row?.unread_count || 0;
      console.log('✅ Unread count for userId', userId, ':', count);
      res.json({ unreadCount: count });
    });
  } catch (error) {
    console.error('❌ Error in unread count endpoint:', error);
    res.json({ unreadCount: 0 });
  }
});

// Mark superadmin notification as read
router.put('/notifications/:notifyId/read', authenticateSuperAdmin, (req, res) => {
  try {
    const { notifyId } = req.params;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'User ID not found in token' });

    const sql = `
      UPDATE Notification
      SET Is_Read = 1, Read_at = datetime('now', 'localtime')
      WHERE Notify_ID = ? AND User_ID = ?
    `;

    db.run(sql, [notifyId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to mark as read' });
      if (this.changes === 0) return res.status(404).json({ error: 'Notification not found' });
      res.json({ success: true, message: 'Notification marked as read' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mark all superadmin notifications as read
router.put('/notifications/mark-all-read', authenticateSuperAdmin, (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'User ID not found in token' });

    const sql = `
      UPDATE Notification
      SET Is_Read = 1, Read_at = datetime('now', 'localtime')
      WHERE User_ID = ? AND Is_Read = 0
    `;

    db.run(sql, [userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to mark notifications as read' });
      res.json({ success: true, message: 'All notifications marked as read' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete superadmin notification
router.delete('/notifications/:notifyId', authenticateSuperAdmin, (req, res) => {
  try {
    const { notifyId } = req.params;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ error: 'User ID not found in token' });

    const sql = `DELETE FROM Notification WHERE Notify_ID = ? AND User_ID = ?`;

    db.run(sql, [notifyId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete notification' });
      if (this.changes === 0) return res.status(404).json({ error: 'Notification not found' });
      res.json({ success: true, message: 'Notification deleted' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// =============================================================
// 16. FEEDBACK MANAGEMENT (SuperAdmin feedback oversight)
// =============================================================

// GET: Fetch all feedback from database (SuperAdmin view)
router.get('/feedback', (req, res) => {
  const { orgId, status, category, limit = 50, offset = 0 } = req.query;

  let sql = `
    SELECT 
      f.Feedback_ID,
      f.User_ID,
      f.Org_ID,
      f.Title,
      f.Message,
      f.Category,
      f.Rating,
      f.Status,
      f.Response,
      f.Responded_By,
      f.Responded_at,
      f.Created_at,
      u.First_Name,
      u.SurName,
      u.Email,
      o.Org_Name
    FROM Feedback f
    LEFT JOIN User u ON f.User_ID = u.User_ID
    LEFT JOIN Organization o ON f.Org_ID = o.Org_ID
    WHERE 1=1
  `;

  const params = [];

  // Optional filters
  if (orgId) {
    sql += ` AND f.Org_ID = ?`;
    params.push(orgId);
  }

  if (status) {
    sql += ` AND f.Status = ?`;
    params.push(status);
  }

  if (category) {
    sql += ` AND f.Category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY f.Created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  db.all(sql, params, (err, feedback) => {
    if (err) {
      console.error('❌ Error fetching feedback:', err.message);
      return res.status(500).json({ error: 'Failed to fetch feedback: ' + err.message });
    }

    // Get total count for pagination
    let countSql = `SELECT COUNT(*) as total FROM Feedback f WHERE 1=1`;
    let countParams = [];

    if (orgId) {
      countSql += ` AND f.Org_ID = ?`;
      countParams.push(orgId);
    }
    if (status) {
      countSql += ` AND f.Status = ?`;
      countParams.push(status);
    }
    if (category) {
      countSql += ` AND f.Category = ?`;
      countParams.push(category);
    }

    db.get(countSql, countParams, (err2, countRow) => {
      if (err2) {
        console.error('❌ Error counting feedback:', err2.message);
        return res.status(500).json({ error: 'Failed to count feedback' });
      }

      console.log(`✅ Fetched ${feedback?.length || 0} feedback items`);

      res.json({
        success: true,
        feedback: feedback || [],
        pagination: {
          total: countRow?.total || 0,
          limit: parseInt(limit),
          offset: parseInt(offset),
          page: Math.floor(parseInt(offset) / parseInt(limit)) + 1
        }
      });
    });
  });
});

// GET: Feedback statistics/summary (MUST come before /:feedbackId route)
router.get('/feedback/stats/summary', (req, res) => {
  const { orgId } = req.query;

  let sql = `
    SELECT 
      COUNT(*) as total_feedback,
      SUM(CASE WHEN Status = 'open' THEN 1 ELSE 0 END) as open_count,
      SUM(CASE WHEN Status = 'responded' THEN 1 ELSE 0 END) as responded_count,
      SUM(CASE WHEN Status = 'closed' THEN 1 ELSE 0 END) as closed_count,
      AVG(CAST(Rating as FLOAT)) as avg_rating,
      SUM(CASE WHEN Rating = 5 THEN 1 ELSE 0 END) as five_star_count,
      SUM(CASE WHEN Rating = 4 THEN 1 ELSE 0 END) as four_star_count,
      SUM(CASE WHEN Rating = 3 THEN 1 ELSE 0 END) as three_star_count,
      SUM(CASE WHEN Rating = 2 THEN 1 ELSE 0 END) as two_star_count,
      SUM(CASE WHEN Rating = 1 THEN 1 ELSE 0 END) as one_star_count
    FROM Feedback
    WHERE 1=1
  `;

  const params = [];

  if (orgId) {
    sql += ` AND Org_ID = ?`;
    params.push(orgId);
  }

  db.get(sql, params, (err, stats) => {
    if (err) {
      console.error('❌ Error fetching feedback stats:', err.message);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    const summary = stats || {
      total_feedback: 0,
      open_count: 0,
      responded_count: 0,
      closed_count: 0,
      avg_rating: 0,
      five_star_count: 0,
      four_star_count: 0,
      three_star_count: 0,
      two_star_count: 0,
      one_star_count: 0
    };

    console.log(`✅ Fetched feedback stats: ${summary.total_feedback} total`);

    res.json({
      success: true,
      stats: {
        totalFeedback: summary.total_feedback || 0,
        status: {
          open: summary.open_count || 0,
          responded: summary.responded_count || 0,
          closed: summary.closed_count || 0
        },
        rating: {
          average: parseFloat(summary.avg_rating || 0).toFixed(1),
          distribution: {
            five: summary.five_star_count || 0,
            four: summary.four_star_count || 0,
            three: summary.three_star_count || 0,
            two: summary.two_star_count || 0,
            one: summary.one_star_count || 0
          }
        }
      }
    });
  });
});

// GET: Get feedback by ID (single feedback detail)
router.get('/feedback/:feedbackId', (req, res) => {
  const { feedbackId } = req.params;

  const sql = `
    SELECT 
      f.Feedback_ID,
      f.User_ID,
      f.Org_ID,
      f.Title,
      f.Message,
      f.Category,
      f.Rating,
      f.Status,
      f.Response,
      f.Responded_By,
      f.Responded_at,
      f.Created_at,
      u.First_Name,
      u.SurName,
      u.Email,
      u.Phone_Num,
      o.Org_Name,
      o.Org_Domain
    FROM Feedback f
    LEFT JOIN User u ON f.User_ID = u.User_ID
    LEFT JOIN Organization o ON f.Org_ID = o.Org_ID
    WHERE f.Feedback_ID = ?
  `;

  db.get(sql, [feedbackId], (err, feedback) => {
    if (err) {
      console.error('❌ Error fetching feedback detail:', err.message);
      return res.status(500).json({ error: 'Failed to fetch feedback' });
    }

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    console.log(`✅ Fetched feedback ${feedbackId}`);

    res.json({
      success: true,
      feedback
    });
  });
});

// POST: Respond to feedback
router.post('/feedback/:feedbackId/respond', (req, res) => {
  const { feedbackId } = req.params;
  const { response } = req.body;

  if (!response || response.trim().length === 0) {
    return res.status(400).json({ error: 'Response message is required' });
  }

  const superAdminId = req.superAdmin?.id || req.superAdmin?.userId || 1;
  const respondedBy = `SuperAdmin (${superAdminId})`;

  const sql = `
    UPDATE Feedback
    SET Response = ?,
        Responded_By = ?,
        Responded_at = datetime('now', 'localtime'),
        Status = 'responded'
    WHERE Feedback_ID = ?
  `;

  db.run(sql, [response, respondedBy, feedbackId], function(err) {
    if (err) {
      console.error('❌ Error responding to feedback:', err.message);
      return res.status(500).json({ error: 'Failed to respond to feedback' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Log the action
    db.run(
      `INSERT INTO Audit_Log (Action, Table_Name, Record_ID, New_Data) VALUES (?, ?, ?, ?)`,
      ['FEEDBACK_RESPONDED', 'Feedback', feedbackId, JSON.stringify({ response, respondedBy })],
      (logErr) => {
        if (logErr) console.error('⚠️ Failed to log feedback response:', logErr);
      }
    );

    console.log(`✅ Responded to feedback ${feedbackId}`);

    res.json({
      success: true,
      message: 'Response sent successfully',
      feedback_id: feedbackId,
      status: 'responded'
    });
  });
});

// PUT: Update feedback status (open, responded, closed)
router.put('/feedback/:feedbackId/status', (req, res) => {
  const { feedbackId } = req.params;
  const { status } = req.body;

  const validStatuses = ['open', 'responded', 'closed'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  const sql = `
    UPDATE Feedback
    SET Status = ?
    WHERE Feedback_ID = ?
  `;

  db.run(sql, [status, feedbackId], function(err) {
    if (err) {
      console.error('❌ Error updating feedback status:', err.message);
      return res.status(500).json({ error: 'Failed to update status' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Log the action
    db.run(
      `INSERT INTO Audit_Log (Action, Table_Name, Record_ID, New_Data) VALUES (?, ?, ?, ?)`,
      ['FEEDBACK_STATUS_UPDATED', 'Feedback', feedbackId, JSON.stringify({ status })],
      (logErr) => {
        if (logErr) console.error('⚠️ Failed to log status update:', logErr);
      }
    );

    console.log(`✅ Updated feedback ${feedbackId} status to ${status}`);

    res.json({
      success: true,
      message: `Feedback marked as ${status}`,
      feedback_id: feedbackId,
      status
    });
  });
});

// DELETE: Delete feedback
router.delete('/feedback/:feedbackId', (req, res) => {
  const { feedbackId } = req.params;

  // First get feedback details for logging
  db.get(
    `SELECT Feedback_ID, Org_ID, Title FROM Feedback WHERE Feedback_ID = ?`,
    [feedbackId],
    (err, feedback) => {
      if (err) {
        console.error('❌ Error fetching feedback:', err.message);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!feedback) {
        return res.status(404).json({ error: 'Feedback not found' });
      }

      // Delete the feedback
      db.run(
        `DELETE FROM Feedback WHERE Feedback_ID = ?`,
        [feedbackId],
        function(err) {
          if (err) {
            console.error('❌ Error deleting feedback:', err.message);
            return res.status(500).json({ error: 'Failed to delete feedback' });
          }

          // Log the action
          db.run(
            `INSERT INTO Audit_Log (Action, Table_Name, Record_ID, New_Data, Org_ID) VALUES (?, ?, ?, ?, ?)`,
            ['FEEDBACK_DELETED', 'Feedback', feedbackId, JSON.stringify({ title: feedback.Title }), feedback.Org_ID],
            (logErr) => {
              if (logErr) console.error('⚠️ Failed to log feedback deletion:', logErr);
            }
          );

          console.log(`✅ Deleted feedback ${feedbackId}`);

          res.json({
            success: true,
            message: 'Feedback deleted successfully',
            feedback_id: feedbackId
          });
        }
      );
    }
  );
});

module.exports = router;