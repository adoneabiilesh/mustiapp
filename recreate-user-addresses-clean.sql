-- CLEAN RECREATION of user_addresses table
-- WARNING: This will delete all existing addresses!
-- Run this in Supabase SQL Editor

-- Drop everything related to user_addresses
DROP TRIGGER IF EXISTS ensure_one_default_address ON user_addresses;
DROP TRIGGER IF EXISTS update_user_addresses_timestamp ON user_addresses;
DROP FUNCTION IF EXISTS ensure_single_default_address();
DROP FUNCTION IF EXISTS update_user_addresses_updated_at();
DROP TABLE IF EXISTS user_addresses CASCADE;

-- Create the table fresh with correct schema
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Address details
  label VARCHAR(50) DEFAULT 'Home',
  street_address TEXT NOT NULL,
  apartment VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Italy',
  
  -- Delivery instructions
  delivery_instructions TEXT,
  
  -- Contact
  contact_name VARCHAR(100),
  contact_phone VARCHAR(20),
  
  -- Location coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Metadata
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses"
  ON user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default) WHERE is_default = true;

-- Triggers
CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_addresses_timestamp
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_user_addresses_updated_at();

CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE user_addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_one_default_address
  BEFORE INSERT OR UPDATE ON user_addresses
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_address();

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ user_addresses table recreated successfully!';
  RAISE NOTICE '📝 All old data has been removed.';
  RAISE NOTICE '🎯 You can now save addresses in the app.';
END $$;

-- Show final schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_addresses'
ORDER BY ordinal_position;




