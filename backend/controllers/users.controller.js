const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. CREATE USER (Provisioning)
exports.createUser = async (req, res) => {
  try {
    const { firstName, surName, email, password, jobTitle, depId, userTypeId } = req.body;
    const adminOrgId = req.user.orgId;

    if (!firstName || !surName || !email || !password) {
      return res.status(400).json({ error: 'Name, Email, and Password are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO User (First_Name, SurName, Email, Password, Org_ID, User_Type_ID, Job_Title, Dep_ID, Is_Active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `;

    db.run(sql, [firstName, surName, email.toLowerCase(), hashedPassword, adminOrgId, userTypeId || 3, jobTitle, depId || null], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }
      res.status(201).json({ message: 'User provisioned successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// 2. GET ALL USERS (The one causing the crash on line 7)
exports.getUsers = (req, res) => {
  const orgId = req.user.orgId;
  const sql = `
    SELECT 
      User_ID, 
      First_Name AS firstName, 
      SurName AS surName, 
      Email AS email, 
      Job_Title AS jobTitle,
      Employee_ID AS employeeId
    FROM User 
    WHERE Org_ID = ? AND Is_Active = 1
  `;
  
  db.all(sql, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Fetch failed' });
    res.json(rows);
  });
};

// 3. GET SINGLE USER
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const orgId = req.user.orgId;
  db.get('SELECT * FROM User WHERE User_ID = ? AND Org_ID = ?', [id, orgId], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
  });
};