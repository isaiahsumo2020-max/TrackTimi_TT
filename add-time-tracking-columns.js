#!/usr/bin/env node

const db = require('./config/db');

console.log('⏰ Adding time tracking columns to Organization_Activity...');

const alterQueries = [
  // Add Clock_In_Time column
  `ALTER TABLE Organization_Activity ADD COLUMN Clock_In_Time TEXT DEFAULT NULL`,
  
  // Add Clock_Out_Time column
  `ALTER TABLE Organization_Activity ADD COLUMN Clock_Out_Time TEXT DEFAULT NULL`,
  
  // Add Total_Hours_Minutes column (for quick queries)
  `ALTER TABLE Organization_Activity ADD COLUMN Total_Hours_Minutes REAL DEFAULT 0`,
  
  // Add Status column (present, absent, half-day)
  `ALTER TABLE Organization_Activity ADD COLUMN Status TEXT DEFAULT 'present'`,
  
  // Update Activity_Type from 'break' to something more generic or add new types
  // This allows tracking of different activity types: 'attendance', 'break', etc.
];

let completed = 0;

alterQueries.forEach((query, index) => {
  db.run(query, function(err) {
    if (err) {
      // Column might already exist, which is fine
      if (err.message.includes('duplicate column')) {
        console.log(`⚠️  Column already exists (query ${index + 1})`);
      } else {
        console.error(`❌ Error on query ${index + 1}:`, err.message);
      }
    } else {
      console.log(`✅ Query ${index + 1} executed successfully`);
    }
    
    completed++;
    if (completed === alterQueries.length) {
      console.log('\n✅ All time tracking columns added/verified!');
      
      // Create indexes for better query performance
      const indexQueries = [
        `CREATE INDEX IF NOT EXISTS idx_activity_date ON Organization_Activity(Org_ID, Activity_Date)`,
        `CREATE INDEX IF NOT EXISTS idx_activity_user_date ON Organization_Activity(User_ID, Activity_Date)`,
      ];
      
      let indexCompleted = 0;
      indexQueries.forEach((indexQuery) => {
        db.run(indexQuery, function(err) {
          if (err) {
            console.error('❌ Index creation error:', err.message);
          } else {
            console.log('✅ Index created');
          }
          indexCompleted++;
          if (indexCompleted === indexQueries.length) {
            console.log('\n✅ Time tracking setup complete!');
            process.exit(0);
          }
        });
      });
    }
  });
});
