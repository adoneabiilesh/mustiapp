-- Fix menu_items updated_at trigger issue
-- This migration removes or fixes any triggers that reference updated_at if the column doesn't exist

-- First, check if updated_at column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'menu_items' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.menu_items 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        -- Create index on updated_at
        CREATE INDEX IF NOT EXISTS idx_menu_items_updated_at ON public.menu_items(updated_at);
    END IF;
END $$;

-- Drop any existing triggers that might be causing issues
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;

-- Create a proper updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set updated_at if the column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = TG_TABLE_SCHEMA 
        AND table_name = TG_TABLE_NAME 
        AND column_name = 'updated_at'
    ) THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for menu_items updated_at
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

