const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database:', dbPath);
});

db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create ShiftType table
  db.run(`
    CREATE TABLE IF NOT EXISTS ShiftType (
      ShiftType_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Org_ID INTEGER NOT NULL,
      ShiftType_Name TEXT NOT NULL,
      Start_Time TEXT NOT NULL,
      End_Time TEXT NOT NULL,
      Description TEXT,
      Color_Code TEXT DEFAULT '#3b82f6',
      Is_Active BOOLEAN DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
    )
  `, (err) => {
    if (err) {
      console.error('❌ ShiftType table error:', err.message);
    } else {
      console.log('✅ ShiftType table created/verified');
    }
  });

  // Create Schedule table
  db.run(`
    CREATE TABLE IF NOT EXISTS Schedule (
      Schedule_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Org_ID INTEGER NOT NULL,
      ShiftType_ID INTEGER NOT NULL,
      Schedule_Name TEXT NOT NULL,
      Start_Date TEXT NOT NULL,
      End_Date TEXT NOT NULL,
      Description TEXT,
      Is_Active BOOLEAN DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
      FOREIGN KEY (ShiftType_ID) REFERENCES ShiftType(ShiftType_ID)
    )
  `, (err) => {
    if (err) {
      console.error('❌ Schedule table error:', err.message);
    } else {
      console.log('✅ Schedule table created/verified');
    }
  });

  // Create ScheduleEmployee table
  db.run(`
    CREATE TABLE IF NOT EXISTS ScheduleEmployee (
      ScheduleEmployee_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Schedule_ID INTEGER NOT NULL,
      User_ID INTEGER NOT NULL,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Schedule_ID) REFERENCES Schedule(Schedule_ID),
      FOREIGN KEY (User_ID) REFERENCES User(User_ID)
    )
  `, (err) => {
    if (err) {
      console.error('❌ ScheduleEmployee table error:', err.message);
    } else {
      console.log('✅ ScheduleEmployee table created/verified');
    }
  });

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_shifttype_org ON ShiftType(Org_ID)', (err) => {
    if (err) console.error('Index error:', err.message);
    else console.log('✅ Index idx_shifttype_org created');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_schedule_org ON Schedule(Org_ID)', (err) => {
    if (err) console.error('Index error:', err.message);
    else console.log('✅ Index idx_schedule_org created');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_schedule_shifttype ON Schedule(ShiftType_ID)', (err) => {
    if (err) console.error('Index error:', err.message);
    else console.log('✅ Index idx_schedule_shifttype created');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_scheduleemployee_schedule ON ScheduleEmployee(Schedule_ID)', (err) => {
    if (err) console.error('Index error:', err.message);
    else console.log('✅ Index idx_scheduleemployee_schedule created');
  });

  db.run('CREATE INDEX IF NOT EXISTS idx_scheduleemployee_user ON ScheduleEmployee(User_ID)', (err) => {
    if (err) console.error('Index error:', err.message);
    else console.log('✅ Index idx_scheduleemployee_user created');
  });
});

// Close database after a short delay to ensure all operations complete
setTimeout(() => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('✅ Migration completed successfully!');
    }
    process.exit(0);
  });
}, 1000);
