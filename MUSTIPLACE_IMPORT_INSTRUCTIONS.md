# Mustiplace Menu Import Instructions

## Step 1: Add Missing Database Columns

Before importing the products, we need to add some missing columns to the `menu_items` table.

1. **Open Supabase Dashboard**: Go to your Supabase project dashboard
2. **Navigate to SQL Editor**: Click on "SQL Editor" in the left sidebar
3. **Run the Migration**: Copy and paste the contents of `ADD_MENU_ITEMS_COLUMNS.sql` into the SQL editor
4. **Execute**: Click "Run" to execute the script

This will add the following columns:
- `is_featured` - For featured/recommended products
- `preparation_time` - Preparation time in minutes
- `is_available` - Product availability status
- `restaurant_id` - Link products to specific restaurants
- `category` - Single category assignment

## Step 2: Run the Import Script

Once the database is updated, run the import script:

```bash
node import-mustiplace-menu.js
```

## Expected Results

✅ **89 products** will be imported to the Mustiplace restaurant:
- **12 Cocktails** (Vodka Lemon, Gin Tonic, Negroni, Aperol Spritz, etc.)
- **12 Spirits** (Rum Zacapa, Talisker Whisky, Gin Mare, Vodka Grey Goose, etc.)
- **16 Soft Drinks** (Coca-Cola, Sprite, Red Bull, Water, Juices, etc.)
- **17 Beers** (Peroni, Heineken, Corona, Menabrea, etc.)
- **5 Draft Beers** (Kozel, Peroni Cruda)
- **7 Burgers** (Hamburger, Cheese Burger, Egg Bacon Burger, etc.)
- **3 Hotdogs** (Regular, Cheese, Cheese Bacon)
- **5 Fries/Sides** (Patate Fritte, Chicken Bites, Onion Rings, etc.)
- **4 Kebabs** (Classic, Cheese, Bacon, Spicy)
- **8 Craft Beers** (IPA Steam Brew, Baladin, Gjulia, etc.)

## Step 3: Verify the Import

After import, verify in your Supabase dashboard:

1. Go to **Table Editor** → **menu_items**
2. Filter by `restaurant_id` = `ccbf921d-5d78-484d-8690-c3a33159f609`
3. You should see **89 products** for Mustiplace

## Troubleshooting

If you encounter any errors:

1. **Schema cache error**: The database columns might not have been added correctly. Re-run the `ADD_MENU_ITEMS_COLUMNS.sql` script.
2. **Permission denied**: Make sure your Supabase service role key is set in `admin-dashboard/.env.local`
3. **Restaurant ID not found**: Verify the restaurant ID `ccbf921d-5d78-484d-8690-c3a33159f609` exists in the `restaurants` table

## Next Steps

Once the products are imported:

1. **Test the App**: Open your mobile app and select "Mustiplace" restaurant
2. **View Products**: All 89 products should appear in their respective categories
3. **Test Ordering**: Try adding items to cart and placing an order
4. **Admin Dashboard**: Use the bulk import feature for future menu updates

---

📝 **Note**: The import script uses real images from Unsplash for product photos. You can replace these with your own images later by updating the `image_url` field in the admin dashboard.


