const db = require('../config/db');

const Feedback = {
  // CREATE feedback
  create: (feedbackData, callback) => {
    const sql = `
      INSERT INTO Feedback (User_ID, Org_ID, Title, Message, Category, Rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      feedbackData.userId,
      feedbackData.orgId,
      feedbackData.title,
      feedbackData.message,
      feedbackData.category || 'general',
      feedbackData.rating || 5
    ];
    
    console.log('📝 Creating feedback with params:', { userId: feedbackData.userId, orgId: feedbackData.orgId, title: feedbackData.title });
    
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Feedback.create DB error:', err.message, 'SQL:', sql, 'Params:', params);
        return callback(err);
      }
      console.log('✅ Feedback created - ID:', this.lastID);
      callback(null, { Feedback_ID: this.lastID, ...feedbackData });
    });
  },

  // READ all feedback for organization (admin view)
  findByOrgId: (orgId, limit = 50, callback) => {
    const sql = `
      SELECT 
        f.*,
        u.First_Name,
        u.SurName,
        u.Email
      FROM Feedback f
      LEFT JOIN User u ON f.User_ID = u.User_ID
      WHERE f.Org_ID = ?
      ORDER BY f.Created_at DESC
      LIMIT ?
    `;
    db.all(sql, [orgId, limit], callback);
  },

  // READ feedback by status
  findByStatus: (orgId, status, callback) => {
    const sql = `
      SELECT 
        f.*,
        u.First_Name,
        u.SurName,
        u.Email
      FROM Feedback f
      LEFT JOIN User u ON f.User_ID = u.User_ID
      WHERE f.Org_ID = ? AND f.Status = ?
      ORDER BY f.Created_at DESC
    `;
    db.all(sql, [orgId, status], callback);
  },

  // READ feedback by category
  findByCategory: (orgId, category, callback) => {
    const sql = `
      SELECT 
        f.*,
        u.First_Name,
        u.SurName,
        u.Email
      FROM Feedback f
      LEFT JOIN User u ON f.User_ID = u.User_ID
      WHERE f.Org_ID = ? AND f.Category = ?
      ORDER BY f.Created_at DESC
    `;
    db.all(sql, [orgId, category], callback);
  },

  // READ single feedback
  findById: (feedbackId, callback) => {
    const sql = `
      SELECT 
        f.*,
        u.First_Name,
        u.SurName,
        u.Email
      FROM Feedback f
      LEFT JOIN User u ON f.User_ID = u.User_ID
      WHERE f.Feedback_ID = ?
    `;
    db.get(sql, [feedbackId], callback);
  },

  // UPDATE feedback (respond to feedback)
  respond: (feedbackId, response, respondedBy, callback) => {
    const sql = `
      UPDATE Feedback 
      SET Response = ?, Responded_By = ?, Responded_at = DATETIME('now', 'localtime'), Status = 'responded'
      WHERE Feedback_ID = ?
    `;
    db.run(sql, [response, respondedBy, feedbackId], callback);
  },

  // UPDATE feedback status
  updateStatus: (feedbackId, status, callback) => {
    const sql = `
      UPDATE Feedback 
      SET Status = ?
      WHERE Feedback_ID = ?
    `;
    db.run(sql, [status, feedbackId], callback);
  },

  // GET feedback statistics
  getStats: (orgId, callback) => {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN Status = 'responded' THEN 1 ELSE 0 END) as responded,
        AVG(CAST(Rating AS FLOAT)) as avg_rating
      FROM Feedback
      WHERE Org_ID = ?
    `;
    db.get(sql, [orgId], callback);
  },

  // DELETE feedback
  delete: (feedbackId, callback) => {
    const sql = `DELETE FROM Feedback WHERE Feedback_ID = ?`;
    db.run(sql, [feedbackId], callback);
  }
};

module.exports = Feedback;
