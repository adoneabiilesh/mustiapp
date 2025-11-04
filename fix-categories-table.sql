-- Fix categories table by adding missing columns
-- This script adds the missing is_active column to the categories table

-- Add is_active column if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add image_url column if it doesn't exist  
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url VARCHAR;

-- Add created_at column if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at column if it doesn't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
