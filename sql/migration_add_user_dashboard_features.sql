-- =====================================================
-- MIGRATION: User Dashboard Features
-- Adds: Clock-in window settings, Notifications system, Clock-out alerts
-- =====================================================

-- 1. Add clock-in window settings to Organization table
-- These columns allow admins to configure how early users can clock in
ALTER TABLE Organization ADD COLUMN Clock_In_Window_Minutes INTEGER DEFAULT 30;  -- Minutes after shift start time
ALTER TABLE Organization ADD COLUMN Clock_Out_Alert_Minutes INTEGER DEFAULT 15;  -- Minutes before shift end to alert

-- 2. Create Notifications table for storing user alerts and updates
CREATE TABLE IF NOT EXISTS Notification (
    Notify_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    Org_ID INTEGER NOT NULL,
    Title TEXT NOT NULL,
    Message TEXT NOT NULL,
    Type TEXT DEFAULT 'info', -- 'info', 'warning', 'alert', 'urgent'
    Category TEXT DEFAULT 'general', -- 'schedule', 'attendance', 'clock_out', 'system', 'general'
    Is_Read BOOLEAN DEFAULT 0,
    Action_URL TEXT,
    Related_Record_ID INTEGER,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    Read_at DATETIME,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
);

-- 3. Create Clock_Out_Alert table to track sent alerts (prevent duplicates)
CREATE TABLE IF NOT EXISTS Clock_Out_Alert (
    Alert_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    Attend_ID INTEGER NOT NULL,
    Shift_ID INTEGER,
    Alert_Sent_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    Notif_ID INTEGER,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Attend_ID) REFERENCES Attendance(Attend_ID),
    FOREIGN KEY (Shift_ID) REFERENCES Shift(Shift_ID),
    FOREIGN KEY (Notif_ID) REFERENCES Notification(Notify_ID)
);

-- 4. Update Attendance table to add fields for late clock-in tracking
ALTER TABLE Attendance ADD COLUMN Is_Late_Clock_In BOOLEAN DEFAULT 0;  -- Clocked in after shift start
ALTER TABLE Attendance ADD COLUMN Clock_In_Window_Used BOOLEAN DEFAULT 0;  -- Used organization's clock-in window
ALTER TABLE Attendance ADD COLUMN Minutes_Late INTEGER DEFAULT 0;  -- How many minutes late

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(User_ID);
CREATE INDEX IF NOT EXISTS idx_notification_org ON Notification(Org_ID);
CREATE INDEX IF NOT EXISTS idx_notification_created ON Notification(Created_at);
CREATE INDEX IF NOT EXISTS idx_notification_is_read ON Notification(Is_Read);
CREATE INDEX IF NOT EXISTS idx_clock_out_alert_user ON Clock_Out_Alert(User_ID);
CREATE INDEX IF NOT EXISTS idx_clock_out_alert_attend ON Clock_Out_Alert(Attend_ID);

-- 6. Create view for active user shift today (helpful for frontend)
CREATE VIEW IF NOT EXISTS UserTodayShift AS
SELECT 
    S.Shift_ID,
    S.User_ID,
    U.First_Name,
    U.SurName,
    U.Email,
    S.Shift_Date,
    S.Shift_Start_Time,
    S.Shift_End_Time,
    S.Is_Active,
    CASE 
        WHEN datetime('now', 'localtime') >= datetime(S.Shift_Date || ' ' || S.Shift_Start_Time)
        AND datetime('now', 'localtime') <= datetime(S.Shift_Date || ' ' || S.Shift_End_Time)
        THEN 1
        ELSE 0
    END as Is_Active_Now
FROM Shift S
JOIN User U ON S.User_ID = U.User_ID
WHERE date(S.Shift_Date) = date('now', 'localtime')
AND S.Is_Active = 1;

-- 7. Create view for user attendance history with shift info
CREATE VIEW IF NOT EXISTS UserAttendanceWithShift AS
SELECT 
    A.Attend_ID,
    A.User_ID,
    U.First_Name,
    U.SurName,
    A.Check_in_time,
    A.Check_out_time,
    CASE 
        WHEN A.Check_out_time IS NULL THEN 'ACTIVE'
        ELSE 'COMPLETED'
    END as Session_Status,
    CAST((julianday(COALESCE(A.Check_out_time, 'now')) - julianday(A.Check_in_time)) * 24 * 60 AS INTEGER) as Duration_Minutes,
    AS_Status.Status_Name,
    AS_Status.Color_Code,
    A.Is_Late_Clock_In,
    A.Minutes_Late
FROM Attendance A
JOIN User U ON A.User_ID = U.User_ID
LEFT JOIN Attendance_Status AS_Status ON A.Status_ID = AS_Status.Status_ID
ORDER BY A.Check_in_time DESC;
