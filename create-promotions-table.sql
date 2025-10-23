-- Create promotions table for special offers and promotions
CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discount DECIMAL(10,2) NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  image_url TEXT,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create RLS policies for promotions
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active promotions
CREATE POLICY "Public can view active promotions" ON public.promotions
  FOR SELECT USING (is_active = true AND valid_until > NOW());

-- Allow authenticated users to manage promotions (admin only)
CREATE POLICY "Authenticated users can manage promotions" ON public.promotions
  FOR ALL USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_promotions_active ON public.promotions(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_promotions_created_by ON public.promotions(created_by);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_promotions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION update_promotions_updated_at();

-- Insert sample promotions
INSERT INTO public.promotions (title, description, discount, discount_type, image_url, valid_until, terms) VALUES
('New Customer Special', 'Get 20% off your first order with code WELCOME20', 20.00, 'percentage', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', '2024-12-31 23:59:59+00', 'Valid for new customers only. Minimum order €15.'),
('Free Delivery Weekend', 'Enjoy free delivery on all orders this weekend', 5.00, 'fixed', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', '2024-12-15 23:59:59+00', 'Valid on weekends only. No minimum order required.'),
('Holiday Special', '25% off all orders over €30', 25.00, 'percentage', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', '2024-12-25 23:59:59+00', 'Valid until Christmas. Minimum order €30 required.');
