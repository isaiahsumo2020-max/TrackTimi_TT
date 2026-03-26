const jwt = require('jsonwebtoken');

const JWT_SECRET = 'tracktimi_secret_2026'; // Move to .env later 
const JWT_CONFIG = { expiresIn: '24h' };

const jwtUtils = {
  // Generate token
  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, JWT_CONFIG);
  },

  // Verify token
  verifyToken: (token) => {
    return jwt.verify(token, JWT_SECRET);
  },

  // Decode token (no verification)
  decodeToken: (token) => {
    return jwt.decode(token);
  },

  // Check if token expired
  isTokenExpired: (token) => {
    try {
      jwt.verify(token, JWT_SECRET);
      return false;
    } catch (err) {
      return err.name === 'TokenExpiredError';
    }
  }
};

module.exports = jwtUtils;
