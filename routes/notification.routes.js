const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/role.middleware');

/**
 * GET /api/notifications
 * Fetch all notifications for current user with optional filtering
 * Query params: limit=50, category=, type=, isRead=
 */
router.get('/', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;
  const limit = parseInt(req.query.limit) || 50;
  const category = req.query.category;
  const type = req.query.type;
  const isRead = req.query.isRead;

  let sql = `
    SELECT Notify_ID, Title, Message, Type, Category, Is_Read, Created_at, Read_at, Action_URL
    FROM Notification
    WHERE User_ID = ?
  `;
  const params = [userId];

  if (category) {
    sql += ' AND Category = ?';
    params.push(category);
  }
  if (type) {
    sql += ' AND Type = ?';
    params.push(type);
  }
  if (isRead !== undefined) {
    sql += ' AND Is_Read = ?';
    params.push(isRead === 'true' ? 1 : 0);
  }

  sql += ' ORDER BY Is_Read ASC, Created_at DESC LIMIT ?';
  params.push(limit);

  db.all(sql, params, (err, notifications) => {
    if (err) {
      console.error('❌ Failed to fetch notifications:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }

    // Get unread count
    const countSql = `SELECT COUNT(*) as unreadCount FROM Notification WHERE User_ID = ? AND Is_Read = 0`;
    db.get(countSql, [userId], (countErr, countRow) => {
      const unreadCount = !countErr ? countRow.unreadCount : 0;
      res.json({
        notifications: notifications || [],
        unreadCount,
        total: notifications ? notifications.length : 0
      });
    });
  });
});

/**
 * GET /api/notifications/unread/count
 * Get unread notification count
 */
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
    res.json({ unreadCount: row?.unreadCount || 0 });
  });
});

/**
 * GET /api/notifications/categories
 * Get notification categories with count
 */
router.get('/categories', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;

  const sql = `
    SELECT Category, COUNT(*) as count, SUM(CASE WHEN Is_Read = 0 THEN 1 ELSE 0 END) as unread
    FROM Notification
    WHERE User_ID = ?
    GROUP BY Category
    ORDER BY unread DESC, count DESC
  `;

  db.all(sql, [userId], (err, categories) => {
    if (err) {
      console.error('❌ Failed to get categories:', err);
      return res.status(500).json({ error: 'Failed to get categories' });
    }
    res.json({ categories: categories || [] });
  });
});

/**
 * GET /api/notifications/category/:category
 * Fetch notifications by category
 */
router.get('/category/:category', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;
  const category = req.params.category;
  const limit = parseInt(req.query.limit) || 50;

  const sql = `
    SELECT * FROM Notification
    WHERE User_ID = ? AND Category = ?
    ORDER BY Is_Read ASC, Created_at DESC
    LIMIT ?
  `;

  db.all(sql, [userId, category, limit], (err, notifications) => {
    if (err) {
      console.error('❌ Failed to fetch notifications by category:', err);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
    res.json({ notifications: notifications || [] });
  });
});

/**
 * PUT /api/notifications/:notifyId/read
 * Mark single notification as read
 */
router.put('/:notifyId/read', authenticateToken, (req, res) => {
  const { notifyId } = req.params;
  const userId = req.user.User_ID;

  const sql = `
    UPDATE Notification
    SET Is_Read = 1, Read_at = datetime('now')
    WHERE Notify_ID = ? AND User_ID = ?
  `;

  db.run(sql, [notifyId, userId], function(err) {
    if (err) {
      console.error('❌ Failed to mark as read:', err);
      return res.status(500).json({ error: 'Failed to update notification' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification marked as read' });
  });
});

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for user
 */
router.put('/mark-all-read', authenticateToken, (req, res) => {
  const userId = req.user.User_ID;

  const sql = `
    UPDATE Notification
    SET Is_Read = 1, Read_at = datetime('now')
    WHERE User_ID = ? AND Is_Read = 0
  `;

  db.run(sql, [userId], function(err) {
    if (err) {
      console.error('❌ Failed to mark all as read:', err);
      return res.status(500).json({ error: 'Failed to update notifications' });
    }
    res.json({
      success: true,
      message: 'All notifications marked as read',
      updated: this.changes
    });
  });
});

/**
 * DELETE /api/notifications/:notifyId
 * Delete single notification
 */
router.delete('/:notifyId', authenticateToken, (req, res) => {
  const { notifyId } = req.params;
  const userId = req.user.User_ID;

  const sql = `DELETE FROM Notification WHERE Notify_ID = ? AND User_ID = ?`;

  db.run(sql, [notifyId, userId], function(err) {
    if (err) {
      console.error('❌ Failed to delete notification:', err);
      return res.status(500).json({ error: 'Failed to delete notification' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification deleted' });
  });
});

/**
 * DELETE /api/notifications
 * Delete multiple notifications
 */
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
    res.json({
      success: true,
      message: `Deleted ${this.changes} notifications`
    });
  });
});

/**
 * POST /api/notifications/test (Admin only)
 * Send test notification - useful for testing
 */
router.post('/test', authenticateToken, requireAdmin, async (req, res) => {
  const { title, message, category = 'test', type = 'info' } = req.body;
  const userId = req.user.User_ID;

  if (!title || !message) {
    return res.status(400).json({ error: 'Title and message are required' });
  }

  const sql = `
    INSERT INTO Notification (User_ID, Title, Message, Type, Category, Is_Read, Created_at)
    VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
  `;

  db.run(sql, [userId, title, message, type, category], function(err) {
    if (err) {
      console.error('❌ Failed to create test notification:', err);
      return res.status(500).json({ error: 'Failed to create notification' });
    }

    res.status(201).json({
      success: true,
      Notify_ID: this.lastID,
      message: 'Test notification created'
    });
  });
});

module.exports = router;
