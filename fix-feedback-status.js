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

db.serialize(() => {
  // Check if Feedback table exists
  db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='Feedback'", (err, tables) => {
    if (err) {
      console.error('❌ Error checking table:', err.message);
      db.close();
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ Feedback table exists, updating schema...');
      
      // Update existing feedback with pending status to 'open'
      db.run("UPDATE Feedback SET Status = 'open' WHERE Status = 'pending'", function(err) {
        if (err) {
          console.error('❌ Error updating existing feedback:', err.message);
        } else {
          console.log(`✅ Updated ${this.changes} feedback items with status 'pending' → 'open'`);
        }

        // Update Category default from 'general' to 'suggestion'
        db.run("UPDATE Feedback SET Category = 'suggestion' WHERE Category = 'general'", function(err) {
          if (err) {
            console.error('❌ Error updating category:', err.message);
          } else {
            console.log(`✅ Updated ${this.changes} feedback items with category 'general' → 'suggestion'`);
          }
          
          db.close(() => {
            console.log('\n✅ Migration complete!');
            process.exit(0);
          });
        });
      });
    } else {
      console.log('ℹ️ Feedback table does not exist yet. It will be created automatically on server startup.');
      db.close();
      process.exit(0);
    }
  });
});
