-- ============================================================================
-- MUSTIAPP DATABASE SCHEMA
-- ============================================================================
-- This file contains the complete database schema for MustiApp
-- Run these commands in your Supabase SQL editor to set up the database

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  avatar VARCHAR,
  phone VARCHAR,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User notification settings
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{
    "orderUpdates": true,
    "promotions": true,
    "reminders": true,
    "general": true,
    "sound": true,
    "vibration": true
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User push notification tokens
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR NOT NULL,
  platform VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ============================================================================
-- RESTAURANT & MENU TABLES
-- ============================================================================

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  address JSONB NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  image_url VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  image_url VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR,
  categories TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  preparation_time INTEGER DEFAULT 15, -- minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addons table
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL, -- 'size', 'extra', 'sauce', etc.
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ORDER MANAGEMENT TABLES
-- ============================================================================

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_name VARCHAR,
  phone_number VARCHAR,
  status VARCHAR DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  delivery_address JSONB NOT NULL,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  driver_location JSONB,
  payment_intent_id VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  customizations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order updates table (for real-time tracking)
CREATE TABLE IF NOT EXISTS order_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL,
  message TEXT NOT NULL,
  is_customer_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FAVORITES & SAVED ORDERS TABLES
-- ============================================================================

-- Favorite items table
CREATE TABLE IF NOT EXISTS favorite_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  customizations JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_ordered TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, menu_item_id)
);

-- Saved orders table
CREATE TABLE IF NOT EXISTS saved_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved order items table
CREATE TABLE IF NOT EXISTS saved_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_order_id UUID REFERENCES saved_orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  customizations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS & RATINGS TABLES
-- ============================================================================

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review responses table
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PROMOTIONS & LOYALTY TABLES
-- ============================================================================

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  discount_type VARCHAR NOT NULL, -- 'percentage', 'fixed', 'free_item'
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loyalty points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type VARCHAR NOT NULL, -- 'earned', 'redeemed', 'expired'
  description TEXT,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Order indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Menu indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_categories ON menu_items USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON menu_items(is_available);

-- Favorites indexes
CREATE INDEX IF NOT EXISTS idx_favorite_items_user_id ON favorite_items(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_items_menu_item_id ON favorite_items(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_saved_orders_user_id ON saved_orders(user_id);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- User notification settings
CREATE POLICY "Users can manage own notification settings" ON user_notification_settings 
  FOR ALL USING (auth.uid() = user_id);

-- User tokens
CREATE POLICY "Users can manage own tokens" ON user_tokens 
  FOR ALL USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users can view own orders" ON orders 
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Users can create orders" ON orders 
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Order items
CREATE POLICY "Users can view own order items" ON order_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

-- Order updates
CREATE POLICY "Users can view own order updates" ON order_updates 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_updates.order_id AND orders.customer_id = auth.uid())
  );

-- Favorites
CREATE POLICY "Users can manage own favorites" ON favorite_items 
  FOR ALL USING (auth.uid() = user_id);

-- Saved orders
CREATE POLICY "Users can manage own saved orders" ON saved_orders 
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved order items" ON saved_order_items 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM saved_orders WHERE saved_orders.id = saved_order_items.saved_order_id AND saved_orders.user_id = auth.uid())
  );

-- Reviews
CREATE POLICY "Users can view all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON reviews 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews 
  FOR UPDATE USING (auth.uid() = user_id);

-- Public tables (restaurants, categories, menu_items, addons, promotions)
CREATE POLICY "Anyone can view restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view menu items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view addons" ON addons FOR SELECT USING (true);
CREATE POLICY "Anyone can view promotions" ON promotions FOR SELECT USING (true);

-- Review responses
CREATE POLICY "Anyone can view review responses" ON review_responses FOR SELECT USING (true);

-- Loyalty
CREATE POLICY "Users can view own loyalty data" ON loyalty_points 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions 
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_updates_updated_at BEFORE UPDATE ON order_updates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_order_items_updated_at BEFORE UPDATE ON saved_order_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create order update when status changes
CREATE OR REPLACE FUNCTION create_order_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_updates (order_id, status, message, is_customer_visible)
    VALUES (
      NEW.id,
      NEW.status,
      'Order status updated to ' || NEW.status,
      true
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for order status updates
CREATE TRIGGER order_status_update_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_order_update();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert default restaurant
INSERT INTO restaurants (id, name, description, address, phone, email, is_active, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'MustiApp Restaurant', 'Your favorite local restaurant', 
 '{"street": "123 Main St", "city": "Your City", "state": "Your State", "zip": "12345", "country": "Your Country"}',
 '+1-555-0123', 'info@mustiapp.com', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Appetizers', 'Start your meal with our delicious appetizers', true, NOW(), NOW()),
(gen_random_uuid(), 'Main Courses', 'Hearty main dishes to satisfy your hunger', true, NOW(), NOW()),
(gen_random_uuid(), 'Desserts', 'Sweet treats to end your meal perfectly', true, NOW(), NOW()),
(gen_random_uuid(), 'Beverages', 'Refreshing drinks to complement your meal', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, categories, is_available, is_featured, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Chicken Wings', 'Crispy chicken wings with your choice of sauce', 12.99, ARRAY['Appetizers'], true, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 8.99, ARRAY['Appetizers'], true, false, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Grilled Chicken', 'Tender grilled chicken breast with vegetables', 16.99, ARRAY['Main Courses'], true, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 6.99, ARRAY['Desserts'], true, false, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, ARRAY['Beverages'], true, false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample addons
INSERT INTO addons (name, type, price, is_required, is_active, created_at, updated_at) VALUES
('Small', 'size', 0.00, false, true, NOW(), NOW()),
('Medium', 'size', 2.00, false, true, NOW(), NOW()),
('Large', 'size', 4.00, false, true, NOW(), NOW()),
('Extra Cheese', 'extra', 1.50, false, true, NOW(), NOW()),
('Extra Sauce', 'extra', 0.50, false, true, NOW(), NOW()),
('No Spice', 'spice', 0.00, false, true, NOW(), NOW()),
('Medium Spice', 'spice', 0.00, false, true, NOW(), NOW()),
('Extra Spicy', 'spice', 0.00, false, true, NOW(), NOW())
ON CONFLICT DO NOTHING;
