-- Seed script for restaurant settings
-- This populates the restaurant_settings table with default values

-- Insert default restaurant settings for existing restaurants
INSERT INTO restaurant_settings (
    restaurant_id,
    tagline,
    primary_color,
    secondary_color,
    accent_color,
    facebook_url,
    instagram_url,
    twitter_url,
    loyalty_points_per_euro,
    euro_per_point,
    loyalty_tiers,
    referral_enabled,
    referral_reward_amount,
    referrer_reward_amount,
    minimum_order_for_reward,
    free_delivery_threshold,
    default_delivery_time,
    features,
    payment_methods,
    delivery_areas,
    dietary_options,
    allergens
)
SELECT 
    r.id,
    'Authentic Italian Taste',
    '#E53E3E',
    '#FED7D7',
    '#F6AD55',
    'https://facebook.com/mustiplace',
    'https://instagram.com/mustiplace',
    'https://twitter.com/mustiplace',
    1.00,
    0.01,
    '[
        {"name": "Bronze", "points": 0, "benefits": ["Welcome bonus"]},
        {"name": "Silver", "points": 500, "benefits": ["Free delivery", "5% discount"]},
        {"name": "Gold", "points": 1000, "benefits": ["Free delivery", "10% discount", "Priority support"]},
        {"name": "Platinum", "points": 2000, "benefits": ["Free delivery", "15% discount", "Exclusive offers", "Birthday surprise"]}
    ]'::jsonb,
    true,
    5.00,
    5.00,
    20.00,
    25.00,
    '25-35 min',
    '{
        "hasDelivery": true,
        "hasPickup": true,
        "hasDineIn": true,
        "hasOnlineOrdering": true,
        "hasLoyaltyProgram": true,
        "hasReferralProgram": true,
        "acceptsCash": true,
        "acceptsCards": true,
        "acceptsDigitalWallets": true
    }'::jsonb,
    '[
        {"id": "card", "name": "Credit/Debit Card", "icon": "💳", "enabled": true},
        {"id": "cash", "name": "Cash on Delivery", "icon": "💵", "enabled": true},
        {"id": "apple_pay", "name": "Apple Pay", "icon": "📱", "enabled": true},
        {"id": "google_pay", "name": "Google Pay", "icon": "📱", "enabled": true},
        {"id": "paypal", "name": "PayPal", "icon": "💰", "enabled": true}
    ]'::jsonb,
    '[
        {"name": "Downtown", "deliveryTime": "20-30 min", "fee": 2.99},
        {"name": "Midtown", "deliveryTime": "25-35 min", "fee": 2.99},
        {"name": "Uptown", "deliveryTime": "30-40 min", "fee": 3.99},
        {"name": "Suburbs", "deliveryTime": "35-45 min", "fee": 4.99}
    ]'::jsonb,
    '[
        {"name": "Vegetarian", "icon": "🌱", "available": true},
        {"name": "Vegan", "icon": "🌿", "available": true},
        {"name": "Gluten-Free", "icon": "🌾", "available": true},
        {"name": "Keto", "icon": "🥑", "available": false},
        {"name": "Low-Carb", "icon": "🥗", "available": true}
    ]'::jsonb,
    ARRAY['Gluten', 'Dairy', 'Eggs', 'Nuts', 'Soy']
FROM restaurants r
WHERE NOT EXISTS (
    SELECT 1 FROM restaurant_settings rs WHERE rs.restaurant_id = r.id
)
ON CONFLICT (restaurant_id) DO NOTHING;

-- Add helpful count increment/decrement functions for reviews
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = review_id_param;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE product_reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = review_id_param;
END;
$$ LANGUAGE plpgsql;

