-- Add test promotions to the database
-- Make sure the promotions table exists first by running create-promotions-table.sql

-- Insert test promotions with future dates
INSERT INTO public.promotions (title, description, discount, discount_type, image_url, valid_until, terms, is_active) VALUES
('New Customer Special', 'Get 20% off your first order with code WELCOME20', 20.00, 'percentage', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1', '2025-12-31 23:59:59+00', 'Valid for new customers only. Minimum order €15.', true),
('Free Delivery Weekend', 'Enjoy free delivery on all orders this weekend', 5.00, 'fixed', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', '2025-12-15 23:59:59+00', 'Valid on weekends only. No minimum order required.', true),
('Holiday Special', '25% off all orders over €30', 25.00, 'percentage', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add', '2025-12-25 23:59:59+00', 'Valid until Christmas. Minimum order €30 required.', true),
('Weekend Special', '15% off all orders this weekend', 15.00, 'percentage', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445', '2025-01-15 23:59:59+00', 'Valid on weekends only. No minimum order required.', true),
('Lunch Deal', 'Get €3 off orders over €20', 3.00, 'fixed', 'https://images.unsplash.com/photo-1551218808-94e220e084d2', '2025-02-28 23:59:59+00', 'Valid for lunch orders only. Minimum order €20.', true);

-- Check if promotions were inserted
SELECT COUNT(*) as total_promotions FROM public.promotions;
SELECT id, title, is_active, valid_until FROM public.promotions ORDER BY created_at DESC;
