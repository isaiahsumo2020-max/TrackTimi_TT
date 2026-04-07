#!/usr/bin/env node

const db = require('./config/db');

console.log('📊 Adding Break table to database...');

db.run(`CREATE TABLE IF NOT EXISTS Break (
  Break_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  User_ID INTEGER NOT NULL,
  Org_ID INTEGER NOT NULL,
  Break_Type TEXT DEFAULT 'regular',
  Reason TEXT,
  Start_Time DATETIME NOT NULL,
  End_Time DATETIME,
  Latitude REAL,
  Longitude REAL,
  End_Latitude REAL,
  End_Longitude REAL,
  Start_Accuracy REAL,
  End_Accuracy REAL,
  Duration_Minutes INTEGER,
  Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (User_ID) REFERENCES User(User_ID),
  FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
)`, function(err) {
  if (err) {
    console.error('❌ Error creating Break table:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Break table created successfully!');
    process.exit(0);
  }
});
