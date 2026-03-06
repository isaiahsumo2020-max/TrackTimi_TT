const db = require('../config/db');

const Lookup = {
  // Initialize lookup tables with default data (run once)
  initialize: (callback) => {
    db.serialize(() => {
      // Organization Types
      db.run(`CREATE TABLE IF NOT EXISTS Organization_Type (
        Org_Type_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Type_Name TEXT UNIQUE NOT NULL
      )`);

      // Insert default org types
      db.run(`INSERT OR IGNORE INTO Organization_Type (Type_Name) VALUES 
        ('School'), ('NGO'), ('Training Center'), ('Company'), ('Government')`);

      // Regions (Liberia-focused)
      db.run(`CREATE TABLE IF NOT EXISTS Region (
        Region_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Region_Name TEXT UNIQUE NOT NULL
      )`);

      db.run(`INSERT OR IGNORE INTO Region (Region_Name) VALUES 
        ('Montserrado'), ('Margibi'), ('Grand Bassa'), ('Nimba'), ('Bong'), ('Lofa')`);

      // User Types (Roles)
      db.run(`CREATE TABLE IF NOT EXISTS User_Type (
        User_Type_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Type_Name TEXT UNIQUE NOT NULL
      )`);

      db.run(`INSERT OR IGNORE INTO User_Type (Type_Name) VALUES 
        ('Admin'), ('Manager'), ('Staff'), ('Student'), ('Supervisor')`);

      // Attendance Status
      db.run(`CREATE TABLE IF NOT EXISTS Attendance_Status (
        Status_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Status_Name TEXT UNIQUE NOT NULL
      )`);

      db.run(`INSERT OR IGNORE INTO Attendance_Status (Status_Name) VALUES 
        ('Present'), ('Late'), ('Absent'), ('On Leave'), ('Early Exit')`);

      // Attendance Method
      db.run(`CREATE TABLE IF NOT EXISTS Attendance_Method (
        Method_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Method_Name TEXT UNIQUE NOT NULL
      )`);

      db.run(`INSERT OR IGNORE INTO Attendance_Method (Method_Name) VALUES 
        ('QR Code'), ('Web Check-in'), ('Mobile GPS'), ('Biometric'), ('Manual')`);

      // Device Info
      db.run(`CREATE TABLE IF NOT EXISTS Device_Info (
        Device_Info_ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Device_Type TEXT,
        OS TEXT,
        Browser TEXT,
        IP_Address TEXT
      )`);

      callback(null, 'Lookup tables initialized');
    });
  },

  // Get ALL lookup data
  getAll: (callback) => {
    db.all(`
      SELECT 'org_types' as type, Org_Type_ID as id, Type_Name as name FROM Organization_Type
      UNION ALL
      SELECT 'regions' as type, Region_ID as id, Region_Name as name FROM Region
      UNION ALL  
      SELECT 'user_types' as type, User_Type_ID as id, Type_Name as name FROM User_Type
      UNION ALL
      SELECT 'attendance_status' as type, Status_ID as id, Status_Name as name FROM Attendance_Status
      UNION ALL
      SELECT 'attendance_method' as type, Method_ID as id, Method_Name as name FROM Attendance_Method
      ORDER BY type, name
    `, callback);
  },

  // Get specific lookup table
  getOrgTypes: (callback) => {
    db.all('SELECT * FROM Organization_Type ORDER BY Type_Name', callback);
  },

  getRegions: (callback) => {
    db.all('SELECT * FROM Region ORDER BY Region_Name', callback);
  },

  getUserTypes: (callback) => {
    db.all('SELECT * FROM User_Type ORDER BY Type_Name', callback);
  },

  getAttendanceStatus: (callback) => {
    db.all('SELECT * FROM Attendance_Status ORDER BY Status_Name', callback);
  },

  getAttendanceMethods: (callback) => {
    db.all('SELECT * FROM Attendance_Method ORDER BY Method_Name', callback);
  },

  // Get by ID (generic)
  getById: (table, id, callback) => {
    const tables = {
      'Organization_Type': 'Org_Type_ID',
      'Region': 'Region_ID',
      'User_Type': 'User_Type_ID',
      'Attendance_Status': 'Status_ID',
      'Attendance_Method': 'Method_ID'
    };
    
    if (!tables[table]) return callback(new Error('Invalid lookup table'));
    
    db.get(`SELECT * FROM ${table} WHERE ${tables[table]} = ?`, [id], callback);
  }
};

module.exports = Lookup;
