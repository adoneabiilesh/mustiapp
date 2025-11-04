-- ============================================================================
-- RESTAURANT SETTINGS SYSTEM
-- Migrates hardcoded restaurant configuration to database
-- ============================================================================

-- Restaurant settings table (extends restaurants table)
-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(restaurant_id)
);

-- Add columns if they don't exist (for existing tables)
DO $$ 
BEGIN
    -- Branding columns
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'tagline'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN tagline TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'primary_color'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN primary_color VARCHAR(7) DEFAULT '#E53E3E';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'secondary_color'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN secondary_color VARCHAR(7);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'accent_color'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN accent_color VARCHAR(7);
    END IF;
    
    -- Social Media columns
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'facebook_url'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN facebook_url TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'instagram_url'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN instagram_url TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'twitter_url'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN twitter_url TEXT;
    END IF;
    
    -- Loyalty Program columns
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'loyalty_points_per_euro'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN loyalty_points_per_euro DECIMAL(10, 2) DEFAULT 1.00;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'euro_per_point'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN euro_per_point DECIMAL(10, 4) DEFAULT 0.01;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'loyalty_tiers'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN loyalty_tiers JSONB DEFAULT '[]';
    END IF;
    
    -- Referral Program columns
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'referral_enabled'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN referral_enabled BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'referral_reward_amount'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN referral_reward_amount DECIMAL(10, 2) DEFAULT 5.00;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'referrer_reward_amount'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN referrer_reward_amount DECIMAL(10, 2) DEFAULT 5.00;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'minimum_order_for_reward'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN minimum_order_for_reward DECIMAL(10, 2) DEFAULT 20.00;
    END IF;
    
    -- Delivery Settings columns
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'free_delivery_threshold'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN free_delivery_threshold DECIMAL(10, 2) DEFAULT 25.00;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'default_delivery_time'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN default_delivery_time TEXT DEFAULT '25-35 min';
    END IF;
    
    -- Features column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'features'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN features JSONB DEFAULT '{
            "hasDelivery": true,
            "hasPickup": true,
            "hasDineIn": true,
            "hasOnlineOrdering": true,
            "hasLoyaltyProgram": true,
            "hasReferralProgram": true,
            "acceptsCash": true,
            "acceptsCards": true,
            "acceptsDigitalWallets": true
        }';
    END IF;
    
    -- Payment Methods column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'payment_methods'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN payment_methods JSONB DEFAULT '[
            {"id": "card", "name": "Credit/Debit Card", "icon": "💳", "enabled": true},
            {"id": "cash", "name": "Cash on Delivery", "icon": "💵", "enabled": true},
            {"id": "apple_pay", "name": "Apple Pay", "icon": "📱", "enabled": true},
            {"id": "google_pay", "name": "Google Pay", "icon": "📱", "enabled": true},
            {"id": "paypal", "name": "PayPal", "icon": "💰", "enabled": true}
        ]';
    END IF;
    
    -- Delivery Areas column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'delivery_areas'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN delivery_areas JSONB DEFAULT '[]';
    END IF;
    
    -- Dietary Options column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'dietary_options'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN dietary_options JSONB DEFAULT '[
            {"name": "Vegetarian", "icon": "🌱", "available": true},
            {"name": "Vegan", "icon": "🌿", "available": true},
            {"name": "Gluten-Free", "icon": "🌾", "available": true},
            {"name": "Keto", "icon": "🥑", "available": false},
            {"name": "Low-Carb", "icon": "🥗", "available": true}
        ]';
    END IF;
    
    -- Allergens column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'restaurant_settings' 
        AND column_name = 'allergens'
    ) THEN
        ALTER TABLE restaurant_settings ADD COLUMN allergens TEXT[] DEFAULT ARRAY['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Soy'];
    END IF;
END $$;

-- ============================================================================
-- ORDER CANCELLATION SUPPORT
-- ============================================================================

-- Ensure orders table has status column first (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE orders ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
    END IF;
END $$;

-- Add cancellation fields to orders table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'cancellation_reason'
    ) THEN
        ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'cancelled_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN cancelled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'cancelled_by'
    ) THEN
        ALTER TABLE orders ADD COLUMN cancelled_by UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'refund_status'
    ) THEN
        ALTER TABLE orders ADD COLUMN refund_status VARCHAR(50) DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'refund_amount'
    ) THEN
        ALTER TABLE orders ADD COLUMN refund_amount DECIMAL(10, 2);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'refund_processed_at'
    ) THEN
        ALTER TABLE orders ADD COLUMN refund_processed_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add cancellation reasons lookup (only if type doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cancellation_reason_type') THEN
        CREATE TYPE cancellation_reason_type AS ENUM (
            'customer_request',
            'restaurant_closed',
            'item_unavailable',
            'payment_failed',
            'delivery_failed',
            'duplicate_order',
            'other'
        );
    END IF;
END $$;

-- Add cancellation_reason_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'cancellation_reason_type'
    ) THEN
        ALTER TABLE orders ADD COLUMN cancellation_reason_type cancellation_reason_type;
    END IF;
END $$;

-- ============================================================================
-- REVIEWS AND RATINGS SYSTEM
-- ============================================================================

-- Product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[], -- Array of image URLs
    
    -- Verified purchase
    is_verified BOOLEAN DEFAULT false,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    flagged_reason TEXT,
    
    -- Helpful count
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- One review per product per user per order
    UNIQUE(user_id, menu_item_id, order_id)
);

