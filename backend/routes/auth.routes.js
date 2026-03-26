const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

// POST /api/auth/register-org
router.post('/register-org', async (req, res) => {
  try {
    const { orgName, orgDomain, orgSlug, adminName, adminEmail, adminPassword, theme, logo, logoType } = req.body;

    // Generate a random color if not provided
    const generateDefaultColor = () => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
      return colors[Math.floor(Math.random() * colors.length)];
    };

    const themeColor = theme?.primary || generateDefaultColor();

    // 1. Create organization
    const orgResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Organization (Org_Name, Org_Domain, Org_Type_ID, Region_ID, Email, Phone_Num, Theme_Color, Logo_Path, Logo_MIME_Type) 
         VALUES (?, ?, 1, 1, ?, ?, ?, ?, ?)`,
        [orgName, orgDomain, adminEmail, '', themeColor, logo || null, logoType || 'image/png'],
        function(err) {
          if (err) reject(err);
          else resolve({ orgId: this.lastID });
        }
      );
    });

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 3. Create admin user
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

    // 4. Generate JWT with consistent slug format
    const consistentSlug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);
    const token = jwt.sign(
      { 
        userId: userResult.userId, 
        orgId: orgResult.orgId, 
        orgSlug: consistentSlug,
        role: 'OrgAdmin',
        email: adminEmail 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Get org details
    const orgDetails = await new Promise((resolve, reject) => {
      db.get(
        `SELECT Org_ID, Org_Name, Theme_Color, Logo_Path FROM Organization WHERE Org_ID = ?`,
        [orgResult.orgId],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    res.json({
      token,
      user: {
        userId: userResult.userId,
        orgId: orgResult.orgId,
        orgSlug: consistentSlug,
        orgName: orgDetails.Org_Name,
        name: adminName,
        email: adminEmail,
        role: 'OrgAdmin',
        themeColor: orgDetails.Theme_Color,
        logo: orgDetails.Logo_Path
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

    // Generate consistent slug from organization name (matches frontend)
    const orgSlug = user.Org_Name.toLowerCase().replace(/\s+/g, '-').slice(0, 50);
    
    const token = jwt.sign(
      {
        userId: user.User_ID,
        orgId: user.Org_ID,
        orgSlug: orgSlug,
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
        orgSlug: orgSlug,
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

// ===== Employee Invitation Routes =====
const invitationController = require('../controllers/invitation.controller');

// Activate employee account with invitation token
router.post('/activate-invitation', invitationController.activateInvitation);

// Get invitation details for activation page
router.get('/invitation/:token', invitationController.getInvitationDetails);

// POST /api/auth/domain-login - Login via organization domain
router.post('/domain-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if organization was detected from domain
    if (!req.organization) {
      return res.status(400).json({ error: 'Invalid organization domain' });
    }

    // Find user by email within this organization
    const user = await new Promise((resolve, reject) => {
      db.get(
        `SELECT u.User_ID, u.First_Name, u.SurName, u.Email, u.Password,
                u.Org_ID, u.User_Type_ID, u.Job_Title,
                o.Org_Name, o.Org_Domain
         FROM User u
         JOIN Organization o ON u.Org_ID = o.Org_ID
         WHERE u.Email = ? AND u.Org_ID = ? AND u.Is_Active = 1`,
        [email, req.organization.id],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials for this organization' });
    }

    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate consistent slug from organization name
    const orgSlug = user.Org_Name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50);

    const token = jwt.sign(
      {
        userId: user.User_ID,
        orgId: user.Org_ID,
        orgSlug: orgSlug,
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
        orgSlug: orgSlug,
        orgName: user.Org_Name,
        orgDomain: user.Org_Domain,
        name: `${user.First_Name} ${user.SurName}`,
        email: user.Email,
        role: user.User_Type_ID === 1 ? 'OrgAdmin' : 'Staff'
      }
    });

  } catch (error) {
    console.error('Domain login error:', error);
    res.status(400).json({ error: 'Login failed' });
  }
});
