-- Add missing columns to menu_items table for enhanced product features

-- Add is_featured column (for recommendations and featured products)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add preparation_time column (in minutes)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS preparation_time INTEGER DEFAULT 0;

-- Add is_available column (product availability)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add restaurant_id column for multi-restaurant support
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

-- Add category column (single category assignment)
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS category VARCHAR(255);

-- Update existing records to set defaults
UPDATE menu_items 
SET is_featured = false 
WHERE is_featured IS NULL;

UPDATE menu_items 
SET is_available = true 
WHERE is_available IS NULL;

UPDATE menu_items 
SET preparation_time = 15 
WHERE preparation_time IS NULL OR preparation_time = 0;

-- Create index on restaurant_id for faster queries
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);

-- Create index on is_featured for recommendations
CREATE INDEX IF NOT EXISTS idx_menu_items_is_featured ON menu_items(is_featured);

-- Create index on is_available for active products
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Grant necessary permissions
GRANT ALL ON menu_items TO authenticated;
GRANT ALL ON menu_items TO anon;


