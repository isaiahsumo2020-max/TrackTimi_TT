const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Connect to the database
const dbPath = path.join(__dirname, 'data', 'tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to:', dbPath);
});

// Read and execute migration
const migrationPath = path.join(__dirname, 'sql', 'migration_add_excuse_system.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  db.close();
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Running migration: migration_add_excuse_system.sql...');

db.exec(migrationSQL, (err) => {
  if (err) {
    console.warn('⚠️  Migration warning (tables/columns may already exist):', err.message);
  } else {
    console.log('✅ Migration completed successfully!');
  }

  // Verify Excuse table exists
  db.all("PRAGMA table_info(Excuse)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking Excuse table:', err.message);
      db.close();
      process.exit(1);
    }

    if (!columns || columns.length === 0) {
      console.log('❌ Excuse table not found after migration');
      db.close();
      process.exit(1);
    }

    console.log('\n📊 Excuse table columns:');
    columns.forEach(col => console.log(`   - ${col.name}`));

    console.log('\n✅ Excuse system migration complete!');
    db.close();
  });
});
