-- =====================================================
-- TRACKTIMI COMPLETE DATABASE SCHEMA
-- SQLite3 - Production Ready
-- =====================================================

PRAGMA foreign_keys = ON;

-- 1. Organization Types (Lookup)
CREATE TABLE IF NOT EXISTS Organization_Type (
    Org_Type_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Type_Name TEXT UNIQUE NOT NULL,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default Organization Types
INSERT OR IGNORE INTO Organization_Type (Type_Name) VALUES 
    ('School'), ('NGO'), ('Training Center'), ('Company'), ('Government'), ('Church'), ('Hospital');

-- 2. Regions (Liberia-focused)
CREATE TABLE IF NOT EXISTS Region (
    Region_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Region_Name TEXT UNIQUE NOT NULL,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO Region (Region_Name) VALUES 
    ('Montserrado'), ('Margibi'), ('Grand Bassa'), ('Nimba'), ('Bong'), ('Lofa'), 
    ('Bomi'), ('Grand Gedeh'), ('Rivercess'), ('Grand Cape Mount');

-- 3. Organizations
CREATE TABLE IF NOT EXISTS Organization (
    Org_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Org_Name TEXT NOT NULL,
    Org_Domain TEXT UNIQUE,
    Org_Type_ID INTEGER,
    Region_ID INTEGER,
    Theme_Color TEXT DEFAULT '#f2a409',
    Address TEXT,
    Num_of_Employee INTEGER,
    Phone_Num TEXT,
    Email TEXT,
    Is_Active BOOLEAN DEFAULT 1,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Org_Type_ID) REFERENCES Organization_Type(Org_Type_ID),
    FOREIGN KEY (Region_ID) REFERENCES Region(Region_ID)
);

-- 4. User Types / Roles
CREATE TABLE IF NOT EXISTS User_Type (
    User_Type_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Type_Name TEXT UNIQUE NOT NULL,
    Can_Checkin BOOLEAN DEFAULT 1,
    Can_Manage_Users BOOLEAN DEFAULT 0,
    Can_View_Reports BOOLEAN DEFAULT 0,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO User_Type (Type_Name, Can_Checkin, Can_Manage_Users, Can_View_Reports) VALUES 
    ('Admin', 1, 1, 1),
    ('Manager', 1, 1, 1),
    ('Staff', 1, 0, 0),
    ('Student', 1, 0, 0),
    ('Supervisor', 1, 0, 1);

-- 5. Users
CREATE TABLE IF NOT EXISTS User (
    User_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    First_Name TEXT NOT NULL,
    SurName TEXT NOT NULL,
    Last_Name TEXT,
    Org_ID INTEGER,
    Org_Domain TEXT,
    User_Type_ID INTEGER DEFAULT 3, -- Default: Staff
    Email TEXT UNIQUE,
    Phone_Num TEXT,
    Dep_ID INTEGER,
    Job_Title TEXT,
    Password TEXT,
    Is_Active BOOLEAN DEFAULT 1,
    Last_Checkin DATETIME,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
    FOREIGN KEY (User_Type_ID) REFERENCES User_Type(User_Type_ID)
);

-- 6. Departments
CREATE TABLE IF NOT EXISTS Department (
    Dep_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Depart_Name TEXT NOT NULL,
    Org_ID INTEGER NOT NULL,
    Manager_ID INTEGER,
    Is_Active BOOLEAN DEFAULT 1,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
    FOREIGN KEY (Manager_ID) REFERENCES User(User_ID)
);

-- 7. Shifts
CREATE TABLE IF NOT EXISTS Shift (
    Shift_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    Shift_Start_Time TEXT NOT NULL, -- HH:MM format
    Shift_End_Time TEXT NOT NULL,   -- HH:MM format
    Shift_Date TEXT NOT NULL,       -- YYYY-MM-DD
    Is_Active BOOLEAN DEFAULT 1,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID)
);

-- 8. Attendance Status (Lookup)
CREATE TABLE IF NOT EXISTS Attendance_Status (
    Status_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Status_Name TEXT UNIQUE NOT NULL,
    Color_Code TEXT DEFAULT '#28a745', -- Green for Present
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO Attendance_Status (Status_Name, Color_Code) VALUES 
    ('Present', '#28a745'),
    ('Late', '#ffc107'),
    ('Absent', '#dc3545'),
    ('On Leave', '#17a2b8'),
    ('Early Exit', '#fd7e14');

-- 9. Attendance Method (Lookup)
CREATE TABLE IF NOT EXISTS Attendance_Method (
    Method_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Method_Name TEXT UNIQUE NOT NULL,
    Icon TEXT,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO Attendance_Method (Method_Name, Icon) VALUES 
    ('QR Code', 'qrcode'),
    ('Web Check-in', 'web'),
    ('Mobile GPS', 'location'),
    ('Biometric', 'fingerprint'),
    ('Manual', 'user');

-- 10. Device Info
CREATE TABLE IF NOT EXISTS Device_Info (
    Device_Info_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Device_Type TEXT,
    OS TEXT,
    Browser TEXT,
    IP_Address TEXT,
    User_Agent TEXT,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Attendance Records (CORE TABLE)
CREATE TABLE IF NOT EXISTS Attendance (
    Attend_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    Check_in_time DATETIME NOT NULL,
    Check_out_time DATETIME,
    Status_ID INTEGER DEFAULT 1, -- Present
    Method_ID INTEGER DEFAULT 2, -- Web Check-in
    Latitude REAL,
    Longitude REAL,
    Device_Info_ID INTEGER,
    Notes TEXT,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Status_ID) REFERENCES Attendance_Status(Status_ID),
    FOREIGN KEY (Method_ID) REFERENCES Attendance_Method(Method_ID),
    FOREIGN KEY (Device_Info_ID) REFERENCES Device_Info(Device_Info_ID)
);

-- 12. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_org ON User(Org_ID);
CREATE INDEX IF NOT EXISTS idx_user_email ON User(Email);
CREATE INDEX IF NOT EXISTS idx_attendance_user ON Attendance(User_ID);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON Attendance(Check_in_time);
CREATE INDEX IF NOT EXISTS idx_shift_user ON Shift(User_ID);
CREATE INDEX IF NOT EXISTS idx_shift_date ON Shift(Shift_Date);

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Sample Organization
INSERT OR IGNORE INTO Organization (Org_Name, Org_Type_ID, Region_ID, Num_of_Employee, Phone_Num, Email) VALUES 
    ('Liberia High School', 1, 1, 250, '+231-XXX-XXX-XXXX', 'admin@libhs.edu.lr');

-- Sample Admin User
INSERT OR IGNORE INTO User (First_Name, SurName, Email, Password, Org_ID, Role_ID) VALUES 
    ('Admin', 'User', 'admin@libhs.edu.lr', 'hashed_password', 1, 1);
