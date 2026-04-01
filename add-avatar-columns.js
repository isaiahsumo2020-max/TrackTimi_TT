#!/usr/bin/env node
/**
 * Add Avatar Columns to User Table
 * This script adds Avatar_Data and Avatar_MIME_Type columns to the User table
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tracktimi.db');
console.log(`📂 Connecting to database: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
  runMigrations();
});

function runMigrations() {
  db.serialize(() => {
    // Check if columns exist first
    db.all(`PRAGMA table_info(User)`, (err, rows) => {
      if (err) {
        console.error('❌ Error checking table structure:', err.message);
        db.close();
        process.exit(1);
      }

      const avatarDataExists = rows.some(row => row.name === 'Avatar_Data');
      const avatarMimeExists = rows.some(row => row.name === 'Avatar_MIME_Type');

      console.log('📊 Current User table columns:');
      rows.forEach(row => console.log(`   - ${row.name} (${row.type})`));
      console.log();

      if (avatarDataExists && avatarMimeExists) {
        console.log('✅ Avatar columns already exist - no migration needed');
        db.close();
        process.exit(0);
      }

      const migrations = [];
      if (!avatarDataExists) {
        migrations.push({
          name: 'Add Avatar_Data column',
          sql: 'ALTER TABLE User ADD COLUMN Avatar_Data TEXT'
        });
      }
      if (!avatarMimeExists) {
        migrations.push({
          name: 'Add Avatar_MIME_Type column',
          sql: `ALTER TABLE User ADD COLUMN Avatar_MIME_Type TEXT DEFAULT 'image/png'`
        });
      }

      if (migrations.length === 0) {
        console.log('✅ Avatar columns already exist');
        db.close();
        process.exit(0);
      }

      console.log(`🔄 Running ${migrations.length} migration(s)...\n`);

      let completed = 0;
      migrations.forEach((migration, index) => {
        console.log(`[${index + 1}/${migrations.length}] ${migration.name}...`);
        db.run(migration.sql, (err) => {
          if (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            console.error(`   SQL: ${migration.sql}`);
            db.close();
            process.exit(1);
          }
          completed++;
          console.log(`   ✅ Success`);

          if (completed === migrations.length) {
            console.log('\n✅ All migrations completed successfully!');
            
            // Verify
            console.log('\n📊 Updated User table columns:');
            db.all(`PRAGMA table_info(User)`, (err, rows) => {
              if (err) {
                console.error('❌ Error verifying:', err.message);
              } else {
                rows.forEach(row => console.log(`   - ${row.name} (${row.type})`));
              }
              db.close();
              process.exit(0);
            });
          }
        });
      });
    });
  });
}

db.on('error', (err) => {
  console.error('Database error:', err.message);
  process.exit(1);
});
