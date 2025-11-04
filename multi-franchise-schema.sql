-- Multi-Franchise Restaurant Platform Database Schema

-- ============================================================================
-- RESTAURANT MANAGEMENT
-- ============================================================================

-- Restaurants table (main restaurant entities)
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    cover_image_url TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    delivery_radius INTEGER DEFAULT 5, -- in km
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    minimum_order DECIMAL(10, 2) DEFAULT 0,
    preparation_time INTEGER DEFAULT 30, -- in minutes
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    commission_rate DECIMAL(5, 2) DEFAULT 15.00, -- platform commission %
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant operating hours
CREATE TABLE IF NOT EXISTS restaurant_hours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant admins (restaurant owners/managers)
CREATE TABLE IF NOT EXISTS restaurant_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'manager', -- owner, manager, staff
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MENU MANAGEMENT (Per Restaurant)
-- ============================================================================

-- Categories per restaurant
CREATE TABLE IF NOT EXISTS restaurant_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menu items per restaurant
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES restaurant_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    preparation_time INTEGER DEFAULT 15, -- in minutes
    calories INTEGER,
    allergens TEXT[],
    dietary_info TEXT[], -- vegetarian, vegan, gluten-free, etc.
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addons per restaurant
CREATE TABLE IF NOT EXISTS restaurant_addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    is_required BOOLEAN DEFAULT false,
    max_selections INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Addon options
CREATE TABLE IF NOT EXISTS addon_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    addon_id UUID REFERENCES restaurant_addons(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

-- ============================================================================
-- ORDER MANAGEMENT (Multi-Restaurant)
-- ============================================================================

-- Orders table (updated for multi-restaurant)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_type VARCHAR(20) DEFAULT 'delivery', -- delivery, pickup
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_address JSONB,
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items (updated for multi-restaurant)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES restaurant_menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    customizations JSONB DEFAULT '[]',
    special_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ADMIN DASHBOARD FEATURES
-- ============================================================================

-- Restaurant analytics
CREATE TABLE IF NOT EXISTS restaurant_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    total_revenue DECIMAL(10, 2) DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    average_order_value DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restaurant reviews
CREATE TABLE IF NOT EXISTS restaurant_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PLATFORM FEATURES
-- ============================================================================

-- Platform admins (super admins)
CREATE TABLE IF NOT EXISTS platform_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'admin', -- super_admin, admin, moderator
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform settings
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Restaurant admins can only access their own restaurant data
CREATE POLICY "Restaurant admins can access their restaurant data" ON restaurants
    FOR ALL USING (
        id IN (
            SELECT restaurant_id FROM restaurant_admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Users can view all active restaurants
CREATE POLICY "Users can view active restaurants" ON restaurants
    FOR SELECT USING (is_active = true);

-- Restaurant admins can manage their restaurant's menu
CREATE POLICY "Restaurant admins can manage their menu" ON restaurant_menu_items
    FOR ALL USING (
        restaurant_id IN (
            SELECT restaurant_id FROM restaurant_admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Users can view menu items from active restaurants
CREATE POLICY "Users can view active menu items" ON restaurant_menu_items
    FOR SELECT USING (
        is_available = true AND 
        restaurant_id IN (SELECT id FROM restaurants WHERE is_active = true)
    );

-- Users can only access their own orders
CREATE POLICY "Users can access their own orders" ON orders
    FOR ALL USING (user_id = auth.uid());

-- Restaurant admins can access orders for their restaurant
CREATE POLICY "Restaurant admins can access their restaurant orders" ON orders
    FOR ALL USING (
        restaurant_id IN (
            SELECT restaurant_id FROM restaurant_admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );







