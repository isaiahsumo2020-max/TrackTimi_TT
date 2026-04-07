const db = require('../config/db');
const { notifyDepartmentCreated } = require('../utils/notificationService');

exports.createDepartment = (req, res) => {
  const { departName, orgId } = req.body;
  
  const sql = `INSERT INTO Department (Depart_Name, Org_ID) VALUES (?, ?)`;
  
  db.run(sql, [departName, orgId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    
    const deptId = this.lastID;
    
    // Get org name for notification
    db.get('SELECT Org_Name FROM Organization WHERE Org_ID = ?', [orgId], (orgErr, org) => {
      if (!orgErr && org) {
        // Send notification to org admin (non-blocking)
        notifyDepartmentCreated(departName, orgId, org.Org_Name, deptId)
          .catch((err) => console.error('⚠️  Failed to send dept creation notification:', err.message));
      }
    });
    
    res.status(201).json({ Dep_ID: deptId, Depart_Name: departName });
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
