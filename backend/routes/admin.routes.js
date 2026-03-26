const router = require('express').Router();
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const invitationController = require('../controllers/invitation.controller');

// Admin dashboard stats
router.get('/stats', [authenticateToken, requireAdmin], (req, res) => {
  const stats = {};
  
  User.findAll((err, users) => {
    if (err) return res.status(500).json({ error: err.message });
    stats.totalUsers = users.length;
    
    Attendance.findTodaySummary((err, today) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        ...stats,
        todayCheckins: today.total_checkins || 0,
        avgHours: Math.round((today.avg_hours || 0) * 100) / 100
      });
    });
  });
});

// ===== Employee Invitation Routes =====

// Invite employee
router.post('/invite-employee', [authenticateToken, requireAdmin], invitationController.inviteEmployee);

// Get all invitations
router.get('/invitations', [authenticateToken, requireAdmin], invitationController.getInvitations);

// Resend invitation
router.post('/resend-invitation/:invitationId', [authenticateToken, requireAdmin], invitationController.resendInvitation);

module.exports = router;
