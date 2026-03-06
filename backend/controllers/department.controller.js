const db = require('../config/db');

exports.createDepartment = (req, res) => {
  const { departName, orgId } = req.body;
  
  const sql = `INSERT INTO Department (Depart_Name, Org_ID) VALUES (?, ?)`;
  
  db.run(sql, [departName, orgId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ Dep_ID: this.lastID, Depart_Name: departName });
  });
};

exports.getDeptByOrg = (req, res) => {
  const orgId = req.params.orgId;  // ← FIXED: Removed duplicate db require
  
  db.all(`
    SELECT D.Dep_ID, D.Depart_Name, O.Org_Name
    FROM Department D
    JOIN Organization O ON D.Org_ID = O.Org_ID
    WHERE D.Org_ID = ?
  `, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getDepartments = (req, res) => {
  db.all(`
    SELECT D.Dep_ID, D.Depart_Name, O.Org_Name
    FROM Department D
    JOIN Organization O ON D.Org_ID = O.Org_ID
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
