-- Add ALL missing columns to user_addresses table
-- Run this in Supabase SQL Editor

-- Add label column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'label'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN label VARCHAR(50) DEFAULT 'Home';
  END IF;
END $$;

-- Add street_address column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN street_address TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add city column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'city'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN city VARCHAR(100) NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add apartment column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'apartment'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN apartment VARCHAR(100);
  END IF;
END $$;

-- Add state column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'state'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN state VARCHAR(100);
  END IF;
END $$;

-- Add postal_code column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'postal_code'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN postal_code VARCHAR(20);
  END IF;
END $$;

-- Add country column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'country'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN country VARCHAR(100) DEFAULT 'Italy';
  END IF;
END $$;

-- Add delivery_instructions column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'delivery_instructions'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN delivery_instructions TEXT;
  END IF;
END $$;

-- Add contact_name column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'contact_name'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN contact_name VARCHAR(100);
  END IF;
END $$;

-- Add contact_phone column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'contact_phone'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN contact_phone VARCHAR(20);
  END IF;
END $$;

-- Add latitude column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
END $$;

-- Add longitude column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
END $$;

-- Add is_default column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'is_default'
  ) THEN
    ALTER TABLE user_addresses ADD COLUMN is_default BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_addresses'
ORDER BY ordinal_position;

-- Show confirmation message
DO $$
BEGIN
  RAISE NOTICE '✅ All columns have been added to user_addresses table!';
  RAISE NOTICE '📝 You can now save addresses in the app.';
END $$;

