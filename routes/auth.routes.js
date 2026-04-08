const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/role.middleware');
const { authLimiter } = require('../middleware/rateLimiter');

// 1. PUBLIC ROUTES
router.post('/register-org', authLimiter, authController.registerOrg);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/activate-invitation', authLimiter, authController.activateInvitation);

// 2. EMAIL VERIFICATION ROUTES (Public)
router.get('/verify-email', authController.verifyEmailByLink);
router.post('/verify-code', authLimiter, authController.verifyEmailByCode);
router.post('/resend-verification', authLimiter, authController.resendVerification);

// 3. PASSWORD RESET ROUTES (Public)
router.post('/request-password-reset', authLimiter, authController.requestPasswordReset);
router.post('/reset-password', authLimiter, authController.resetPassword);

// 4. PROTECTED ROUTES
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/invite', authenticateToken, authController.inviteEmployee);

module.exports = router;