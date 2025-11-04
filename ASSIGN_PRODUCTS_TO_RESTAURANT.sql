-- Assign Existing Products to Restaurants
-- Run this AFTER you've run ADD_MENU_ITEMS_COLUMNS.sql

-- Option 1: Assign ALL existing products to Mustiplace restaurant
-- Uncomment the line below to assign all NULL restaurant_id products to Mustiplace

-- UPDATE menu_items 
-- SET restaurant_id = 'ccbf921d-5d78-484d-8690-c3a33159f609' 
-- WHERE restaurant_id IS NULL;


-- Option 2: Assign products to a different restaurant
-- Replace 'your-restaurant-id' with your actual restaurant ID from the restaurants table

-- First, get your restaurant ID by running:
-- SELECT id, name FROM restaurants;

-- Then update:
-- UPDATE menu_items 
-- SET restaurant_id = 'your-restaurant-id' 
-- WHERE restaurant_id IS NULL;


-- Option 3: See which products don't have a restaurant assigned
SELECT 
    id,
    name,
    price,
    type,
    restaurant_id
FROM menu_items 
WHERE restaurant_id IS NULL
ORDER BY name;

-- Note: Products with NULL restaurant_id will show in ALL restaurants in the admin dashboard
-- This allows you to gradually assign products to specific restaurants


