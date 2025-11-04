-- Fix the old 'address' column conflict in user_addresses table
-- Run this in Supabase SQL Editor

-- Option 1: Drop the old 'address' column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_addresses' AND column_name = 'address'
  ) THEN
    ALTER TABLE user_addresses DROP COLUMN address;
    RAISE NOTICE '✅ Dropped old "address" column';
  END IF;
END $$;

-- Option 2: If there's data in the old column, migrate it to street_address first
-- Uncomment these lines if you need to preserve existing data:
/*
UPDATE user_addresses 
SET street_address = address 
WHERE street_address IS NULL OR street_address = '';

ALTER TABLE user_addresses DROP COLUMN address;
*/

-- Make sure street_address has proper default for existing rows
UPDATE user_addresses 
SET street_address = COALESCE(street_address, '')
WHERE street_address IS NULL;

-- Make sure city has proper default for existing rows
UPDATE user_addresses 
SET city = COALESCE(city, '')
WHERE city IS NULL;

-- Verify the fix
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_addresses'
  AND column_name IN ('address', 'street_address', 'city', 'label')
ORDER BY column_name;

-- Show confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Address column conflict resolved!';
  RAISE NOTICE '📝 The old "address" column has been removed.';
  RAISE NOTICE '🎯 You can now save addresses using "street_address" field.';
END $$;




