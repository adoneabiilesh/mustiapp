-- Fix menu_items table by adding missing columns
-- This script adds the missing category column to the menu_items table

-- Add category column if it doesn't exist
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category VARCHAR;

-- Add other potentially missing columns
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url VARCHAR;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
