-- Migration: Add Notification table for dashboard notifications
-- Purpose: Enable real-time notification system across all dashboards
-- Run: node migrate.js migration_add_notifications.sql

CREATE TABLE IF NOT EXISTS Notification (
    Notify_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    Org_ID INTEGER,
    Title TEXT NOT NULL,
    Message TEXT NOT NULL,
    Type TEXT, -- 'organization', 'user', 'department', 'location', 'system', 'pending'
    Category TEXT DEFAULT 'system',
    Is_Read BOOLEAN DEFAULT 0,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    Read_at DATETIME,
    Action_URL TEXT,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_user ON Notification(User_ID);
CREATE INDEX IF NOT EXISTS idx_notification_org ON Notification(Org_ID);
CREATE INDEX IF NOT EXISTS idx_notification_read ON Notification(Is_Read);

-- Log successful creation
SELECT '✅ Notification table created successfully' as status;
