const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/role.middleware');

// GET all notifications for current user
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;
  const limit = req.query.limit || 50;
  
  const sql = `
    SELECT Notify_ID, Title, Message, Type, Category, Is_Read, Created_at, Read_at, Action_URL
    FROM Notification
    WHERE User_ID = ?
    ORDER BY Is_Read ASC, Created_at DESC
    LIMIT ?
  `;
  
  db.all(sql, [userId, parseInt(limit)], (err, notifications) => {
    if (err) {
      console.error('❌ Failed to fetch notifications:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    
    // Get unread count
    const countSql = `SELECT COUNT(*) as unread FROM Notification WHERE User_ID = ? AND Is_Read = 0`;
    db.get(countSql, [userId], (countErr, countRow) => {
      const unreadCount = !countErr ? countRow.unread : 0;
      res.json({ notifications, unreadCount });
    });
  });
});

// GET unread notification count
router.get('/unread/count', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;
  
  const sql = `
    SELECT COUNT(*) as unreadCount FROM Notification
    WHERE User_ID = ? AND Is_Read = 0
  `;
  
  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error('❌ Failed to get unread count:', err);
      return res.status(500).json({ error: 'Failed to get unread count' });
    }
    res.json({ unreadCount: row.unreadCount || 0 });
  });
});

// GET notifications by category
router.get('/category/:category', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;
  const category = req.params.category;
  
  const sql = `
    SELECT * FROM Notification 
    WHERE User_ID = ? AND Category = ?
    ORDER BY Is_Read ASC, Created_at DESC
  `;
  
  db.all(sql, [userId, category], (err, notifications) => {
    if (err) {
      console.error('❌ Failed to fetch notifications by category:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json({ notifications });
  });
});

// PUT mark notification as read
router.put('/:notifyId/read', authenticateToken, (req, res) => {
  const { notifyId } = req.params;
  const userId = req.user.User_ID;
  
  const sql = `
    UPDATE Notification 
    SET Is_Read = 1, Read_at = datetime('now', 'localtime')
    WHERE Notify_ID = ? AND User_ID = ?
  `;
  
  db.run(sql, [notifyId, userId], function(err) {
    if (err) {
      console.error('❌ Failed to mark as read:', err);
      return res.status(500).json({ error: 'Failed to update notification' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, message: 'Notification marked as read' });
  });
});

// PUT mark all notifications as read for user
router.put('/mark-all-read', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;
  
  const sql = `
    UPDATE Notification 
    SET Is_Read = 1, Read_at = datetime('now', 'localtime')
    WHERE User_ID = ? AND Is_Read = 0
  `;
  
  db.run(sql, [userId], function(err) {
    if (err) {
      console.error('❌ Failed to mark all as read:', err);
      return res.status(500).json({ error: 'Failed to update notifications' });
    }
    res.json({ success: true, message: 'All notifications marked as read', updated: this.changes });
  });
});

// DELETE notification
router.delete('/:notifyId', authenticateToken, (req, res) => {
  const { notifyId } = req.params;
  const userId = req.user.User_ID;
  
  const sql = `DELETE FROM Notification WHERE Notify_ID = ? AND User_ID = ?`;
  
  db.run(sql, [notifyId, userId], function(err) {
    if (err) {
      console.error('❌ Failed to delete notification:', err);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted' });
  });
});

// DELETE multiple notifications
router.delete('/', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;
  const { notifyIds } = req.body;
  
  if (!notifyIds || !Array.isArray(notifyIds) || notifyIds.length === 0) {
    return res.status(400).json({ error: 'notifyIds array is required' });
  }
  
  const placeholders = notifyIds.map(() => '?').join(',');
  const sql = `DELETE FROM Notification WHERE Notify_ID IN (${placeholders}) AND User_ID = ?`;
  
  db.run(sql, [...notifyIds, userId], function(err) {
    if (err) {
      console.error('❌ Failed to delete notifications:', err);
      return res.status(500).json({ error: 'Failed to delete notifications' });
    }
    res.json({ success: true, message: `Deleted ${this.changes} notifications` });
  });
});

module.exports = router;
