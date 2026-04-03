const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Open database
const db = new sqlite3.Database('./tracktimi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database.');
});

// Read migration file
const migrationPath = path.join(__dirname, 'sql', 'migration_add_user_dashboard_features.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  db.close();
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📋 Running migration: migration_add_user_dashboard_features.sql...');

// Execute migration
db.exec(migrationSQL, (err) => {
  if (err) {
    // Some ALTER TABLE statements might fail if columns already exist
    // This is OK, we just want to ensure they exist
    console.warn('⚠️  Migration warning (columns may already exist):', err.message);
  } else {
    console.log('✅ Migration completed successfully!');
  }

  // Verify columns exist
  db.all("PRAGMA table_info(Attendance)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking table info:', err.message);
      db.close();
      process.exit(1);
    }

    const columnNames = columns.map(col => col.name);
    console.log('\n📊 Attendance table columns:');
    columnNames.forEach(col => console.log('   -', col));

    const requiredColumns = ['Is_Late_Clock_In', 'Clock_In_Window_Used', 'Minutes_Late'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));

    if (missingColumns.length > 0) {
      console.log('\n❌ Missing columns:', missingColumns);
      console.log('\nManually adding missing columns...');

      let added = 0;
      const callbacks = missingColumns.length;

      missingColumns.forEach(col => {
        let sql = '';
        if (col === 'Is_Late_Clock_In') {
          sql = `ALTER TABLE Attendance ADD COLUMN Is_Late_Clock_In BOOLEAN DEFAULT 0`;
        } else if (col === 'Clock_In_Window_Used') {
          sql = `ALTER TABLE Attendance ADD COLUMN Clock_In_Window_Used BOOLEAN DEFAULT 0`;
        } else if (col === 'Minutes_Late') {
          sql = `ALTER TABLE Attendance ADD COLUMN Minutes_Late INTEGER DEFAULT 0`;
        }

        db.run(sql, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error(`   ❌ Error adding ${col}:`, err.message);
          } else if (!err) {
            console.log(`   ✅ Added ${col}`);
          } else {
            console.log(`   ℹ️  ${col} already exists`);
          }

          added++;
          if (added === callbacks) {
            console.log('\n✅ All required columns are now present!');
            db.close();
          }
        });
      });
    } else {
      console.log('\n✅ All required columns are present!');
      db.close();
    }
  });
});
