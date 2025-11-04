-- Verify and fix the complete orders table schema
-- Run this in Supabase SQL Editor AFTER fix-orders-restaurant-relationship.sql

-- Check current columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist

-- customer_name
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255);
  END IF;
END $$;

-- phone_number
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN phone_number VARCHAR(20);
  END IF;
END $$;

-- delivery_address (should be JSONB)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_address JSONB;
  END IF;
END $$;

-- special_instructions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'special_instructions'
  ) THEN
    ALTER TABLE orders ADD COLUMN special_instructions TEXT;
  END IF;
END $$;

-- payment_method
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50) DEFAULT 'card';
  END IF;
END $$;

-- payment_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';
  END IF;
END $$;

-- Show final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

DO $$
BEGIN
  RAISE NOTICE '✅ Orders table schema verified and updated!';
END $$;




