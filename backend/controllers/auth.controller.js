const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { generateUniqueEmployeeId } = require('../utils/employeeId');

const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

// 1. REGISTER ORGANIZATION & ADMIN (Onboarding)
exports.registerOrg = async (req, res) => {
  try {
    const { orgName, orgSlug, adminName, adminEmail, adminPassword } = req.body;

    if (!orgName || !orgSlug || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await new Promise((resolve) => {
      db.get('SELECT Email FROM User WHERE Email = ?', [adminEmail.toLowerCase()], (err, row) => resolve(row));
    });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Create Organization
    const orgId = await new Promise((resolve, reject) => {
      db.run(`INSERT INTO Organization (Org_Name, Org_Domain, Org_Type_ID, Region_ID, Email) VALUES (?, ?, 1, 1, ?)`,
        [orgName, orgSlug.toLowerCase(), adminEmail.toLowerCase()], function(err) { 
          if (err) reject(err); else resolve(this.lastID); 
        });
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const names = adminName.split(' ');
    
    generateUniqueEmployeeId(async (err, employeeId) => {
      const sql = `INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title, Employee_ID, Is_Active) 
                   VALUES (?, ?, ?, ?, ?, 1, 'System Admin', ?, 1)`;

      db.run(sql, [names[0], names.slice(1).join(' ') || 'Admin', adminEmail.toLowerCase(), hashedPassword, orgId, employeeId], function(err) {
        if (err) return res.status(500).json({ error: 'Admin creation failed' });

        const token = jwt.sign(
          { 
            userId: this.lastID, 
            orgId: orgId, 
            userTypeId: 1, 
            role: 'Admin', 
            orgSlug: orgSlug.toLowerCase() 
          },
          JWT_SECRET, { expiresIn: '12h' }
        );

        res.status(201).json({ 
          token, 
          user: { 
            userId: this.lastID, 
            orgId: orgId, 
            orgName: orgName, // Return name for sidebar
            orgSlug: orgSlug.toLowerCase(), 
            role: 'Admin',
            firstName: names[0]
          } 
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Onboarding failed' });
  }
};

// 2. UNIVERSAL LOGIN (Now with Permanent Branding Support)
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // CRITICAL: We JOIN with Organization to get the most updated Org_Name and Logo_Path
  const sql = `
    SELECT u.*, o.Org_Name, o.Org_Domain, o.Logo_Path, o.Logo_MIME_Type, o.Theme_Color
    FROM User u 
    LEFT JOIN Organization o ON u.Org_ID = o.Org_ID 
    WHERE u.Email = ? AND u.Is_Active = 1
  `;

  db.get(sql, [email.toLowerCase()], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.Password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Standardized JWT Payload
    const token = jwt.sign(
      { 
        userId: user.User_ID, 
        orgId: user.Org_ID,
        orgSlug: user.Org_Domain,
        userTypeId: user.User_Type_ID, 
        role: user.User_Type_ID === 1 ? 'Admin' : 'Staff' 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return everything needed for the Sidebar and Dashboard
    res.json({
      token,
      user: {
        userId: user.User_ID,
        firstName: user.First_Name,
        surName: user.SurName,
        orgId: user.Org_ID,
        orgName: user.Org_Name,     // <--- Fetches updated name from settings
        orgSlug: user.Org_Domain,   // <--- Required for routing
        orgLogo: user.Logo_Path,    // <--- Fetches updated logo
        role: user.User_Type_ID === 1 ? 'Admin' : 'Staff',
        themeColor: user.Theme_Color
      }
    });
  });
};

// 3. GET PROFILE
exports.getProfile = (req, res) => {
  res.json({ success: true, user: req.user });
};

// 4. REFRESH TOKEN
exports.refreshToken = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token expired' });
    const { iat, exp, ...payload } = decoded;
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token: newToken });
  });
};