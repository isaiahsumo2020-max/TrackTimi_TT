-- Migration: Add branding fields to Organization table
-- This adds Logo_Path and Theme_Color columns to store organization branding

-- Add Logo_Path column (stores base64 encoded image or file path)
ALTER TABLE Organization ADD COLUMN Logo_Path TEXT;

-- Add Theme_Color column (stores hex color code like #ff6600)
ALTER TABLE Organization ADD COLUMN Theme_Color TEXT DEFAULT '#ff6600';

-- Add Logo_MIME_Type column to store image type (image/png, image/jpeg, etc)
ALTER TABLE Organization ADD COLUMN Logo_MIME_Type TEXT DEFAULT 'image/png';

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_org_theme_color ON Organization(Theme_Color);
