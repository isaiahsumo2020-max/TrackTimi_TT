const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Get organization ID from command line arguments
const orgId = process.argv[2];

if (!orgId) {
  console.error('❌ Usage: node filter-by-org.js <orgId>');
  console.error('Example: node filter-by-org.js 5');
  process.exit(1);
}

console.log(`🔍 Fetching users for Organization ID: ${orgId}\n`);

const sql = `
  SELECT 
    u.User_ID,
    u.First_Name,
    u.SurName,
    u.Email,
    u.Employee_ID,
    u.User_Type_ID,
    CASE 
      WHEN u.User_Type_ID = 1 THEN 'Admin'
      WHEN u.User_Type_ID = 2 THEN 'Manager'
      WHEN u.User_Type_ID = 3 THEN 'Staff'
      ELSE 'Unknown'
    END as role,
    u.Job_Title,
    u.Phone_Num,
    u.Dep_ID,
    u.Is_Active,
    u.Created_at,
    o.Org_Name
  FROM User u
  LEFT JOIN Organization o ON u.Org_ID = o.Org_ID
  WHERE u.Org_ID = ?
  ORDER BY u.User_ID ASC
`;

db.all(sql, [orgId], (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log(`📭 No users found for Organization ID: ${orgId}`);
    process.exit(0);
  }

  const orgName = rows[0]?.Org_Name || 'Unknown Organization';
  console.log(`✅ Found ${rows.length} user(s) in "${orgName}"\n`);
  console.table(rows);
  
  process.exit(0);
});
