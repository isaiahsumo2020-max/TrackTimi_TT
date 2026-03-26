const express = require('express');
const db = require('../config/db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 
const router = express.Router();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// POST /api/auth/register-org - FIXED VERSION
router.post('/register-org', async (req, res) => {
  try {
    const { orgName, orgSlug, adminName, adminEmail, adminPassword } = req.body;

    // 1. CHECK if email already exists FIRST
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT User_ID FROM User WHERE Email = ?', [adminEmail], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered. Please use a different email or login.' });
    }


    // 2. CHECK if org slug already exists - FIXED ✅
const existingOrg = await new Promise((resolve, reject) => {
  db.get(`
    SELECT Org_ID FROM Organization 
    WHERE LOWER(Org_Name) = LOWER(?) OR LOWER(Org_Slug) = LOWER(?)
  `, [orgName, orgSlug], (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

if (existingOrg) {
  return res.status(400).json({ 
    error: `Organization "${orgName}" or slug "${orgSlug}" already exists. Please choose a different name.` 
  });
}

    // 3. Create organization
    const orgResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO Organization (Org_Name, Org_Type_ID, Region_ID, Org_Domain, Email, Phone_Num) 
         VALUES (?, 1, 1, ?, ?)`,
        [orgName, adminEmail, ''],
        function(err) {
          if (err) reject(err);
          else resolve({ orgId: this.lastID });
        }
      );
    });

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // 5. Create admin user
    const userResult = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title) 
         VALUES (?, ?, ?, ?, ?, 1, ?)`,
        [
          adminName.split(' ')[0] || 'Admin',
          adminName.split(' ').slice(1).join(' ') || 'Admin',
          adminEmail,
          hashedPassword,
          orgResult.orgId,
          'Organization Admin'
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ userId: this.lastID });
        }
      );
    });

    // 6. Generate JWT
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

    res.json({
      token,
      user: {
        userId: userResult.userId,
        orgId: orgResult.orgId,
        orgSlug,
        orgName,
        name: adminName,
        email: adminEmail,
        role: 'OrgAdmin'
      }
    });

  } catch (error) {
    console.error('Register org error:', error);
    
    // Better error messages
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ 
        error: 'Email or organization name already exists. Please try a different email.' 
      });
    }
    
    res.status(400).json({ error: error.message || 'Organization creation failed' });
  }
});

// GET /api/organizations - List organizations
// 
router.get('/', (req, res) => {
  res.status(501).json({ error: 'Organization list endpoint not implemented yet' });
});

// GET /api/organizations/:id - Get single organization
router.get('/:id', (req, res) => {
  const db = require('../config/db');
  const orgId = req.params.id;
  
  db.get('SELECT * FROM Organization WHERE Org_ID = ?', [orgId], (err, org) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json(org);
  });
});

