-- ============================================================================
-- MUSTIAPP DATABASE SCHEMA - FIXED VERSION
-- ============================================================================
-- This file contains the complete database schema for MustiApp
-- Run these commands in your Supabase SQL editor to set up the database

-- ============================================================================
-- USER MANAGEMENT TABLES
-- ============================================================================

-- Users table (simplified - no auth.users reference)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  name VARCHAR NOT NULL UNIQUE,
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
-- SAMPLE DATA
-- ============================================================================

-- Insert default restaurant
INSERT INTO restaurants (id, name, description, address, phone, email, is_active, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'MustiApp Restaurant', 'Your favorite local restaurant', 
 '{"street": "123 Main St", "city": "Your City", "state": "Your State", "zip": "12345", "country": "Your Country"}',
 '+1-555-0123', 'info@mustiapp.com', true, NOW(), NOW());

-- Insert sample categories
INSERT INTO categories (id, name, description, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Appetizers', 'Start your meal with our delicious appetizers', true, NOW(), NOW()),
(gen_random_uuid(), 'Main Courses', 'Hearty main dishes to satisfy your hunger', true, NOW(), NOW()),
(gen_random_uuid(), 'Desserts', 'Sweet treats to end your meal perfectly', true, NOW(), NOW()),
(gen_random_uuid(), 'Beverages', 'Refreshing drinks to complement your meal', true, NOW(), NOW());

-- Insert sample menu items
INSERT INTO menu_items (restaurant_id, name, description, price, categories, is_available, is_featured, created_at, updated_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Chicken Wings', 'Crispy chicken wings with your choice of sauce', 12.99, ARRAY['Appetizers'], true, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 8.99, ARRAY['Appetizers'], true, false, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Grilled Chicken', 'Tender grilled chicken breast with vegetables', 16.99, ARRAY['Main Courses'], true, true, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 6.99, ARRAY['Desserts'], true, false, NOW(), NOW()),
('00000000-0000-0000-0000-000000000001', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, ARRAY['Beverages'], true, false, NOW(), NOW());

-- Insert sample addons
INSERT INTO addons (name, type, price, is_required, is_active, created_at, updated_at) VALUES
('Small', 'size', 0.00, false, true, NOW(), NOW()),
('Medium', 'size', 2.00, false, true, NOW(), NOW()),
('Large', 'size', 4.00, false, true, NOW(), NOW()),
('Extra Cheese', 'extra', 1.50, false, true, NOW(), NOW()),
('Extra Sauce', 'extra', 0.50, false, true, NOW(), NOW()),
('No Spice', 'spice', 0.00, false, true, NOW(), NOW()),
('Medium Spice', 'spice', 0.00, false, true, NOW(), NOW()),
('Extra Spicy', 'spice', 0.00, false, true, NOW(), NOW());
