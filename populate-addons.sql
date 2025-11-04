-- Populate sample addons in the database
-- Run this script to add sample addons that can be assigned to products

-- Insert sample addons
INSERT INTO addons (name, description, price, type, is_required, is_active) VALUES
  -- Size options
  ('Small', 'Small portion size', 0, 'size', false, true),
  ('Medium', 'Medium portion size', 2, 'size', false, true),
  ('Large', 'Large portion size', 4, 'size', false, true),
  ('Extra Large', 'Extra large portion size', 6, 'size', false, true),
  
  -- Add-on options
  ('Extra Cheese', 'Additional cheese topping', 1.5, 'addon', false, true),
  ('Extra Bacon', 'Additional bacon strips', 2, 'addon', false, true),
  ('Extra Vegetables', 'Additional fresh vegetables', 1, 'addon', false, true),
  ('Avocado', 'Fresh avocado slices', 1.8, 'addon', false, true),
  ('Jalapeños', 'Spicy jalapeño peppers', 0.8, 'addon', false, true),
  ('Extra Onions', 'Additional onion rings', 0.5, 'addon', false, true),
  ('Mushrooms', 'Sautéed mushrooms', 1.2, 'addon', false, true),
  ('Extra Sauce', 'Additional sauce', 0.5, 'addon', false, true),
  
  -- Spice levels
  ('Mild', 'Mild spice level', 0, 'spice', false, true),
  ('Medium Spice', 'Medium spice level', 0, 'spice', false, true),
  ('Hot', 'Hot spice level', 0, 'spice', false, true),
  ('Extra Hot', 'Extra hot spice level', 0, 'spice', false, true)
ON CONFLICT (name, type) DO NOTHING;

-- Update some menu items to have available addons
-- This assigns specific addons to specific products
UPDATE menu_items 
SET available_addons = ARRAY[
  (SELECT id FROM addons WHERE name = 'Medium' AND type = 'size' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Large' AND type = 'size' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Extra Cheese' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Extra Bacon' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Jalapeños' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Hot' AND type = 'spice' LIMIT 1)
]
WHERE name ILIKE '%burger%' OR name ILIKE '%pizza%';

-- Assign different addons to pizza items
UPDATE menu_items 
SET available_addons = ARRAY[
  (SELECT id FROM addons WHERE name = 'Small' AND type = 'size' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Medium' AND type = 'size' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Large' AND type = 'size' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Extra Cheese' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Extra Vegetables' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Mushrooms' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Mild' AND type = 'spice' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Medium Spice' AND type = 'spice' LIMIT 1)
]
WHERE name ILIKE '%pizza%';

-- Assign addons to salad items
UPDATE menu_items 
SET available_addons = ARRAY[
  (SELECT id FROM addons WHERE name = 'Extra Vegetables' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Avocado' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Extra Onions' AND type = 'addon' LIMIT 1),
  (SELECT id FROM addons WHERE name = 'Extra Sauce' AND type = 'addon' LIMIT 1)
]
WHERE name ILIKE '%salad%';

-- Leave some items without addons (like desserts)
-- This demonstrates that not all products need addons

-- Show the results
SELECT 
  mi.name as product_name,
  mi.available_addons,
  COUNT(a.id) as addon_count
FROM menu_items mi
LEFT JOIN addons a ON a.id = ANY(mi.available_addons)
GROUP BY mi.name, mi.available_addons
ORDER BY mi.name;
