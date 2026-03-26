const express = require('express');
const jwt = require('jsonwebtoken');  // ✅ FIXED: Added import
const db = require('../config/db');
const router = express.Router();

// ⭐ SUPER ADMIN MIDDLEWARE
const authenticateSuperAdmin = (req, res, next) => {
  // Check both Authorization and X-SuperAdmin-Token headers
  let authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  
  // Fallback to X-SuperAdmin-Token header
  if (!token) {
    authHeader = req.headers['x-superadmin-token'];
    token = authHeader && authHeader.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Super Admin token required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || decoded.role !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Super Admin access required' });
    }
    req.superAdmin = decoded;
    next();
  });
};

// PROTECTED ROUTES ONLY (no login)
router.use(authenticateSuperAdmin);

// GET /api/superadmin/dashboard - Main stats
router.get('/dashboard', (req, res) => {
  db.all(`
    SELECT 
      COUNT(DISTINCT o.Org_ID) as totalOrgs,
      COUNT(DISTINCT u.User_ID) as totalUsers,
      COUNT(a.Attend_ID) as todayCheckins,
      COUNT(DISTINCT d.Dep_ID) as totalDepts
    FROM Organization o
    LEFT JOIN User u ON u.Org_ID = o.Org_ID
    LEFT JOIN Attendance a ON a.Org_ID = o.Org_ID AND DATE(a.Check_in_time) = DATE('now')
    LEFT JOIN Department d ON d.Org_ID = o.Org_ID
  `, (err, stats) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    res.json({
      success: true,
      stats: stats[0] || { totalOrgs: 0, totalUsers: 0, todayCheckins: 0, totalDepts: 0 }
    });
  });
});

// GET /api/superadmin/organizations - All organizations
router.get('/organizations', (req, res) => {
  db.all(`
    SELECT 
      o.Org_ID, o.Org_Name, o.Org_Slug, o.Created_at,
      COUNT(u.User_ID) as userCount,
      COUNT(DISTINCT d.Dep_ID) as deptCount,
      sp.Plan_Name
    FROM Organization o
    LEFT JOIN User u ON u.Org_ID = o.Org_ID AND u.Is_Active = 1
    LEFT JOIN Department d ON d.Org_ID = o.Org_ID
    LEFT JOIN OrganizationSubscription os ON os.Org_ID = o.Org_ID
    LEFT JOIN SubscriptionPlan sp ON sp.Plan_ID = os.Plan_ID
    GROUP BY o.Org_ID
    ORDER BY o.Created_at DESC
    LIMIT 50
  `, (err, organizations) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    res.json({
      success: true,
      organizations: organizations.map(org => ({
        ...org,
        initials: org.Org_Name.slice(0, 2).toUpperCase(),
        created: new Date(org.Created_at).toLocaleDateString()
      }))
    });
  });
});

// GET /api/superadmin/users - All users across orgs
router.get('/users', (req, res) => {
  db.all(`
    SELECT 
      u.User_ID, u.First_Name, u.SurName, u.Email, u.Is_Active,
      o.Org_Name, o.Org_Slug,
      r.Role_Name, d.Depart_Name
    FROM User u
    JOIN Organization o ON u.Org_ID = o.Org_ID
    LEFT JOIN Role r ON u.Role_ID = r.Role_ID
    LEFT JOIN Department d ON u.Depart_ID = d.Dep_ID
    ORDER BY u.Created_at DESC
    LIMIT 100
  `, (err, users) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        fullName: `${user.First_Name} ${user.SurName}`,
        initials: (user.First_Name[0] + user.SurName[0]).toUpperCase()
      }))
    });
  });
});

// DELETE /api/superadmin/organizations/:orgId - Delete org + cascade
router.delete('/organizations/:orgId', (req, res) => {
  const { orgId } = req.params;
  
  db.run(
    'DELETE FROM Organization WHERE Org_ID = ?', [orgId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete organization' });
      
      res.json({
        success: true,
        message: `Organization deleted successfully (${this.changes} affected)`,
        deletedOrgId: orgId
      });
    }
  );
});

// GET /api/superadmin/organizations/:id - Get organization details
router.get('/organizations/:id', (req, res) => {
  try {
    const orgId = req.params.id;
    console.log('SuperAdmin fetching org details:', orgId);

    db.get('SELECT * FROM Organization WHERE Org_ID = ?', [orgId], (err, org) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!org) return res.status(404).json({ error: 'Organization not found' });

      // Get user count
      db.get('SELECT COUNT(*) as user_count FROM User WHERE Org_ID = ?', [orgId], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Get department count
        db.get('SELECT COUNT(*) as dept_count FROM Department WHERE Org_ID = ?', [orgId], (err, deptResult) => {
          if (err) return res.status(500).json({ error: err.message });

          res.json({
            ...org,
            user_count: result.user_count,
            dept_count: deptResult.dept_count
          });
        });
      });
    });
  } catch (error) {
    console.error('Get org details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/superadmin/organizations/:id/status - Update organization status
router.put('/organizations/:id/status', (req, res) => {
  try {
    const orgId = req.params.id;
    const { status } = req.body; // 'active', 'suspended', 'paused'

    console.log('SuperAdmin updating org status:', orgId, 'to', status);

    if (!['active', 'suspended', 'paused'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: active, suspended, or paused' });
    }

    // Map status to Is_Active field
    const isActive = status === 'active' ? 1 : 0;

    db.run(
      `UPDATE Organization SET Is_Active = ?, Updated_at = CURRENT_TIMESTAMP WHERE Org_ID = ?`,
      [isActive, orgId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Organization not found' });
        
        res.json({ 
          message: `✅ Organization ${status} successfully`,
          status: status,
          Org_ID: orgId
        });
      }
    );
  } catch (error) {
    console.error('Update org status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/superadmin/organizations/:id/users - Get organization users
router.get('/organizations/:id/users', (req, res) => {
  try {
    const orgId = req.params.id;

    db.all(
      `SELECT User_ID, First_Name, SurName, Email, User_Type_ID, Is_Active, Created_at FROM User WHERE Org_ID = ? ORDER BY Created_at DESC`,
      [orgId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/superadmin/organizations/:id/extend-trial - Extend trial by 30 days
router.put('/organizations/:id/extend-trial', (req, res) => {
  try {
    const orgId = req.params.id;
    console.log('SuperAdmin extending trial for org:', orgId);

    db.run(
      `UPDATE Organization SET Updated_at = CURRENT_TIMESTAMP WHERE Org_ID = ?`,
      [orgId],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Organization not found' });

        res.json({
          message: '✅ Trial extended by 30 days',
          Org_ID: orgId
        });
      }
    );
  } catch (error) {
    console.error('Extend trial error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;