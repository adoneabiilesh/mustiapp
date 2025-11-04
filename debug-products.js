// Debug script to check products in database
// Run this with: node debug-products.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProducts() {
  console.log('🔍 Debugging Products in Database...\n');

  try {
    // Check if tables exist
    console.log('📋 Checking database tables...');
    
    // Check menu_items table
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, is_available, created_at')
      .order('created_at', { ascending: false });

    if (menuError) {
      console.error('❌ Error fetching menu items:', menuError);
      return;
    }

    console.log(`✅ Found ${menuItems?.length || 0} menu items`);
    
    if (menuItems && menuItems.length > 0) {
      console.log('\n📦 Menu Items:');
      menuItems.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}`);
        console.log(`   Name: ${item.name}`);
        console.log(`   Price: $${item.price}`);
        console.log(`   Available: ${item.is_available ? 'Yes' : 'No'}`);
        console.log(`   Created: ${item.created_at}`);
        console.log('   ---');
      });
    } else {
      console.log('⚠️  No menu items found in database');
      console.log('💡 Try running the database schema to populate sample data');
    }

    // Check categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, is_active')
      .order('name');

    if (catError) {
      console.error('❌ Error fetching categories:', catError);
    } else {
      console.log(`\n📂 Found ${categories?.length || 0} categories`);
      if (categories && categories.length > 0) {
        console.log('Categories:');
        categories.forEach(cat => {
          console.log(`- ${cat.name} (ID: ${cat.id}) - Active: ${cat.is_active}`);
        });
      }
    }

    // Check restaurants
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('id, name, is_active');

    if (restError) {
      console.error('❌ Error fetching restaurants:', restError);
    } else {
      console.log(`\n🏪 Found ${restaurants?.length || 0} restaurants`);
      if (restaurants && restaurants.length > 0) {
        restaurants.forEach(rest => {
          console.log(`- ${rest.name} (ID: ${rest.id}) - Active: ${rest.is_active}`);
        });
      }
    }

    // Test specific product lookup
    if (menuItems && menuItems.length > 0) {
      const testId = menuItems[0].id;
      console.log(`\n🔍 Testing product lookup with ID: ${testId}`);
      
      const { data: testProduct, error: testError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', testId)
        .single();

      if (testError) {
        console.error('❌ Error fetching test product:', testError);
      } else {
        console.log('✅ Test product found:');
        console.log(`   Name: ${testProduct.name}`);
        console.log(`   Description: ${testProduct.description}`);
        console.log(`   Price: $${testProduct.price}`);
        console.log(`   Categories: ${testProduct.categories}`);
        console.log(`   Available: ${testProduct.is_available}`);
      }
    }

    // Check for common issues
    console.log('\n🔧 Checking for common issues...');
    
    // Check if products have proper restaurant_id
    const { data: orphanedProducts } = await supabase
      .from('menu_items')
      .select('id, name')
      .is('restaurant_id', null);

    if (orphanedProducts && orphanedProducts.length > 0) {
      console.log('⚠️  Found products without restaurant_id:');
      orphanedProducts.forEach(item => {
        console.log(`   - ${item.name} (ID: ${item.id})`);
      });
    } else {
      console.log('✅ All products have restaurant_id');
    }

    // Check for products with missing required fields
    const { data: incompleteProducts } = await supabase
      .from('menu_items')
      .select('id, name, price, is_available')
      .or('price.is.null,is_available.is.null');

    if (incompleteProducts && incompleteProducts.length > 0) {
      console.log('⚠️  Found products with missing required fields:');
      incompleteProducts.forEach(item => {
        console.log(`   - ${item.name} (ID: ${item.id})`);
      });
    } else {
      console.log('✅ All products have required fields');
    }

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the debug script
debugProducts().then(() => {
  console.log('\n✅ Debug complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
});
