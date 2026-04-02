const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Connect to database using the same path as config/db.js
const dbPath = path.join(__dirname, 'data', 'tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database:', dbPath);
});

// Read the migration file
const migrationFile = path.join(__dirname, 'sql', 'migration_shift_types.sql');
const sql = fs.readFileSync(migrationFile, 'utf8');

// Execute each SQL statement
db.exec(sql, (err) => {
  if (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }

  console.log('✅ Migration completed successfully!');
  console.log('   - ShiftType table created');
  console.log('   - Schedule table created');
  console.log('   - ScheduleEmployee table created');
  
  db.close();
  process.exit(0);
});
