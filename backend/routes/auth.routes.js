const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

// POST /api/auth/register-org
router.post('/register-org', async (req, res) => {
  try {
    const { orgName, orgSlug, adminName, adminEmail, adminPassword } = req.body;

    // 1. Create organization
    const orgResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Organization (Org_Name, Org_Type_ID, Region_ID, Email, Phone_Num) 
         VALUES (?, 1, 1, ?, ?)`,
        [orgName, adminEmail, ''],
        function(err) {
          if (err) reject(err);
          else resolve({ orgId: this.lastID });
        }
      );
    });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3. Create admin user - FIXED
    const userResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adminName.split(' ')[0] || 'Admin',
          adminName.split(' ').slice(1).join(' ') || 'User',
          adminEmail,
          hashedPassword,
          orgResult.orgId,
          1,  // Admin User_Type_ID
          'Org Admin'
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ userId: this.lastID });
        }
      );
    });

    // 4. Generate JWT
    const token = jwt.sign(
      { 
        userId: userResult.userId, 
        orgId: orgResult.orgId, 
        orgSlug,
        role: 'OrgAdmin',
        email: adminEmail 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Get org details
    const orgDetails = await new Promise((resolve, reject) => {
      db.get(
        `SELECT Org_ID, Org_Name FROM Organization WHERE Org_ID = ?`,
        [orgResult.orgId],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    res.json({
      token,
      user: {
        userId: userResult.userId,
        orgId: orgResult.orgId,
        orgSlug,
        orgName: orgDetails.Org_Name,
        name: adminName,
        email: adminEmail,
        role: 'OrgAdmin'
      }
    });

  } catch (error) {
    console.error('Register org error:', error);
    res.status(400).json({ error: error.message || 'Organization creation failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT u.User_ID, u.First_Name, u.SurName, u.Email, u.Password, 
                u.Org_ID, u.User_Type_ID, u.Job_Title,
                o.Org_Name 
         FROM User u 
         JOIN Organization o ON u.Org_ID = o.Org_ID 
         WHERE u.Email = ?`,
        [email],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.User_ID,
        orgId: user.Org_ID,
        orgSlug: user.Email.split('@')[0],
        role: user.User_Type_ID === 1 ? 'OrgAdmin' : 'Staff',
        email: user.Email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        userId: user.User_ID,
        orgId: user.Org_ID,
        orgSlug: user.Email.split('@')[0],
        orgName: user.Org_Name,
        name: `${user.First_Name} ${user.SurName}`,
        email: user.Email,
        role: user.User_Type_ID === 1 ? 'OrgAdmin' : 'Staff'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ error: 'Login failed' });
  }
});

module.exports = router;  // ← CRITICAL: ADD THIS LINE
