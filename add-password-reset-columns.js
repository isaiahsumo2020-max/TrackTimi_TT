const db = require('./config/db');

console.log('🔧 Adding password reset columns to User table...');

const alterStatements = [
  `ALTER TABLE User ADD COLUMN Password_Reset_Token TEXT`,
  `ALTER TABLE User ADD COLUMN Password_Reset_Expires DATETIME`
];

let completed = 0;

alterStatements.forEach((sql, index) => {
  db.run(sql, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log(`⚠️  Column ${index + 1} already exists, skipping...`);
      } else {
        console.error(`❌ Error adding column ${index + 1}:`, err.message);
        process.exit(1);
      }
    } else {
      console.log(`✅ Successfully added column ${index + 1}`);
    }

    completed++;
    if (completed === alterStatements.length) {
      console.log('✅ All password reset columns added!');
      process.exit(0);
    }
  });
});
