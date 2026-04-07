#!/usr/bin/env node

const db = require('./config/db');

console.log('📊 Creating Organization Activity table...');

db.run(`CREATE TABLE IF NOT EXISTS Organization_Activity (
  Activity_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Org_ID INTEGER NOT NULL,
  User_ID INTEGER NOT NULL,
  Activity_Type TEXT DEFAULT 'break',
  Activity_Date TEXT NOT NULL,
  Break_Type TEXT,
  Total_Breaks INTEGER DEFAULT 0,
  Total_Break_Minutes INTEGER DEFAULT 0,
  Breaks_Summary TEXT,
  Shift_Duration_Minutes INTEGER,
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
  FOREIGN KEY (User_ID) REFERENCES User(User_ID)
)`, function(err) {
  if (err) {
    console.error('❌ Error creating Organization_Activity table:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Organization_Activity table created successfully!');
    process.exit(0);
  }
});
