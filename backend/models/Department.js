const db = require('../config/db');

const Department = {
  create: (deptData, callback) => {
    const sql = `INSERT INTO Department (Depart_Name, Org_ID) VALUES (?, ?)`;
    db.run(sql, [deptData.departName, deptData.orgId], function(err) {
      if (err) return callback(err);
      callback(null, { Dep_ID: this.lastID, Depart_Name: deptData.departName });
    });
  },

  findAll: (callback) => {
    db.all(`
      SELECT D.Dep_ID, D.Depart_Name, O.Org_Name, O.Org_ID
      FROM Department D
      JOIN Organization O ON D.Org_ID = O.Org_ID
      ORDER BY D.Dep_ID DESC
    `, callback);
  },

  findByOrgId: (orgId, callback) => {
    db.all(`
      SELECT D.Dep_ID, D.Depart_Name, O.Org_Name
      FROM Department D
      JOIN Organization O ON D.Org_ID = O.Org_ID
      WHERE D.Org_ID = ?
      ORDER BY D.Depart_Name
    `, [orgId], callback);
  },

  findById: (id, callback) => {
    db.get(`
      SELECT D.*, O.Org_Name 
      FROM Department D
      JOIN Organization O ON D.Org_ID = O.Org_ID
      WHERE D.Dep_ID = ?
    `, [id], callback);
  }
};

module.exports = Department;
