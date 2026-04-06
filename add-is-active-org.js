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

// Check if Is_Active column exists, if not add it
db.all(`PRAGMA table_info(Organization)`, (err, rows) => {
  if (err) {
    console.error(`❌ Error checking table structure:`, err);
    db.close();
    return;
  }

  const existingColumns = rows.map(row => row.name);

  if (existingColumns.includes('Is_Active')) {
    console.log(`✅ Column "Is_Active" already exists in Organization table`);
    db.close();
    return;
  }

  // Add the Is_Active column
  db.run(`ALTER TABLE Organization ADD COLUMN Is_Active INTEGER DEFAULT 1`, (err) => {
    if (err) {
      console.error(`❌ Failed to add column "Is_Active":`, err.message);
      db.close();
      return;
    }
    
    console.log(`✅ Column "Is_Active" added successfully to Organization table`);
    
    // Update any existing organizations to have Is_Active = 1
    db.run(`UPDATE Organization SET Is_Active = 1 WHERE Is_Active IS NULL`, (err) => {
      if (err) {
        console.error(`❌ Failed to update rows:`, err.message);
      } else {
        console.log(`✅ Updated existing organizations to Is_Active = 1`);
      }
      db.close();
    });
  });
});
