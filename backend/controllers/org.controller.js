const db = require('../config/db');  // ← ONE TIME ONLY at top

exports.createOrganization = (req, res) => {
  const { orgName, orgTypeId, regionId, address, numEmployees, phone, email } = req.body;

  const sql = `
    INSERT INTO Organization (Org_Name, Org_Type_ID, Region_ID, Address, Num_of_Employee, Phone_Num, Email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [orgName, orgTypeId || null, regionId || null, address || null, numEmployees || null, phone || null, email || null], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ Org_ID: this.lastID, Org_Name: orgName });
    }
  );
};

exports.getOrganizations = (req, res) => {
  db.all(`
    SELECT Org_ID, Org_Name, Num_of_Employee, Created_at 
    FROM Organization 
    ORDER BY Created_at DESC
  `, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getOrganizationById = (req, res) => {
  const orgId = req.params.id;  // ← USE the TOP db import, NOT re-import
  
  db.get('SELECT * FROM Organization WHERE Org_ID = ?', [orgId], (err, org) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!org) return res.status(404).json({ error: 'Organization not found' });
    res.json(org);
  });
};
