-- ============================================================================
-- COMPLETE DATABASE SCHEMA - Run this to fix everything
-- ============================================================================

-- Drop existing tables if needed (CAUTION: This will delete data)
-- Uncomment only if you want to start fresh
-- DROP TABLE IF EXISTS special_offer_items CASCADE;
-- DROP TABLE IF EXISTS special_offers CASCADE;
-- DROP TABLE IF EXISTS order_updates CASCADE;
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS favorite_items CASCADE;
-- DROP TABLE IF EXISTS addons CASCADE;
-- DROP TABLE IF EXISTS menu_items CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS user_preferences CASCADE;
-- DROP TABLE IF EXISTS restaurants CASCADE;

-- ============================================================================
-- 1. RESTAURANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  cuisine_type VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  cover_image_url TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  delivery_radius DECIMAL(10, 2) DEFAULT 5.0,
  delivery_fee DECIMAL(10, 2) DEFAULT 0.0,
  minimum_order DECIMAL(10, 2) DEFAULT 0.0,
  preparation_time INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. MENU_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  categories TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 15,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 4. ADDONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.addons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'extra',
  price DECIMAL(10, 2) NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. USER_PREFERENCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  profile_photo_url TEXT,
  notification_preferences JSONB DEFAULT '{"order_updates": true, "promotional_offers": true, "new_menu_items": false, "push_notifications": true, "email_notifications": true, "sms_notifications": false}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  favorite_cuisines TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 6. ORDERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255),
  phone_number VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending',
  total DECIMAL(10, 2) NOT NULL,
  delivery_address JSONB,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  driver_location JSONB,
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 7. ORDER_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  customizations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. ORDER_UPDATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.order_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) NOT NULL,
  message TEXT,
  is_customer_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. FAVORITE_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.favorite_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  customizations JSONB DEFAULT '[]',
  notes TEXT,
  last_ordered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- ============================================================================
