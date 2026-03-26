const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/tracktimi.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to database.');
});

const migrations = [
  'ALTER TABLE Organization ADD COLUMN Theme_Color TEXT DEFAULT "#ff6600"',
  'ALTER TABLE Organization ADD COLUMN Logo_Path TEXT',
  'ALTER TABLE Organization ADD COLUMN Logo_MIME_Type TEXT DEFAULT "image/png"'
];

let completed = 0;

migrations.forEach(sql => {
  db.run(sql, (err) => {
    if (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('✅ Column already exists');
      } else {
        console.error('❌ Error:', err.message);
      }
    } else {
      console.log('✅ Added column successfully');
    }
    
    completed++;
    if (completed === migrations.length) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('✅ Migration complete!');
        }
      });
    }
  });
});
