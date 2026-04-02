const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('data.db', (err) => {
  if (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
});

db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;", [], (err, rows) => {
  if (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
  
  console.log('\n📋 Database Tables:');
  rows.forEach(r => console.log(`  ✓ ${r.name}`));
  
  const requiredTables = ['ShiftType', 'Schedule', 'ScheduleEmployee'];
  console.log('\n✅ New Tables Status:');
  requiredTables.forEach(table => {
    const exists = rows.some(r => r.name === table);
    console.log(`  ${exists ? '✓' : '✗'} ${table}`);
  });
  
  db.close();
});