-- 10. SPECIAL_OFFERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.special_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  original_price DECIMAL(10, 2) NOT NULL,
  offer_price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (((original_price - offer_price) / original_price * 100)) STORED,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  terms TEXT,
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 11. SPECIAL_OFFER_ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.special_offer_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  special_offer_id UUID REFERENCES public.special_offers(id) ON DELETE CASCADE NOT NULL,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(special_offer_id, menu_item_id)
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);
CREATE INDEX IF NOT EXISTS idx_restaurants_active ON public.restaurants(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available, is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_categories ON public.menu_items USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item ON public.order_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_favorite_items_user ON public.favorite_items(user_id);
CREATE INDEX IF NOT EXISTS idx_special_offers_restaurant ON public.special_offers(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_special_offers_active ON public.special_offers(is_active, valid_until);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offer_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - RESTAURANTS
-- ============================================================================
DROP POLICY IF EXISTS "Public can view active restaurants" ON public.restaurants;
CREATE POLICY "Public can view active restaurants" ON public.restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage restaurants" ON public.restaurants;
CREATE POLICY "Authenticated users can manage restaurants" ON public.restaurants FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - CATEGORIES
-- ============================================================================
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.categories;
CREATE POLICY "Authenticated users can manage categories" ON public.categories FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - MENU_ITEMS
-- ============================================================================
DROP POLICY IF EXISTS "Public can view menu items" ON public.menu_items;
CREATE POLICY "Public can view menu items" ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage menu items" ON public.menu_items;
CREATE POLICY "Authenticated users can manage menu items" ON public.menu_items FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - ADDONS
-- ============================================================================
DROP POLICY IF EXISTS "Public can view addons" ON public.addons;
CREATE POLICY "Public can view addons" ON public.addons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage addons" ON public.addons;
CREATE POLICY "Authenticated users can manage addons" ON public.addons FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - USER_PREFERENCES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - ORDERS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Authenticated users can manage all orders" ON public.orders;
CREATE POLICY "Authenticated users can manage all orders" ON public.orders FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - ORDER_ITEMS
-- ============================================================================
DROP POLICY IF EXISTS "Public can view order items" ON public.order_items;
CREATE POLICY "Public can view order items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage order items" ON public.order_items;
CREATE POLICY "Authenticated users can manage order items" ON public.order_items FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - ORDER_UPDATES
-- ============================================================================
DROP POLICY IF EXISTS "Public can view order updates" ON public.order_updates;
CREATE POLICY "Public can view order updates" ON public.order_updates FOR SELECT USING (is_customer_visible = true);

DROP POLICY IF EXISTS "Authenticated users can manage order updates" ON public.order_updates;
CREATE POLICY "Authenticated users can manage order updates" ON public.order_updates FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - FAVORITE_ITEMS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own favorites" ON public.favorite_items;
CREATE POLICY "Users can view own favorites" ON public.favorite_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own favorites" ON public.favorite_items;
CREATE POLICY "Users can manage own favorites" ON public.favorite_items FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES - SPECIAL_OFFERS
-- ============================================================================
DROP POLICY IF EXISTS "Public can view active special offers" ON public.special_offers;
CREATE POLICY "Public can view active special offers" ON public.special_offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage special offers" ON public.special_offers;
CREATE POLICY "Authenticated users can manage special offers" ON public.special_offers FOR ALL TO authenticated USING (true);

-- ============================================================================
-- RLS POLICIES - SPECIAL_OFFER_ITEMS
-- ============================================================================
DROP POLICY IF EXISTS "Public can view special offer items" ON public.special_offer_items;
CREATE POLICY "Public can view special offer items" ON public.special_offer_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage special offer items" ON public.special_offer_items;
CREATE POLICY "Authenticated users can manage special offer items" ON public.special_offer_items FOR ALL TO authenticated USING (true);

-- ============================================================================
-- CREATE UPDATE TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_restaurants_updated_at ON public.restaurants;
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_menu_items_updated_at ON public.menu_items;
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SETUP STORAGE BUCKETS (if not exists)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('promotion-images', 'promotion-images', true),
  ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can view promotion images" ON storage.objects;
CREATE POLICY "Public can view promotion images" ON storage.objects FOR SELECT USING (bucket_id = 'promotion-images');

DROP POLICY IF EXISTS "Authenticated users can upload promotion images" ON storage.objects;
CREATE POLICY "Authenticated users can upload promotion images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'promotion-images');

DROP POLICY IF EXISTS "Users can view profile photos" ON storage.objects;
CREATE POLICY "Users can view profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users can upload own profile photo" ON storage.objects;
CREATE POLICY "Users can upload own profile photo" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-photos');

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 
  'restaurants' as table_name, COUNT(*) as row_count FROM public.restaurants
UNION ALL
SELECT 'categories', COUNT(*) FROM public.categories
UNION ALL
SELECT 'menu_items', COUNT(*) FROM public.menu_items
UNION ALL
SELECT 'addons', COUNT(*) FROM public.addons
UNION ALL
SELECT 'orders', COUNT(*) FROM public.orders
UNION ALL
SELECT 'order_items', COUNT(*) FROM public.order_items
UNION ALL
SELECT 'favorite_items', COUNT(*) FROM public.favorite_items
UNION ALL
SELECT 'special_offers', COUNT(*) FROM public.special_offers
UNION ALL
SELECT 'special_offer_items', COUNT(*) FROM public.special_offer_items
UNION ALL
SELECT 'user_preferences', COUNT(*) FROM public.user_preferences
ORDER BY table_name;

-- Show available vs total menu items
SELECT 
  '✅ Database schema complete!' as status,
  (SELECT COUNT(*) FROM public.menu_items) as total_menu_items,
  (SELECT COUNT(*) FROM public.menu_items WHERE is_available = true) as available_menu_items,
  (SELECT COUNT(*) FROM public.restaurants WHERE is_active = true) as active_restaurants;




