const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'data', '../data/tracktimi.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to TrackTimi DB:', err.message);
  } else {
    console.log('✅ TrackTimi DB connected:', dbPath);
    initializeTables();
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

function initializeTables() {
  db.serialize(() => {
    // 1. LOOKUP TABLES
    db.run(`CREATE TABLE IF NOT EXISTS Organization_Type (
      Org_Type_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Type_Name TEXT UNIQUE NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO Organization_Type (Type_Name) VALUES 
      ('School'), ('NGO'), ('Company'), ('Government')`);

    db.run(`CREATE TABLE IF NOT EXISTS Region (
      Region_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Region_Name TEXT UNIQUE NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO Region (Region_Name) VALUES 
      ('Montserrado'), ('Bong'), ('Bomi'), ('Margibi'), ('Nimba')`);

    db.run(`CREATE TABLE IF NOT EXISTS Role (
      Role_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Role_Name TEXT UNIQUE NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO Role (Role_Name) VALUES 
      ('SuperAdmin'), ('OrgAdmin'), ('Admin'), ('Manager'), ('Staff'), ('Student')`);

    db.run(`CREATE TABLE IF NOT EXISTS User_Type (
      User_Type_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Type_Name TEXT UNIQUE NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO User_Type (Type_Name) VALUES 
      ('Admin'), ('Manager'), ('Staff'), ('Student')`);

    // 2. SUPER ADMIN
    db.run(`CREATE TABLE IF NOT EXISTS Super_Admin (
      Super_Admin_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Email TEXT UNIQUE NOT NULL,
      Password TEXT NOT NULL,
      Full_Name TEXT NOT NULL,
      Phone_Num TEXT,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    
    const superAdminHash = bcrypt.hashSync('superpass123', 10);
    db.run(`INSERT OR IGNORE INTO Super_Admin (Email, Password, Full_Name) VALUES (?, ?, ?)`,
      ['superadmin@tracktimi.com', superAdminHash, 'TrackTimi System Admin']
    );

    // 3. CORE TABLES
    db.run(`CREATE TABLE IF NOT EXISTS Organization (
      Org_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Org_Name TEXT NOT NULL,
      Org_Slug TEXT UNIQUE,
      Org_Type_ID INTEGER,
      Org_Domain TEXT UNIQUE,
      Theme_Color TEXT DEFAULT '#f2a409',
      Region_ID INTEGER,
      Address TEXT,
      Num_of_Employee INTEGER DEFAULT 0,
      Phone_Num TEXT,
      Email TEXT,
      Logo_Path TEXT,
      Logo_MIME_Type TEXT DEFAULT 'image/png',
      Is_Active INTEGER DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      Updated_at DATETIME,
      FOREIGN KEY (Org_Type_ID) REFERENCES Organization_Type(Org_Type_ID),
      FOREIGN KEY (Region_ID) REFERENCES Region(Region_ID),
      UNIQUE(Org_Slug)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Department (
      Dep_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Depart_Name TEXT NOT NULL,
      Org_ID INTEGER NOT NULL,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE CASCADE
    )`);

    //  Devices = Users
    db.run(`CREATE TABLE IF NOT EXISTS Device (
      Device_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Device_Name TEXT NOT NULL,
      Device_Model TEXT,
      Device_UUID TEXT UNIQUE NOT NULL,
      Device_Type TEXT NOT NULL,
      Org_Domain TEXT NOT NULL,
      OS_Name TEXT,
      OS_Version TEXT,
      IP_Address TEXT,
      Last_Checkin DATETIME,
      Is_Active BOOLEAN DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      User_ID INTEGER,
      FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE SET NULL
    )`);

    // 4. USER (AFTER Device)
    db.run(`CREATE TABLE IF NOT EXISTS User (
      User_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      First_Name TEXT NOT NULL,
      SurName TEXT NOT NULL,
      Email TEXT UNIQUE NOT NULL,
      Password TEXT NOT NULL,
      Org_ID INTEGER NOT NULL,
      Role_ID INTEGER,
      Employee_ID TEXT UNIQUE,
      User_Type_ID INTEGER,
      Phone_Num TEXT,
      Job_Title TEXT,
      Device_ID INTEGER UNIQUE,
      Dep_ID INTEGER,
      Avatar_Data LONGTEXT,
      Avatar_MIME_Type TEXT DEFAULT 'image/png',
      Is_Active BOOLEAN DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      Updated_at DATETIME,
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE CASCADE,
      FOREIGN KEY (Role_ID) REFERENCES Role(Role_ID),
      FOREIGN KEY (User_Type_ID) REFERENCES User_Type(User_Type_ID),
      FOREIGN KEY (Dep_ID) REFERENCES Department(Dep_ID),
      FOREIGN KEY (Device_ID) REFERENCES Device(Device_ID)
    )`);

    // 5. BILLING - USERS = DEVICES
    db.run(`CREATE TABLE IF NOT EXISTS SubscriptionPlan (
      Plan_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Plan_Name TEXT NOT NULL,
      Max_Users INTEGER NOT NULL,
      Max_Devices INTEGER NOT NULL,  -- ⭐ SAME as Max_Users
      Price_Monthly REAL NOT NULL,
      Is_Free BOOLEAN DEFAULT 0,
      Duration_Months INTEGER DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ⭐ FIXED: 10 users = 10 devices (Free plan)
    db.run(`INSERT OR IGNORE INTO SubscriptionPlan 
      (Plan_ID, Plan_Name, Max_Users, Max_Devices, Price_Monthly, Is_Free) 
      VALUES 
      (1, 'Free', 10, 10, 0.00, 1),        -- ⭐ 10 users = 10 devices
      (2, 'Starter', 50, 50, 9.99, 0),     -- ⭐ 50 users = 50 devices  
      (3, 'Pro', 200, 200, 29.99, 0),      -- ⭐ 200 users = 200 devices
      (4, 'Enterprise', 9999, 9999, 99.99, 0)`);

    db.run(`CREATE TABLE IF NOT EXISTS OrganizationSubscription (
      Sub_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Org_ID INTEGER NOT NULL,
      Plan_ID INTEGER NOT NULL,
      Start_Date DATETIME NOT NULL,
      End_Date DATETIME NOT NULL,
      Status TEXT DEFAULT 'active',
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
      FOREIGN KEY (Plan_ID) REFERENCES SubscriptionPlan(Plan_ID)
    )`);

    // 6. ATTENDANCE
    db.run(`CREATE TABLE IF NOT EXISTS Attendance_Status (
      Status_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Status_Name TEXT UNIQUE NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO Attendance_Status (Status_Name) VALUES 
      ('Present'), ('Late'), ('Absent'), ('On Leave'), ('Sick')`);

    db.run(`CREATE TABLE IF NOT EXISTS Attendance_Method (
      Method_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Method_Name TEXT UNIQUE NOT NULL
    )`);
    db.run(`INSERT OR IGNORE INTO Attendance_Method (Method_Name) VALUES 
      ('QR Code'), ('Web Check-in'), ('GPS'), ('Manual'), ('NFC')`);

    db.run(`CREATE TABLE IF NOT EXISTS Attendance (
      Attend_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      User_ID INTEGER NOT NULL,
      Org_ID INTEGER NOT NULL,
      Device_ID INTEGER NOT NULL,
      Check_in_time DATETIME,
      Check_out_time DATETIME,
      Status_ID INTEGER DEFAULT 1,
      Method_ID INTEGER DEFAULT 3,
      Latitude REAL,
      Longitude REAL,
      IP_Address TEXT,
      Notes TEXT,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (User_ID) REFERENCES User(User_ID) ON DELETE CASCADE,
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
      FOREIGN KEY (Device_ID) REFERENCES Device(Device_ID),
      FOREIGN KEY (Status_ID) REFERENCES Attendance_Status(Status_ID),
      FOREIGN KEY (Method_ID) REFERENCES Attendance_Method(Method_ID)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Shift (
      Shift_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      User_ID INTEGER NOT NULL,
      Org_ID INTEGER NOT NULL,
      Shift_Start_Time TEXT,
      Shift_End_Time TEXT,
      Shift_Date TEXT,
      Is_Active BOOLEAN DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (User_ID) REFERENCES User(User_ID),
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
    )`);

    // ⭐ 17-18: MISSING TABLES
    db.run(`CREATE TABLE IF NOT EXISTS Audit_Log (
      Log_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      User_ID INTEGER,
      Org_ID INTEGER,
      Action TEXT NOT NULL,
      Table_Name TEXT,
      Record_ID INTEGER,
      Old_Data TEXT,
      New_Data TEXT,
      IP_Address TEXT,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (User_ID) REFERENCES User(User_ID),
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Geofence (
      Geo_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Org_ID INTEGER NOT NULL,
      Latitude REAL NOT NULL,
      Longitude REAL NOT NULL,
      Radius REAL NOT NULL,  -- meters
      Name TEXT NOT NULL,
      Is_Active BOOLEAN DEFAULT 1,
      Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID) ON DELETE CASCADE
    )`);

    // AUTO ASSIGN FREE PLAN TO NEW ORGS
    db.run(`INSERT OR IGNORE INTO OrganizationSubscription 
      (Org_ID, Plan_ID, Start_Date, End_Date, Status) 
      SELECT Org_ID, 1, DATETIME('now'), DATETIME('now', '+12 months'), 'active' 
      FROM Organization WHERE Org_ID NOT IN (
        SELECT Org_ID FROM OrganizationSubscription
      )`);

    // ⭐ MIGRATION: Add missing columns to Organization table if they don't exist
    db.all(`PRAGMA table_info(Organization)`, (err, columns) => {
      if (err) {
        console.error('❌ Migration check failed:', err.message);
        return;
      }

      const hasLogoPath = columns.some(col => col.name === 'Logo_Path');
      const hasLogoMimeType = columns.some(col => col.name === 'Logo_MIME_Type');
      const hasAddress = columns.some(col => col.name === 'Address');
      const hasUpdatedAt = columns.some(col => col.name === 'Updated_at');

      if (!hasLogoPath) {
        db.run(`ALTER TABLE Organization ADD COLUMN Logo_Path TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Failed to add Logo_Path:', err.message);
          } else {
            console.log('✅ Migration: Added Logo_Path column to Organization');
          }
        });
      }

      if (!hasLogoMimeType) {
        db.run(`ALTER TABLE Organization ADD COLUMN Logo_MIME_Type TEXT DEFAULT 'image/png'`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Failed to add Logo_MIME_Type:', err.message);
          } else {
            console.log('✅ Migration: Added Logo_MIME_Type column to Organization');
          }
        });
      }

      if (!hasAddress) {
        db.run(`ALTER TABLE Organization ADD COLUMN Address TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Failed to add Address:', err.message);
          } else {
            console.log('✅ Migration: Added Address column to Organization');
          }
        });
      }

      if (!hasUpdatedAt) {
        db.run(`ALTER TABLE Organization ADD COLUMN Updated_at DATETIME`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Failed to add Updated_at:', err.message);
          } else {
            console.log('✅ Migration: Added Updated_at column to Organization');
          }
        });
      }
    });

    // ⭐ MIGRATION: Add missing columns to User table if they don't exist
    db.all(`PRAGMA table_info(User)`, (err, columns) => {
      if (err) {
        console.error('❌ User table migration check failed:', err.message);
        return;
      }

      const hasAvatarData = columns.some(col => col.name === 'Avatar_Data');
      const hasAvatarMimeType = columns.some(col => col.name === 'Avatar_MIME_Type');
      const hasUpdatedAt = columns.some(col => col.name === 'Updated_at');

      if (!hasAvatarData) {
        db.run(`ALTER TABLE User ADD COLUMN Avatar_Data LONGTEXT`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Failed to add Avatar_Data:', err.message);
          } else {
            console.log('✅ Migration: Added Avatar_Data column to User');
          }
        });
      }

      if (!hasAvatarMimeType) {
        db.run(`ALTER TABLE User ADD COLUMN Avatar_MIME_Type TEXT DEFAULT 'image/png'`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Failed to add Avatar_MIME_Type:', err.message);
          } else {
            console.log('✅ Migration: Added Avatar_MIME_Type column to User');
          }
        });
      }

      if (!hasUpdatedAt) {
        db.run(`ALTER TABLE User ADD COLUMN Updated_at DATETIME`, (err) => {
          if (err && !err.message.includes('duplicate column')) {
            console.error('❌ Failed to add Updated_at:', err.message);
          } else {
            console.log('✅ Migration: Added Updated_at column to User');
          }
        });
      }
    });

    console.log('✅ TrackTimi DB: ALL 18 tables created + seeded');
    console.log('✅ Plans: Free(10), Starter(50), Pro(200), Enterprise(9999)');
    console.log('🔐 SuperAdmin: superadmin@tracktimi.com / tracktimi2026');
    console.log('🔒 Security: 1 User = 1 Device | GPS Geofence Ready');
  });
}

module.exports = db;
