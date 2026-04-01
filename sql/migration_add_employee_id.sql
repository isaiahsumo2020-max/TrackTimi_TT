-- Add Employee_ID column to User table for employee tracking
ALTER TABLE User ADD COLUMN Employee_ID TEXT;

-- Create index for faster employee ID lookups
CREATE INDEX IF NOT EXISTS idx_user_employee_id ON User(Employee_ID);
