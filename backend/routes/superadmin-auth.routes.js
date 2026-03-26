const express = require('express');
const jwt = require('jsonwebtoken');  // ✅ FIXED: Added import
const db = require('../config/db');
const router = express.Router();

// ✅ SUPERADMIN LOGIN - MISSING ENDPOINT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔍 SuperAdmin Login Attempt:', { email, password, receivedEmail: email, receivedPassword: password });
    
    // ✅ Default superadmin credentials (change in production)
    if (email === 'superadmin@tracktimi.com' && password === 'superpass123') {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
      
      const token = jwt.sign(
        { role: 'SuperAdmin', email: email }, 
        JWT_SECRET, 
        { expiresIn: '24h' }
      );
      
      console.log('✅ SuperAdmin login successful for:', email);
      res.json({
        success: true,
        token,
        user: { role: 'SuperAdmin', email }
      });
    } else {
      console.log('❌ Invalid credentials. Expected: superadmin@tracktimi.com / superpass123');
      res.status(401).json({ error: 'Invalid superadmin credentials' });
    }
  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ error: 'Login server error' });
  }
});

// ⭐ SUPER ADMIN MIDDLEWARE (separate from org users)
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

// ✅ APPLY MIDDLEWARE ONLY TO PROTECTED ROUTES (not login)
router.use('/dashboard', authenticateSuperAdmin);
router.use('/organizations', authenticateSuperAdmin);
router.use('/users', authenticateSuperAdmin);

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

module.exports = router;
