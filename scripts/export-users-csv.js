const db = require('../config/db');
const fs = require('fs');
const path = require('path');

console.log('📥 Exporting all users to CSV...\n');

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
    console.log('📭 No users found to export');
    process.exit(0);
  }

  // Map User_Type_ID to role names
  const roleMap = { 1: 'Admin', 2: 'Manager', 3: 'Staff' };

  // Create CSV header
  const headers = [
    'User_ID',
    'First_Name',
    'Last_Name',
    'Email',
    'Employee_ID',
    'Organization_ID',
    'Role',
    'Job_Title',
    'Phone',
    'Department_ID',
    'Active',
    'Created_Date'
  ];

  // Create CSV rows
  const csvRows = rows.map(user => [
    user.User_ID,
    `"${user.First_Name}"`,
    `"${user.SurName}"`,
    user.Email,
    user.Employee_ID || '',
    user.Org_ID,
    roleMap[user.User_Type_ID] || 'Unknown',
    `"${user.Job_Title || ''}"`,
    user.Phone_Num || '',
    user.Dep_ID || '',
    user.Is_Active,
    user.Created_at
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.join(','))
  ].join('\n');

  // Create exports directory if it doesn't exist
  const exportsDir = path.join(__dirname, '../exports');
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = `users_${timestamp}.csv`;
  const filepath = path.join(exportsDir, filename);

  // Write to file
  fs.writeFileSync(filepath, csvContent, 'utf8');

  console.log(`✅ Successfully exported ${rows.length} users to CSV`);
  console.log(`📄 File: ${filepath}\n`);
  
  process.exit(0);
});
