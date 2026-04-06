const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/db');

// MUST match the secret in your server.js
const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. Check for hardcoded SuperAdmin
  if (email === 'superadmin@tracktimi.com' && password === 'superpass123') {
    // Find or use superadmin user from database
    // For now, use a fixed superadmin ID (1) or from env
    const superAdminUserId = process.env.SUPER_ADMIN_USER_ID || 1;
    
    const token = jwt.sign(
      { 
        userId: superAdminUserId,
        role: 'SuperAdmin', 
        email: email, 
        isSuperAdmin: true 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log("✅ SuperAdmin access granted to:", email, "with userId:", superAdminUserId);
    
    return res.json({
      success: true,
      token,
      user: { role: 'SuperAdmin', email, isSuperAdmin: true }
    });
  }

  // 2. Check database for Admin users
  const query = `
    SELECT u.User_ID, u.First_Name, u.SurName, u.Email, u.Password, u.User_Type_ID, 
           o.Org_ID, o.Org_Name
    FROM User u
    LEFT JOIN Organization o ON u.Org_ID = o.Org_ID
    WHERE u.Email = ? AND u.User_Type_ID = 1
  `;

  db.get(query, [email], async (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.Password);
      
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create token for admin user
      const token = jwt.sign(
        {
          userId: user.User_ID,
          email: user.Email,
          name: `${user.First_Name} ${user.SurName}`,
          role: 'Admin',
          orgId: user.Org_ID,
          orgName: user.Org_Name,
          isAdmin: true
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      console.log("✅ Admin access granted to:", email);

      res.json({
        success: true,
        token,
        user: {
          id: user.User_ID,
          role: 'Admin',
          email: user.Email,
          name: `${user.First_Name} ${user.SurName}`,
          orgId: user.Org_ID,
          orgName: user.Org_Name
        }
      });
    } catch (hashErr) {
      console.error('Password verification error:', hashErr);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });
});

module.exports = router;