-- =====================================================
-- MIGRATION: Excuse/Leave Request System
-- Adds: User excuse submissions and admin approval workflow
-- =====================================================

-- 1. Create Excuse/Leave Request table
CREATE TABLE IF NOT EXISTS Excuse (
    Excuse_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    Org_ID INTEGER NOT NULL,
    Attend_ID INTEGER,
    Excuse_Type TEXT NOT NULL, -- 'LATE', 'ABSENT', 'EARLY_EXIT', 'LEAVE'
    Reason TEXT NOT NULL,
    Attachment_Data BLOB,
    Attachment_MIME_Type TEXT,
    Attachment_Name TEXT,
    Status TEXT DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED'
    Approved_By INTEGER,
    Approval_Notes TEXT,
    Approved_At DATETIME,
    Date_Affected TEXT NOT NULL, -- YYYY-MM-DD of affected attendance
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
    FOREIGN KEY (Attend_ID) REFERENCES Attendance(Attend_ID),
    FOREIGN KEY (Approved_By) REFERENCES User(User_ID)
);

-- 2. Update Attendance table to link to Excuse
ALTER TABLE Attendance ADD COLUMN Excuse_ID INTEGER;
ALTER TABLE Attendance ADD FOREIGN KEY (Excuse_ID) REFERENCES Excuse(Excuse_ID);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_excuse_user ON Excuse(User_ID);
CREATE INDEX IF NOT EXISTS idx_excuse_org ON Excuse(Org_ID);
CREATE INDEX IF NOT EXISTS idx_excuse_status ON Excuse(Status);
CREATE INDEX IF NOT EXISTS idx_excuse_created ON Excuse(Created_at);
CREATE INDEX IF NOT EXISTS idx_excuse_date ON Excuse(Date_Affected);

-- 4. Update Notification table to support excuse references
ALTER TABLE Notification ADD COLUMN Excuse_ID INTEGER;
ALTER TABLE Notification ADD FOREIGN KEY (Excuse_ID) REFERENCES Excuse(Excuse_ID);

-- 5. Add indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_notification_unread ON Notification(Is_Read) WHERE Is_Read = 0;
CREATE INDEX IF NOT EXISTS idx_notification_user_read ON Notification(User_ID, Is_Read);
