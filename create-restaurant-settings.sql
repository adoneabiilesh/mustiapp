-- Create restaurant settings table for dynamic pricing configuration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  
  -- Pricing settings
  delivery_fee DECIMAL(10,2) DEFAULT 2.99,
  minimum_order DECIMAL(10,2) DEFAULT 10.00,
  tax_rate DECIMAL(5,4) DEFAULT 0.10, -- 10% as 0.10
  
  -- Operational settings
  preparation_time INTEGER DEFAULT 30, -- minutes
  delivery_radius DECIMAL(10,2) DEFAULT 5.00, -- km
  is_accepting_orders BOOLEAN DEFAULT true,
  
  -- Business hours (can be JSON for complex schedules)
  business_hours JSONB DEFAULT '{"monday": {"open": "09:00", "close": "22:00"}, "tuesday": {"open": "09:00", "close": "22:00"}, "wednesday": {"open": "09:00", "close": "22:00"}, "thursday": {"open": "09:00", "close": "22:00"}, "friday": {"open": "09:00", "close": "23:00"}, "saturday": {"open": "09:00", "close": "23:00"}, "sunday": {"open": "10:00", "close": "21:00"}}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(restaurant_id)
);

-- Add RLS policies
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for checkout)
CREATE POLICY "Anyone can read restaurant settings"
  ON restaurant_settings
  FOR SELECT
  USING (true);

-- Only authenticated users can manage settings (admins)
CREATE POLICY "Authenticated users can manage settings"
  ON restaurant_settings
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX idx_restaurant_settings_restaurant_id ON restaurant_settings(restaurant_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_restaurant_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_settings_timestamp
  BEFORE UPDATE ON restaurant_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_settings_updated_at();

-- Insert default settings for existing restaurants
INSERT INTO restaurant_settings (restaurant_id, delivery_fee, tax_rate, minimum_order)
SELECT 
  id,
  COALESCE(delivery_fee, 2.99),
  0.10,
  COALESCE(minimum_order, 10.00)
FROM restaurants
ON CONFLICT (restaurant_id) DO NOTHING;

-- Add comment
COMMENT ON TABLE restaurant_settings IS 'Dynamic pricing and operational settings per restaurant';




