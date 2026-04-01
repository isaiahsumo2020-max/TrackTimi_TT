const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/role.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

// 1. PUBLIC ROUTES
router.post('/register-org', authLimiter, authController.registerOrg);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);

// 2. PROTECTED ROUTES
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;