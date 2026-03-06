const router = require('express').Router();
const organizationController = require('../controllers/org.controller');

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

    // 2. CHECK if org slug already exists
    const existingOrg = await new Promise((resolve, reject) => {
      db.get('SELECT Org_ID FROM Organization WHERE Org_Name = ?', [orgName], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingOrg) {
      return res.status(400).json({ error: 'Organization name already exists. Please choose a different name.' });
    }

    // 3. Create organization
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
router.get('/', organizationController.getOrganizations);

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

module.exports = router;
