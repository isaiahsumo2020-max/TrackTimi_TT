const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = 'tracktimi_secret_2026'; // Move to .env later

exports.register = (req, res) => {
  const { firstName, surName, email, password, userTypeId = 2, orgId } = req.body; // 2 = Staff

  // Basic validation
  if (!firstName || !surName || !email || !password) {
    return res.status(400).json({ error: 'firstName, surName, email, and password required' });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Password hash error:', err);
      return res.status(500).json({ error: 'Password encryption failed' });
    }

    // Create user with password
    const sql = `
      INSERT INTO User (First_Name, SurName, Email, Password, User_Type_ID, Org_ID)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [firstName, surName, email.toLowerCase(), hash, userTypeId, orgId || null], 
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(409).json({ error: 'Email already registered' });
          }
          console.error('Register DB error:', err);
          return res.status(500).json({ error: 'Registration failed' });
        }

        // Generate JWT token
        const token = jwt.sign(
          { 
            User_ID: this.lastID, 
            firstName, 
            surName, 
            email: email.toLowerCase(),
            userTypeId 
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: '✅ User registered successfully',
          token,
          user: {
            User_ID: this.lastID,
            firstName,
            surName,
            email: email.toLowerCase(),
            userTypeId
          }
        });
      }
    );
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Find user by email
  db.get('SELECT * FROM User WHERE Email = ? AND Password IS NOT NULL', 
    [email.toLowerCase()], 
    (err, user) => {
      if (err) {
        console.error('Login DB error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      bcrypt.compare(password, user.Password, (err, match) => {
        if (err || !match) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            User_ID: user.User_ID,
            firstName: user.First_Name,
            surName: user.SurName,
            email: user.Email,
            userTypeId: user.User_Type_ID || 2
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          message: '✅ Login successful',
          token,
          user: {
            User_ID: user.User_ID,
            firstName: user.First_Name,
            surName: user.SurName,
            email: user.Email,
            userTypeId: user.User_Type_ID || 2
          }
        });
      });
    }
  );
};

exports.getProfile = (req, res) => {
  // req.user comes from auth middleware
  res.json({
    message: '✅ Profile fetched',
    user: req.user
  });
};

exports.refreshToken = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token expired or invalid' });
    }

    // Generate new token
    const newToken = jwt.sign(decoded, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      message: 'Token refreshed',
      token: newToken 
    });
  });
};
