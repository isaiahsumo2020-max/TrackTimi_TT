const db = require('../config/db');
const crypto = require('crypto');

const Invitation = {
  create: (invitationData, callback) => {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = invitationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const sql = `INSERT INTO Invitation (Email, Org_ID, User_Type_ID, Token, Expires_At, Is_Used, Created_By, Created_at) VALUES (?, ?, ?, ?, ?, 0, ?, datetime('now'))`;
    db.run(sql, [
      invitationData.email.toLowerCase(),
      invitationData.orgId,
      invitationData.userTypeId || 3,
      token,
      expiresAt,
      invitationData.createdBy || null
    ], function(err) {
      if (err) return callback(err);
      callback(null, { Invitation_ID: this.lastID, Token: token, Email: invitationData.email.toLowerCase(), Org_ID: invitationData.orgId, Expires_At: expiresAt });
    });
  },

  findByToken: (token, callback) => {
    const sql = `SELECT * FROM Invitation WHERE Token = ? AND Is_Used = 0 AND Expires_At > datetime('now')`;
    db.get(sql, [token], callback);
  },

  markUsed: (token, callback) => {
    const sql = `UPDATE Invitation SET Is_Used = 1, Used_at = datetime('now') WHERE Token = ?`;
    db.run(sql, [token], callback);
  },

  findByOrgAndEmail: (orgId, email, callback) => {
    const sql = `SELECT * FROM Invitation WHERE Org_ID = ? AND Email = ? AND Is_Used = 0 AND Expires_At > datetime('now')`;
    db.get(sql, [orgId, email.toLowerCase()], callback);
  }
};

module.exports = Invitation;
