-- Migration: Add Org_Domain column to Organization table
-- Run this after updating the schema.sql

-- Add the Org_Domain column if it doesn't exist
ALTER TABLE Organization ADD COLUMN Org_Domain TEXT UNIQUE;

-- Optional: Update existing organizations with a default domain
-- You can run this manually or update specific organizations
-- UPDATE Organization SET Org_Domain = 'your-org-domain.com' WHERE Org_ID = 1;