-- Migration: Add Shift Types and Schedule Tables
-- This migration creates a system to manage shift templates and recurring schedules

-- 1. Create ShiftType table for predefined shifts (Morning, Evening, Night, etc.)
CREATE TABLE IF NOT EXISTS ShiftType (
    ShiftType_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Org_ID INTEGER NOT NULL,
    ShiftType_Name TEXT NOT NULL,           -- "Morning Shift", "Evening Shift", etc.
    Start_Time TEXT NOT NULL,               -- HH:MM format
    End_Time TEXT NOT NULL,                 -- HH:MM format
    Description TEXT,
    Color_Code TEXT DEFAULT '#3b82f6',      -- Blue for default
    Is_Active BOOLEAN DEFAULT 1,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
    UNIQUE(Org_ID, ShiftType_Name)
);

-- 2. Create Schedule table for recurring employee schedules
CREATE TABLE IF NOT EXISTS Schedule (
    Schedule_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Org_ID INTEGER NOT NULL,
    ShiftType_ID INTEGER NOT NULL,
    Schedule_Name TEXT NOT NULL,            -- "Weekly Morning", "Monthly Pattern", etc.
    Start_Date TEXT NOT NULL,               -- YYYY-MM-DD
    End_Date TEXT NOT NULL,                 -- YYYY-MM-DD
    Description TEXT,
    Is_Active BOOLEAN DEFAULT 1,
    Created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Org_ID) REFERENCES Organization(Org_ID),
    FOREIGN KEY (ShiftType_ID) REFERENCES ShiftType(ShiftType_ID)
);

-- 3. Create ScheduleEmployee junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS ScheduleEmployee (
    ScheduleEmployee_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Schedule_ID INTEGER NOT NULL,
    User_ID INTEGER NOT NULL,
    Added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Schedule_ID) REFERENCES Schedule(Schedule_ID) ON DELETE CASCADE,
    FOREIGN KEY (User_ID) REFERENCES User(User_ID),
    UNIQUE(Schedule_ID, User_ID)
);

-- 4. Note: Org_ID should already exist on Shift table from previous migrations
-- If needed, add it manually: ALTER TABLE Shift ADD COLUMN Org_ID INTEGER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shifttype_org ON ShiftType(Org_ID);
CREATE INDEX IF NOT EXISTS idx_schedule_org ON Schedule(Org_ID);
CREATE INDEX IF NOT EXISTS idx_schedule_shifttype ON Schedule(ShiftType_ID);
CREATE INDEX IF NOT EXISTS idx_scheduleemployee_schedule ON ScheduleEmployee(Schedule_ID);
CREATE INDEX IF NOT EXISTS idx_scheduleemployee_user ON ScheduleEmployee(User_ID);
