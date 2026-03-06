const db = require('../config/db');

const Organization = {
  create: (orgData, callback) => {
    const sql = `
      INSERT INTO Organization (Org_Name, Org_Type_ID, Region_ID, Address, Num_of_Employee, Phone_Num, Email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [
      orgData.orgName, orgData.orgTypeId || null, orgData.regionId || null,
      orgData.address || null, orgData.numEmployees || null,
      orgData.phone || null, orgData.email || null
    ], function(err) {
      if (err) return callback(err);
      callback(null, { Org_ID: this.lastID, Org_Name: orgData.orgName });
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
  }
};

module.exports = Organization;
