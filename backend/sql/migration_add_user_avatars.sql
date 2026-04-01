-- Migration: Add user avatar fields
-- This adds Avatar_Data and Avatar_MIME_Type columns to store user profile avatars

-- Add Avatar_Data column (stores base64 encoded image)
ALTER TABLE User ADD COLUMN Avatar_Data TEXT;

-- Add Avatar_MIME_Type column to store image type (image/png, image/jpeg, etc)
ALTER TABLE User ADD COLUMN Avatar_MIME_Type TEXT DEFAULT 'image/png';

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_avatar ON User(User_ID);
