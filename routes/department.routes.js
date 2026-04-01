const router = require('express').Router();
const departmentController = require('../controllers/department.controller');

// POST /api/departments - Create department
router.post('/', departmentController.createDepartment);

// GET /api/departments - List all departments
router.get('/', departmentController.getDepartments);

// GET /api/departments/org/:orgId - Departments by organization
router.get('/org/:orgId', (req, res) => {
  const db = require('../config/db');
  const orgId = req.params.orgId;
  
  db.all(`
    SELECT D.Dep_ID, D.Depart_Name, O.Org_Name 
    FROM Department D 
    JOIN Organization O ON D.Org_ID = O.Org_ID 
    WHERE D.Org_ID = ?
  `, [orgId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
