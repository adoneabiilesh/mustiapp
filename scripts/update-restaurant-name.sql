-- Update Restaurant Name in Database
-- Run this script in Supabase SQL Editor to update any database records

-- Update any restaurant information in the database
-- (This is a template - adjust based on your actual database schema)

-- If you have a restaurants table
-- UPDATE restaurants SET name = 'Musti Place' WHERE name = 'Mama Mia Pizzeria';

-- If you have any configuration tables
-- UPDATE app_config SET restaurant_name = 'Musti Place' WHERE restaurant_name = 'Mama Mia Pizzeria';

-- If you have any user-facing text that needs updating
-- UPDATE content SET title = 'Welcome to Musti Place!' WHERE title = 'Welcome to Mama Mia!';

-- Check if there are any other tables that might contain the old name
-- SELECT table_name, column_name 
-- FROM information_schema.columns 
-- WHERE column_name LIKE '%name%' OR column_name LIKE '%title%' OR column_name LIKE '%description%';

-- This script is a template - you may need to adjust it based on your actual database schema
-- The main restaurant name is now controlled by the RESTAURANT_CONFIG in the app
