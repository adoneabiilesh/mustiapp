-- Simple MustiApp Database Schema
-- This is a minimal schema with just the essential tables

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items table (no restaurant dependency)
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR,
  category VARCHAR,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),
  customer_name VARCHAR,
  phone_number VARCHAR,
  status VARCHAR DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  delivery_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample menu items
INSERT INTO menu_items (name, description, price, category, is_available) VALUES
('Chicken Wings', 'Crispy chicken wings with your choice of sauce', 12.99, 'Appetizers', true),
('Caesar Salad', 'Fresh romaine lettuce with caesar dressing', 8.99, 'Appetizers', true),
('Grilled Chicken', 'Tender grilled chicken breast with vegetables', 16.99, 'Main Courses', true),
('Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 6.99, 'Desserts', true),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 3.99, 'Beverages', true);