-- Restaurant reviews table (if not exists)
CREATE TABLE IF NOT EXISTS restaurant_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    images TEXT[],
    
    -- Rating breakdowns
    food_rating INTEGER CHECK (food_rating >= 1 AND food_rating <= 5),
    delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT true,
    
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, restaurant_id, order_id)
);

-- Review helpful votes
CREATE TABLE IF NOT EXISTS review_helpful_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('product', 'restaurant')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(review_id, review_type, user_id)
);

-- ============================================================================
-- REFERRAL PROGRAM
-- ============================================================================

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    max_uses INTEGER, -- NULL = unlimited
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
    
    -- Reward tracking
    referrer_reward_given BOOLEAN DEFAULT false,
    referred_reward_given BOOLEAN DEFAULT false,
    referrer_reward_amount DECIMAL(10, 2) DEFAULT 0,
    referred_reward_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- First order tracking
    first_order_completed BOOLEAN DEFAULT false,
    first_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- CUSTOMER SUPPORT SYSTEM
-- ============================================================================

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general', -- general, order, payment, delivery, technical
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Support messages (chat)
CREATE TABLE IF NOT EXISTS support_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'support')),
    
    message TEXT NOT NULL,
    attachments TEXT[], -- Array of attachment URLs
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PUSH NOTIFICATIONS CONFIGURATION
-- ============================================================================

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Notification types
    order_updates BOOLEAN DEFAULT true,
    promotions BOOLEAN DEFAULT true,
    delivery_alerts BOOLEAN DEFAULT true,
    loyalty_updates BOOLEAN DEFAULT true,
    referral_updates BOOLEAN DEFAULT true,
    
    -- Delivery methods
    push_enabled BOOLEAN DEFAULT true,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    
    -- Push token
    push_token TEXT,
    device_type VARCHAR(20), -- ios, android, web
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification queue
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- order_update, promotion, delivery_alert, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional notification data
    
    -- Delivery tracking
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- DELIVERY TRACKING
-- ============================================================================

-- Delivery drivers (if needed)
CREATE TABLE IF NOT EXISTS delivery_drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(50), -- bike, car, scooter, walk
    license_plate VARCHAR(50),
    
    is_available BOOLEAN DEFAULT true,
    is_on_duty BOOLEAN DEFAULT false,
    
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    
    rating DECIMAL(3, 2) DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery tracking updates
CREATE TABLE IF NOT EXISTS delivery_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES delivery_drivers(id) ON DELETE SET NULL,
    
    status VARCHAR(50) NOT NULL, -- assigned, picked_up, in_transit, arrived, delivered
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant_id ON restaurant_settings(restaurant_id);

-- Only create index on orders.status if the column exists
DO $$ 
BEGIN
    -- Check and create index on status column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'status'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)';
    END IF;
    
    -- Check and create index on cancelled_at column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'cancelled_at'
    ) THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_orders_cancelled_at ON orders(cancelled_at)';
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_product_reviews_menu_item ON product_reviews(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_reviews_restaurant ON restaurant_reviews(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_status ON delivery_tracking(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- Restaurant settings: Public read, admin write
CREATE POLICY "Restaurant settings are viewable by everyone"
    ON restaurant_settings FOR SELECT
    USING (true);

CREATE POLICY "Restaurant settings can be updated by admins"
    ON restaurant_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM platform_admins 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Product reviews: Users can read all, create their own, update own
CREATE POLICY "Product reviews are viewable by everyone"
    ON product_reviews FOR SELECT
    USING (is_approved = true);

CREATE POLICY "Users can create their own reviews"
    ON product_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON product_reviews FOR UPDATE
    USING (auth.uid() = user_id);

-- Restaurant reviews: Similar policies
CREATE POLICY "Restaurant reviews are viewable by everyone"
    ON restaurant_reviews FOR SELECT
    USING (is_approved = true);

CREATE POLICY "Users can create their own restaurant reviews"
    ON restaurant_reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Referral codes: Users can read own, create own
CREATE POLICY "Users can view their own referral codes"
    ON referral_codes FOR SELECT
    USING (auth.uid() = user_id OR is_active = true);

CREATE POLICY "Users can create referral codes"
    ON referral_codes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Support tickets: Users can only see their own
CREATE POLICY "Users can view their own support tickets"
    ON support_tickets FOR SELECT
    USING (auth.uid() = user_id OR assigned_to = auth.uid());

CREATE POLICY "Users can create support tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Notification preferences: Users can manage their own
CREATE POLICY "Users can manage their own notification preferences"
    ON notification_preferences FOR ALL
    USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update restaurant rating when review is added
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM restaurant_reviews
            WHERE restaurant_id = NEW.restaurant_id AND is_approved = true
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM restaurant_reviews
            WHERE restaurant_id = NEW.restaurant_id AND is_approved = true
        )
    WHERE id = NEW.restaurant_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_restaurant_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON restaurant_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_rating();

-- Update menu item rating when review is added
CREATE OR REPLACE FUNCTION update_menu_item_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE menu_items
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM product_reviews
            WHERE menu_item_id = NEW.menu_item_id AND is_approved = true
        )
    WHERE id = NEW.menu_item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_menu_item_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_menu_item_rating();

-- Auto-create referral code for new users
CREATE OR REPLACE FUNCTION create_default_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO referral_codes (user_id, code, is_active)
    VALUES (
        NEW.id,
        UPPER(SUBSTRING(REPLACE(NEW.email, '@', ''), 1, 8) || SUBSTRING(MD5(NEW.id::text), 1, 4)),
        true
    )
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_restaurant_settings_updated_at
    BEFORE UPDATE ON restaurant_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

