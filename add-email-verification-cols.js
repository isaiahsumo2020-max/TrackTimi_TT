const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to database');
  }
});

// Check User table columns
db.all(`PRAGMA table_info(User)`, (err, rows) => {
  if (err) {
    console.error(`❌ Error checking User table:`, err);
    db.close();
    return;
  }

  const userColumns = rows.map(row => row.name);
  console.log('📋 User table columns:', userColumns);
  
  const requiredEmailCols = ['Email_Verified', 'Verification_Code', 'Verification_Token', 'Verification_Expires'];
  const missingCols = requiredEmailCols.filter(col => !userColumns.includes(col));
  
  if (missingCols.length === 0) {
    console.log('✅ All email verification columns exist in User table');
    db.close();
    return;
  }
  
  console.log('❌ Missing columns in User table:', missingCols);
  
  let completedCount = 0;
  const columnsToAdd = [
    { name: 'Email_Verified', type: 'BOOLEAN DEFAULT 0' },
    { name: 'Verification_Code', type: 'TEXT' },
    { name: 'Verification_Token', type: 'TEXT UNIQUE' },
    { name: 'Verification_Expires', type: 'DATETIME' }
  ];
  
  columnsToAdd.forEach((column) => {
    if (!userColumns.includes(column.name)) {
      db.run(`ALTER TABLE User ADD COLUMN ${column.name} ${column.type}`, (err) => {
        if (err) {
          console.error(`❌ Failed to add column "${column.name}":`, err.message);
        } else {
          console.log(`✅ Column "${column.name}" added successfully`);
        }
        completedCount++;
        
        if (completedCount === missingCols.length) {
          console.log(`\n✅ All missing columns added!`);
          db.close();
        }
      });
    }
  });
});
