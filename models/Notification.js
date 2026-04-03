const db = require('../config/db');

const Notification = {
  // CREATE notification
  create: (notifData, callback) => {
    const sql = `
      INSERT INTO Notification (User_ID, Org_ID, Title, Message, Type, Category, Action_URL, Related_Record_ID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      notifData.userId,
      notifData.orgId,
      notifData.title,
      notifData.message,
      notifData.type || 'info',
      notifData.category || 'general',
      notifData.actionUrl || null,
      notifData.relatedRecordId || null
    ];
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Notification.create DB error:', err.message);
        return callback(err);
      }
      callback(null, { Notify_ID: this.lastID, ...notifData });
    });
  },

  // READ all notifications for a user (unread first)
  findByUserId: (userId, limit = 50, callback) => {
    const sql = `
      SELECT * FROM Notification 
      WHERE User_ID = ?
      ORDER BY Is_Read ASC, Created_at DESC
      LIMIT ?
    `;
    db.all(sql, [userId, limit], callback);
  },

  // READ unread notification count
  getUnreadCount: (userId, callback) => {
    const sql = `
      SELECT COUNT(*) as unread_count FROM Notification 
      WHERE User_ID = ? AND Is_Read = 0
    `;
    db.get(sql, [userId], callback);
  },

  // READ notifications by category
  findByCategory: (userId, category, callback) => {
    const sql = `
      SELECT * FROM Notification 
      WHERE User_ID = ? AND Category = ?
      ORDER BY Is_Read ASC, Created_at DESC
    `;
    db.all(sql, [userId, category], callback);
  },

  // MARK as read
  markAsRead: (notifyId, callback) => {
    const sql = `
      UPDATE Notification 
      SET Is_Read = 1, Read_at = datetime('now', 'localtime')
      WHERE Notify_ID = ?
    `;
    db.run(sql, [notifyId], callback);
  },

  // MARK all as read for user
  markAllAsRead: (userId, callback) => {
    const sql = `
      UPDATE Notification 
      SET Is_Read = 1, Read_at = datetime('now', 'localtime')
      WHERE User_ID = ? AND Is_Read = 0
    `;
    db.run(sql, [userId], callback);
  },

  // DELETE notification
  delete: (notifyId, callback) => {
    const sql = `DELETE FROM Notification WHERE Notify_ID = ?`;
    db.run(sql, [notifyId], callback);
  },

  // DELETE old notifications (cleanup)
  deleteOlderThan: (days, callback) => {
    const sql = `
      DELETE FROM Notification 
      WHERE Created_at < datetime('now', '-' || ? || ' days')
      AND Is_Read = 1
    `;
    db.run(sql, [days], callback);
  }
};

module.exports = Notification;
