const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// POST /api/superadmin/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  db.get('SELECT * FROM Super_Admin WHERE Email = ?', [email], (err, superAdmin) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!superAdmin) return res.status(401).json({ error: 'Invalid credentials' });

    bcrypt.compare(password, superAdmin.Password, (err, match) => {
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { 
          superAdminId: superAdmin.Super_Admin_ID,
          email: superAdmin.Email,
          role: 'SuperAdmin'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        token,
        user: {
          id: superAdmin.Super_Admin_ID,
          email: superAdmin.Email,
          fullName: superAdmin.Full_Name,
          role: 'SuperAdmin'
        }
      });
    });
  });
});

module.exports = router;
