-- Add missing columns to User table to match schema
ALTER TABLE User ADD COLUMN Last_Name TEXT;
ALTER TABLE User ADD COLUMN Org_Domain TEXT;
ALTER TABLE User ADD COLUMN Is_Active BOOLEAN DEFAULT 1;
ALTER TABLE User ADD COLUMN Last_Checkin DATETIME;
ALTER TABLE User ADD COLUMN Updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_org_domain ON User(Org_Domain);
CREATE INDEX IF NOT EXISTS idx_user_active ON User(Is_Active);