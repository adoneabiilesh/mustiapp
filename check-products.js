const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, 'admin-dashboard', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please check admin-dashboard/.env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking Database...\n');
  console.log('=' .repeat(60));

  try {
    // Check if menu_items table exists
    console.log('📊 Checking menu_items table...');
    const { data: allProducts, error: allError } = await supabase
      .from('menu_items')
      .select('id, name, restaurant_id')
      .limit(10);

    if (allError) {
      console.error('❌ Error querying menu_items:', allError.message);
      return;
    }

    console.log(`✅ Total products in database: ${allProducts?.length || 0}`);
    console.log('');

    if (allProducts && allProducts.length > 0) {
      console.log('📦 Sample Products:');
      allProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   ID: ${p.id}`);
        console.log(`   Restaurant ID: ${p.restaurant_id || 'NULL (unassigned)'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No products found in database!');
    }

    // Check column structure
    console.log('=' .repeat(60));
    console.log('🔍 Checking table structure...');
    const { data: columns, error: colError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1);

    if (columns && columns.length > 0) {
      console.log('✅ Available columns:');
      Object.keys(columns[0]).forEach(col => {
        console.log(`   - ${col}`);
      });
    }

    // Check restaurants
    console.log('');
    console.log('=' .repeat(60));
    console.log('🏢 Checking restaurants...');
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('id, name');

    if (restError) {
      console.error('❌ Error querying restaurants:', restError.message);
    } else {
      console.log(`✅ Total restaurants: ${restaurants?.length || 0}`);
      if (restaurants && restaurants.length > 0) {
        restaurants.forEach((r, i) => {
          console.log(`${i + 1}. ${r.name} (ID: ${r.id})`);
        });
      }
    }

    // Check products per restaurant
    console.log('');
    console.log('=' .repeat(60));
    console.log('📊 Products by Restaurant:');
    
    // Products with NULL restaurant_id
    const { data: unassigned } = await supabase
      .from('menu_items')
      .select('id')
      .is('restaurant_id', null);
    
    console.log(`Unassigned (NULL): ${unassigned?.length || 0} products`);

    if (restaurants && restaurants.length > 0) {
      for (const rest of restaurants) {
        const { data: restProducts } = await supabase
          .from('menu_items')
          .select('id')
          .eq('restaurant_id', rest.id);
        
        console.log(`${rest.name}: ${restProducts?.length || 0} products`);
      }
    }

    console.log('');
    console.log('=' .repeat(60));
    console.log('✨ Database check complete!');
    console.log('');

    // Recommendations
    if (!allProducts || allProducts.length === 0) {
      console.log('⚠️  RECOMMENDATION:');
      console.log('No products found in database. You need to:');
      console.log('1. Import products using: node import-mustiplace-menu.js');
      console.log('2. Or create products manually in the admin dashboard');
    } else if (restaurants && restaurants.length === 0) {
      console.log('⚠️  RECOMMENDATION:');
      console.log('No restaurants found. You need to:');
      console.log('1. Create restaurants in the admin dashboard');
      console.log('2. Then assign products to restaurants');
    } else {
      console.log('✅ LOOKS GOOD!');
      console.log('Database has products and restaurants.');
      console.log('If products still don\'t show:');
      console.log('1. Restart admin dashboard (Ctrl+C, then npm run dev in admin-dashboard/)');
      console.log('2. Clear browser cache (Ctrl+Shift+R)');
      console.log('3. Check browser console for errors (F12)');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkDatabase().then(() => process.exit(0));


