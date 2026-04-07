#!/usr/bin/env node

const db = require('./config/db');

console.log('🔍 Checking for orphaned break records...');

// Check for breaks that have no End_Time
db.all(`SELECT Break_ID, User_ID, Break_Type, Start_Time FROM Break WHERE End_Time IS NULL`, [], (err, rows) => {
  if (err) {
    console.error('❌ Error checking breaks:', err.message);
    process.exit(1);
  }

  if (rows && rows.length > 0) {
    console.log(`⚠️  Found ${rows.length} orphaned break record(s):\n`);
    rows.forEach(row => {
      console.log(`  Break ID: ${row.Break_ID}, User: ${row.User_ID}, Type: ${row.Break_Type}, Started: ${row.Start_Time}`);
    });

    // Auto-end all orphaned breaks (set End_Time to current time)
    console.log('\n🔧 Auto-ending all orphaned breaks...');
    
    db.run(`UPDATE Break SET End_Time = datetime('now', 'localtime') WHERE End_Time IS NULL`, function(err) {
      if (err) {
        console.error('❌ Error ending breaks:', err.message);
        process.exit(1);
      }

      console.log(`✅ Successfully ended ${this.changes} orphaned break(s)`);
      process.exit(0);
    });
  } else {
    console.log('✅ No orphaned breaks found. Database is clean.');
    process.exit(0);
  }
});
