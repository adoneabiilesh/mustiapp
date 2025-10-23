-- Create addons table for managing product customizations
CREATE TABLE IF NOT EXISTS public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL CHECK (type IN ('size', 'addon', 'spice')),
  is_required BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_addons_type ON public.addons(type);
CREATE INDEX IF NOT EXISTS idx_addons_active ON public.addons(is_active);

-- Enable RLS
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all operations for authenticated users (admin dashboard)
CREATE POLICY "Allow all operations for authenticated users" ON public.addons
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_addons_updated_at
  BEFORE UPDATE ON public.addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample addons
INSERT INTO public.addons (name, description, price, type, is_required, is_active) VALUES
  ('Small', 'Small size portion', 0, 'size', true, true),
  ('Medium', 'Medium size portion', 2, 'size', false, true),
  ('Large', 'Large size portion', 4, 'size', false, true),
  ('Extra Cheese', 'Additional cheese topping', 1.5, 'addon', false, true),
  ('Extra Bacon', 'Additional bacon strips', 2, 'addon', false, true),
  ('Extra Vegetables', 'Additional fresh vegetables', 1, 'addon', false, true),
  ('Mild', 'Mild spice level', 0, 'spice', false, true),
  ('Medium Spice', 'Medium spice level', 0, 'spice', false, true),
  ('Hot', 'Hot spice level', 0, 'spice', false, true),
  ('Extra Hot', 'Extra hot spice level', 0, 'spice', false, true)
ON CONFLICT DO NOTHING;

-- Add addons link to sidebar navigation
-- This would need to be added to the Sidebar component in the admin dashboard