// PUT /api/org/:id - Update organization settings (Admin only)
router.put('/:id', (req, res) => {
  try {
    const orgId = req.params.id;
    const userId = req.user.userId;
    
    // Verify user is part of this organization and has admin rights
    db.get(`
      SELECT u.User_Type_ID, u.Org_ID FROM User u 
      WHERE u.User_ID = ? AND u.Org_ID = ?
    `, [userId, orgId], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(403).json({ error: 'Unauthorized: You are not part of this organization' });
      
      // Check if user is Admin or Manager (type ID 1 or 2)
      if (user.User_Type_ID !== 1 && user.User_Type_ID !== 2) {
        return res.status(403).json({ error: 'Unauthorized: Only admins can update organization settings' });
      }

      const { orgName, email, phone, address, regionId, orgTypeId, numEmployees, themeColor, logoPath, logoMimeType } = req.body;

      const sql = `
        UPDATE Organization 
        SET Org_Name = ?, Email = ?, Phone_Num = ?, Address = ?, Region_ID = ?, Org_Type_ID = ?, Num_of_Employee = ?, Theme_Color = ?, Logo_Path = ?, Logo_MIME_Type = ?, Updated_at = CURRENT_TIMESTAMP
        WHERE Org_ID = ?
      `;

      db.run(sql, [
        orgName, email, phone, address, regionId, orgTypeId, numEmployees, 
        themeColor || '#ff6600', logoPath || null, logoMimeType || 'image/png', orgId
      ], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Organization not found' });
        res.json({ message: '✅ Organization settings updated successfully', Org_ID: orgId });
      });
    });
  } catch (error) {
    console.error('Organization update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/org/:id/settings - Get organization settings (for dashboard)
router.get('/:id/settings', (req, res) => {
  try {
    const orgId = req.params.id;
    const userId = req.user?.userId;
    
    console.log('GET /org/:id/settings - orgId:', orgId, 'userId:', userId, 'req.user:', req.user)
    
    // Just fetch the organization directly - the user is already authenticated by global middleware
    db.get('SELECT * FROM Organization WHERE Org_ID = ?', [orgId], (err, org) => {
      if (err) {
        console.error('Error fetching org:', err)
        return res.status(500).json({ error: err.message })
      }
      if (!org) {
        console.log('Organization not found:', orgId)
        return res.status(404).json({ error: 'Organization not found' })
      }
      console.log('Org settings retrieved:', org.Org_Name)
      res.json(org);
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET /api/org/shifts/my - User's shifts only
router.get('/shifts/my', (req, res) => {
  db.all(`
    SELECT s.*, d.Depart_Name 
    FROM Shift s 
    JOIN Department d ON s.Dep_ID = d.Dep_ID 
    WHERE s.User_ID = ? 
    ORDER BY s.Start_Time ASC
  `, [req.user.userId], (err, shifts) => {
    if (err) return res.status(500).json({ error: 'Database error' })
    res.json(shifts)
  })
})

// GET /api/org/checkins/my - User's checkins only
router.get('/checkins/my', (req, res) => {
  db.all(`
    SELECT a.*, u.First_Name, u.SurName, d.Depart_Name
    FROM Attendance a 
    JOIN User u ON a.User_ID = u.User_ID
    JOIN Department d ON u.Depart_ID = d.Dep_ID
    WHERE a.User_ID = ?
    ORDER BY a.Check_in_time DESC 
    LIMIT 10
  `, [req.user.userId], (err, checkins) => {
    if (err) return res.status(500).json({ error: 'Database error' })
    res.json(checkins)
  })
})


// GET /api/org/departments/my - User's department
router.get('/departments/my', (req, res) => {
  db.get(`
    SELECT d.* FROM Department d 
    JOIN User u ON u.Depart_ID = d.Dep_ID 
    WHERE u.User_ID = ?
  `, [req.user.userId], (err, dept) => {
    if (err) return res.status(500).json({ error: 'Database error' })
    res.json(dept ? [dept] : [])
  })
})

// ⭐ POST /api/org/users - Create new user (OrgAdmin only)
router.post('/users', (req, res) => {
  const { firstName, surName, email, departId, userTypeId, roleId } = req.body;
  const { generateUniqueEmployeeId } = require('../utils/employeeId');

  // Validate required fields
  if (!firstName || !surName || !email) {
    return res.status(400).json({ error: 'firstName, surName, and email are required' });
  }

  // Generate unique Employee ID
  generateUniqueEmployeeId((err, employeeId) => {
    if (err) {
      console.error('Employee ID generation error:', err);
      return res.status(500).json({ error: 'Failed to generate Employee ID' });
    }

    // Prepare user data
    const userData = {
      firstName,
      surName,
      email: email.toLowerCase(),
      orgId: req.user.Org_ID, // Use org from JWT token
      departId: departId || null,
      userTypeId: userTypeId || 3, // Default to Staff
      roleId: roleId || null,
      phone: req.body.phone || null,
      jobTitle: req.body.jobTitle || null
    };

    // Insert into database with Employee ID
    const sql = `
      INSERT INTO User (First_Name, SurName, Email, Org_ID, Role_ID, User_Type_ID, Employee_ID, Phone_Num, Job_Title, Depart_ID, Is_Active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(sql, [
      userData.firstName,
      userData.surName,
      userData.email,
      userData.orgId,
      userData.roleId,
      userData.userTypeId,
      employeeId,
      userData.phone,
      userData.jobTitle,
      userData.departId
    ], function(err) {
      if (err) {
        console.error('Create user error:', err);
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Failed to create user' });
      }

      res.status(201).json({
        message: 'User created successfully',
        User_ID: this.lastID,
        Employee_ID: employeeId,
        ...userData
      });
    });
  });
});

// GET /api/org/branding - Get organization branding (logo and color)
router.get('/branding', (req, res) => {
  try {
    const orgId = req.user.orgId;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID not found in token' });
    }

    db.get(
      `SELECT Org_ID, Org_Name, Theme_Color, Logo_Path, Logo_MIME_Type FROM Organization WHERE Org_ID = ?`,
      [orgId],
      (err, org) => {
        if (err) {
          console.error('Error fetching branding:', err);
          return res.status(500).json({ error: 'Failed to fetch branding' });
        }

        if (!org) {
          return res.status(404).json({ error: 'Organization not found' });
        }

        res.json({
          orgId: org.Org_ID,
          orgName: org.Org_Name,
          themeColor: org.Theme_Color || '#ff6600',
          logo: org.Logo_Path,
          logoMimeType: org.Logo_MIME_Type || 'image/png'
        });
      }
    );
  } catch (error) {
    console.error('Branding fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/org/branding - Update organization branding
router.put('/branding', (req, res) => {
  try {
    const orgId = req.user.orgId;
    const { themeColor, logo, logoMimeType } = req.body;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID not found in token' });
    }

    // Validate color format
    if (themeColor && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(themeColor)) {
      return res.status(400).json({ error: 'Invalid color format. Use hex color (e.g., #FF6B6B)' });
    }

    db.run(
      `UPDATE Organization SET Theme_Color = ?, Logo_Path = ?, Logo_MIME_Type = ?, Updated_at = CURRENT_TIMESTAMP WHERE Org_ID = ?`,
      [
        themeColor || '#ff6600',
        logo || null,
        logoMimeType || 'image/png',
        orgId
      ],
      function(err) {
        if (err) {
          console.error('Error updating branding:', err);
          return res.status(500).json({ error: 'Failed to update branding' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Organization not found' });
        }

        res.json({
          message: '✅ Branding updated successfully',
          themeColor: themeColor || '#ff6600',
          logo: logo || null,
          logoMimeType: logoMimeType || 'image/png'
        });
      }
    );
  } catch (error) {
    console.error('Branding update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
