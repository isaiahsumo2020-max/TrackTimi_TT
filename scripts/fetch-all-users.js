const db = require('../config/db');

console.log('🔍 Fetching all users from database...\n');

const sql = `
  SELECT 
    User_ID,
    First_Name,
    SurName,
    Email,
    Employee_ID,
    Org_ID,
    User_Type_ID,
    Job_Title,
    Phone_Num,
    Dep_ID,
    Is_Active,
    Created_at
  FROM User
  ORDER BY User_ID ASC
`;

db.all(sql, (err, rows) => {
  if (err) {
    console.error('❌ Database error:', err.message);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('📭 No users found in database');
    process.exit(0);
  }

  console.log(`✅ Found ${rows.length} user(s)\n`);
  console.table(rows);
  
  process.exit(0);
});
