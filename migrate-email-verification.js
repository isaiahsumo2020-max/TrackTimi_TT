const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to database:', dbPath);
  }
});

// Migrate: Add email verification columns to User table
function addEmailVerificationColumns() {
  const columnsToAdd = [
    { name: 'Email_Verified', type: 'BOOLEAN DEFAULT 0' },
    { name: 'Verification_Code', type: 'TEXT' },
    { name: 'Verification_Token', type: 'TEXT UNIQUE' },
    { name: 'Verification_Expires', type: 'DATETIME' }
  ];

  let completedCount = 0;

  // Check if columns already exist
  db.all(`PRAGMA table_info(User)`, (err, rows) => {
    if (err) {
      console.error(`❌ Error checking table structure:`, err);
      db.close();
      return;
    }

    const existingColumns = rows.map(row => row.name);

    columnsToAdd.forEach((column) => {
      if (existingColumns.includes(column.name)) {
        console.log(`⚽ Column "${column.name}" already exists. Skipping...`);
        completedCount++;
      } else {
        db.run(`ALTER TABLE User ADD COLUMN ${column.name} ${column.type}`, (err) => {
          if (err) {
            console.error(`❌ Failed to add column "${column.name}":`, err.message);
          } else {
            console.log(`✅ Column "${column.name}" added successfully`);
          }
          completedCount++;

          if (completedCount === columnsToAdd.length) {
            console.log(`\n✅ Migration completed successfully!`);
            db.close();
          }
        });
      }
    });

    if (columnsToAdd.length === 0) {
      db.close();
    }
  });
}

// Run migration
addEmailVerificationColumns();
