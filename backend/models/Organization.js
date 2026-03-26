const db = require('../config/db');

const Organization = {
  create: (orgData, callback) => {
    const sql = `
      INSERT INTO Organization (Org_Name, Org_Type_ID, Region_ID, Address, Num_of_Employee, Phone_Num, Email, Theme_Color, Logo_Path, Logo_MIME_Type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [
      orgData.orgName, orgData.orgTypeId || null, orgData.regionId || null,
      orgData.address || null, orgData.numEmployees || null,
      orgData.phone || null, orgData.email || null,
      orgData.themeColor || '#ff6600', orgData.logoPath || null, orgData.logoMimeType || 'image/png'
    ], function(err) {
      if (err) return callback(err);
      callback(null, { Org_ID: this.lastID, Org_Name: orgData.orgName, Theme_Color: orgData.themeColor || '#ff6600' });
    });
  },

  findAll: (callback) => {
    db.all(`
      SELECT Org_ID, Org_Name, Num_of_Employee, Phone_Num, Email, Created_at
      FROM Organization ORDER BY Created_at DESC
    `, callback);
  },

  findById: (id, callback) => {
    db.get('SELECT * FROM Organization WHERE Org_ID = ?', [id], callback);
  },

  // Get org with user count
  findWithUserCount: (callback) => {
    db.all(`
      SELECT O.*, COUNT(U.User_ID) as user_count
      FROM Organization O
      LEFT JOIN User U ON O.Org_ID = U.Org_ID
      GROUP BY O.Org_ID
      ORDER BY O.Created_at DESC
    `, callback);
  },

  update: (id, orgData, callback) => {
    const updates = [];
    const values = [];

    if (orgData.orgName !== undefined) {
      updates.push('Org_Name = ?');
      values.push(orgData.orgName);
    }
    if (orgData.email !== undefined) {
      updates.push('Email = ?');
      values.push(orgData.email);
    }
    if (orgData.phone !== undefined) {
      updates.push('Phone_Num = ?');
      values.push(orgData.phone);
    }
    if (orgData.address !== undefined) {
      updates.push('Address = ?');
      values.push(orgData.address);
    }
    if (orgData.regionId !== undefined) {
      updates.push('Region_ID = ?');
      values.push(orgData.regionId);
    }
    if (orgData.orgTypeId !== undefined) {
      updates.push('Org_Type_ID = ?');
      values.push(orgData.orgTypeId);
    }
    if (orgData.numEmployees !== undefined) {
      updates.push('Num_of_Employee = ?');
      values.push(orgData.numEmployees);
    }
    if (orgData.themeColor !== undefined) {
      updates.push('Theme_Color = ?');
      values.push(orgData.themeColor);
    }
    if (orgData.logoPath !== undefined) {
      updates.push('Logo_Path = ?');
      values.push(orgData.logoPath);
    }
    if (orgData.logoMimeType !== undefined) {
      updates.push('Logo_MIME_Type = ?');
      values.push(orgData.logoMimeType);
    }

    if (updates.length === 0) {
      return callback(null, { changes: 0 });
    }

    updates.push('Updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = `UPDATE Organization SET ${updates.join(', ')} WHERE Org_ID = ?`;

    db.run(sql, values, function(err) {
      if (err) return callback(err);
      callback(null, { changes: this.changes });
    });
  }
};

module.exports = Organization;
