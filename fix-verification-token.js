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

// Add Verification_Token column without UNIQUE constraint
function fixVerificationToken() {
  db.all(`PRAGMA table_info(User)`, (err, rows) => {
    if (err) {
      console.error(`❌ Error checking table structure:`, err);
      db.close();
      return;
    }

    const existingColumns = rows.map(row => row.name);

    if (existingColumns.includes('Verification_Token')) {
      console.log(`✅ Column "Verification_Token" already exists`);
      db.close();
      return;
    }

    // Add without UNIQUE constraint
    db.run(`ALTER TABLE User ADD COLUMN Verification_Token TEXT`, (err) => {
      if (err) {
        console.error(`❌ Failed to add column:`, err.message);
      } else {
        console.log(`✅ Column "Verification_Token" added successfully`);
      }
      db.close();
    });
  });
}

fixVerificationToken();
