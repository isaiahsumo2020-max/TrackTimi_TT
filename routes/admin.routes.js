const router = require('express').Router();
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Notification = require('../models/Notification');
const invitationController = require('../controllers/invitation.controller');
const db = require('../config/db');

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

// ===== ADMIN NOTIFICATION Routes =====

// Get admin notifications
router.get('/notifications', [authenticateToken, requireAdmin], (req, res) => {
  try {
    const { userId, orgId } = req.user;
    const limit = parseInt(req.query.limit) || 50;

    const sql = `
      SELECT Notify_ID, Title, Message, Type, Category, Is_Read, Created_at, Read_at, Action_URL
      FROM Notification
      WHERE User_ID = ? AND Org_ID = ?
      ORDER BY Is_Read ASC, Created_at DESC
      LIMIT ?
    `;

    db.all(sql, [userId, orgId, limit], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch notifications' });
      res.json(rows || []);
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get unread notification count
router.get('/notifications/unread/count', [authenticateToken, requireAdmin], (req, res) => {
  try {
    const { userId, orgId } = req.user;

    const sql = `
      SELECT COUNT(*) as unread_count FROM Notification
      WHERE User_ID = ? AND Org_ID = ? AND Is_Read = 0
    `;

    db.get(sql, [userId, orgId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch unread count' });
      res.json({ unreadCount: row?.unread_count || 0 });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mark notification as read
router.put('/notifications/:notifyId/read', [authenticateToken, requireAdmin], (req, res) => {
  try {
    const { notifyId } = req.params;
    const { userId } = req.user;

    const sql = `
      UPDATE Notification
      SET Is_Read = 1, Read_at = datetime('now', 'localtime')
      WHERE Notify_ID = ? AND User_ID = ?
    `;

    db.run(sql, [notifyId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to mark as read' });
      if (this.changes === 0) return res.status(404).json({ error: 'Notification not found' });
      res.json({ success: true, message: 'Notification marked as read' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', [authenticateToken, requireAdmin], (req, res) => {
  try {
    const { userId, orgId } = req.user;

    const sql = `
      UPDATE Notification
      SET Is_Read = 1, Read_at = datetime('now', 'localtime')
      WHERE User_ID = ? AND Org_ID = ? AND Is_Read = 0
    `;

    db.run(sql, [userId, orgId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to mark notifications as read' });
      res.json({ success: true, message: 'All notifications marked as read' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete notification
router.delete('/notifications/:notifyId', [authenticateToken, requireAdmin], (req, res) => {
  try {
    const { notifyId } = req.params;
    const { userId } = req.user;

    const sql = `DELETE FROM Notification WHERE Notify_ID = ? AND User_ID = ?`;

    db.run(sql, [notifyId, userId], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete notification' });
      if (this.changes === 0) return res.status(404).json({ error: 'Notification not found' });
      res.json({ success: true, message: 'Notification deleted' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
