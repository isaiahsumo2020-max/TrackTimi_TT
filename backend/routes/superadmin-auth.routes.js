const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// MUST match the secret in your server.js
const JWT_SECRET = process.env.JWT_SECRET || 'tracktimi_secret_2026';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // We check for specific "God-mode" credentials
  if (email === 'superadmin@tracktimi.com' && password === 'superpass123') {
    
    // Create a token that says "role: SuperAdmin"
    const token = jwt.sign(
      { role: 'SuperAdmin', email: email }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log("✅ SuperAdmin access granted to:", email);
    
    res.json({
      success: true,
      token, // This is the key to the whole system
      user: { role: 'SuperAdmin', email }
    });
  } else {
    res.status(401).json({ error: 'Invalid Super Admin credentials' });
  }
});

module.exports = router;