const db = require('../config/db');
const crypto = require('crypto');

const Invitation = {
  // CREATE invitation
  create: (invitationData, callback) => {
    // Generate unique invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const sql = `
      INSERT INTO Invitation (Email, Org_ID, User_Type_ID, Token, Expires_At, Is_Used, Created_By)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `;
    
    db.run(
      sql,
      [
        invitationData.email,
        invitationData.orgId,
        invitationData.userTypeId || 3, // Default to Staff
        token,
        expiresAt,
        invitationData.createdBy
      ],
      function(err) {
        if (err) return callback(err);
        callback(null, {
          Invitation_ID: this.lastID,
          token,
          expiresAt
        });
      }
    );
  },

  // READ by token
  findByToken: (token, callback) => {
    db.get(
      `SELECT * FROM Invitation WHERE Token = ? AND Is_Used = 0 AND Expires_At > datetime('now')`,
      [token],
      callback
    );
  },

  // READ by org and email (check if already invited)
  findByOrgAndEmail: (orgId, email, callback) => {
    db.get(
      `SELECT * FROM Invitation WHERE Org_ID = ? AND Email = ? AND Is_Used = 0 AND Expires_At > datetime('now')`,
      [orgId, email],
      callback
    );
  },

  // READ all invitations for org
  findByOrgId: (orgId, callback) => {
    db.all(
      `SELECT i.*, ut.Type_Name as UserType
       FROM Invitation i
       LEFT JOIN User_Type ut ON i.User_Type_ID = ut.User_Type_ID
       WHERE i.Org_ID = ?
       ORDER BY i.Created_at DESC`,
      [orgId],
      callback
    );
  },

  // UPDATE - Mark as used
  markAsUsed: (invitationId, userId, callback) => {
    db.run(
      `UPDATE Invitation SET Is_Used = 1, User_ID = ?, Used_at = datetime('now') WHERE Invitation_ID = ?`,
      [userId, invitationId],
      callback
    );
  },

  // DELETE old/expired invitations
  deleteExpired: (callback) => {
    db.run(
      `DELETE FROM Invitation WHERE Expires_At < datetime('now') AND Is_Used = 0`,
      callback
    );
  }
};

module.exports = Invitation;
