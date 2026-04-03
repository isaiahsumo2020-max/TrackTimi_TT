const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the database
const dbPath = path.join(__dirname, 'data', 'tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to:', dbPath);
});

// Function to add column if it doesn't exist
const addColumnIfNotExists = (columnName, columnDef) => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Check if column exists
      db.all("PRAGMA table_info(Attendance)", (err, rows) => {
        if (err) {
          console.error(`❌ Error checking ${columnName}:`, err.message);
          return reject(err);
        }

        const columnExists = rows.some(row => row.name === columnName);
        
        if (columnExists) {
          console.log(`✅ Column '${columnName}' already exists`);
          resolve();
        } else {
          console.log(`📝 Adding column '${columnName}'...`);
          db.run(`ALTER TABLE Attendance ADD COLUMN ${columnDef}`, (err) => {
            if (err) {
              console.error(`❌ Error adding ${columnName}:`, err.message);
              reject(err);
            } else {
              console.log(`✅ Added column '${columnName}'`);
              resolve();
            }
          });
        }
      });
    });
  });
};

// Add all required columns sequentially
(async () => {
  try {
    await addColumnIfNotExists('Is_Late_Clock_In', 'Is_Late_Clock_In BOOLEAN DEFAULT 0');
    await addColumnIfNotExists('Clock_In_Window_Used', 'Clock_In_Window_Used BOOLEAN DEFAULT 0');
    await addColumnIfNotExists('Minutes_Late', 'Minutes_Late INTEGER DEFAULT 0');

    // Verify all columns exist
    console.log('\n📊 Final verification...');
    db.all("PRAGMA table_info(Attendance)", (err, rows) => {
      if (err) {
        console.error('❌ Error verifying columns:', err.message);
      } else {
        const requiredCols = ['Is_Late_Clock_In', 'Clock_In_Window_Used', 'Minutes_Late'];
        const actualCols = rows.map(r => r.name);
        
        console.log('\n📋 Attendance table columns:');
        actualCols.forEach(col => console.log(`   - ${col}`));

        const allPresent = requiredCols.every(col => actualCols.includes(col));
        if (allPresent) {
          console.log('\n✅ All required columns are now present!');
        } else {
          console.log('\n❌ Some columns are still missing');
        }
      }

      db.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    db.close();
    process.exit(1);
  }
})();
