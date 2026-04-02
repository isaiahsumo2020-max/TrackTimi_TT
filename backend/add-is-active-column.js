const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to database
const dbPath = path.join(__dirname, 'data', 'tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to database:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database:', dbPath);
});

// Check if column exists first
db.all("PRAGMA table_info(Organization)", (err, columns) => {
  if (err) {
    console.error('❌ Error checking table structure:', err);
    db.close();
    process.exit(1);
  }

  const hasIsActive = columns.some(col => col.name === 'Is_Active');
  
  if (hasIsActive) {
    console.log('✅ Is_Active column already exists');
    db.close();
    process.exit(0);
  }

  // Add the column if it doesn't exist
  db.run('ALTER TABLE Organization ADD COLUMN Is_Active INTEGER DEFAULT 1', (err) => {
    if (err) {
      console.error('❌ Error adding Is_Active column:', err);
      db.close();
      process.exit(1);
    }
    
    console.log('✅ Successfully added Is_Active column to Organization table');
    console.log('   All existing organizations set to active (Is_Active = 1)');
    
    db.close();
    process.exit(0);
  });
});
