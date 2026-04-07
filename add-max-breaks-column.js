#!/usr/bin/env node

const db = require('./config/db');

console.log('📊 Adding Max_Breaks_Per_Shift column to Organization table...');

db.all(`PRAGMA table_info(Organization)`, (err, columns) => {
  if (err) {
    console.error('❌ Migration check failed:', err.message);
    process.exit(1);
    return;
  }

  const hasMaxBreaks = columns.some(col => col.name === 'Max_Breaks_Per_Shift');

  if (!hasMaxBreaks) {
    db.run(`ALTER TABLE Organization ADD COLUMN Max_Breaks_Per_Shift INTEGER DEFAULT 2`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('❌ Failed to add Max_Breaks_Per_Shift:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Added Max_Breaks_Per_Shift column to Organization table');
        process.exit(0);
      }
    });
  } else {
    console.log('✅ Max_Breaks_Per_Shift column already exists');
    process.exit(0);
  }
});
