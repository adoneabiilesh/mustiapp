-- Fix the orders table to add restaurant_id foreign key relationship
-- Run this in Supabase SQL Editor

-- Add restaurant_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'restaurant_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN restaurant_id UUID;
    RAISE NOTICE '✅ Added restaurant_id column to orders table';
  END IF;
END $$;

-- Drop existing foreign key constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'orders_restaurant_id_fkey' 
    AND table_name = 'orders'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_restaurant_id_fkey;
    RAISE NOTICE '🔄 Dropped old foreign key constraint';
  END IF;
END $$;

-- Add foreign key constraint to restaurants table
ALTER TABLE orders 
ADD CONSTRAINT orders_restaurant_id_fkey 
FOREIGN KEY (restaurant_id) 
REFERENCES restaurants(id) 
ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);

-- Verify the relationship exists
SELECT 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='orders'
  AND kcu.column_name = 'restaurant_id';

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Foreign key relationship between orders and restaurants created!';
  RAISE NOTICE '📝 Orders can now reference restaurants properly.';
END $$;




