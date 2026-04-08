const db = require('./config/db');

db.all("PRAGMA table_info(User)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('User table columns:');
    rows.forEach(row => {
      console.log(`  - ${row.name} (${row.type})`);
    });
  }
  process.exit();
});
