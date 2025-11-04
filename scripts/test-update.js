// Test script to simulate the update request that's failing
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
  try {
    console.log('🔄 Testing update request...');
    
    // First, get a product ID
    const { data: products, error: fetchError } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);

    if (fetchError) {
      console.log('❌ Failed to fetch products:', fetchError.message);
      return;
    }

    if (!products || products.length === 0) {
      console.log('❌ No products found');
      return;
    }

    const productId = products[0].id;
    console.log('📦 Testing with product ID:', productId);

    // Test update without available_addons
    console.log('🔄 Testing update without available_addons...');
    const { data: update1, error: error1 } = await supabase
      .from('menu_items')
      .update({ name: 'Test Update' })
      .eq('id', productId)
      .select();

    if (error1) {
      console.log('❌ Update without available_addons failed:', error1.message);
    } else {
      console.log('✅ Update without available_addons succeeded');
    }

    // Test update with available_addons
    console.log('🔄 Testing update with available_addons...');
    const { data: update2, error: error2 } = await supabase
      .from('menu_items')
      .update({ 
        name: 'Test Update 2',
        available_addons: []
      })
      .eq('id', productId)
      .select();

    if (error2) {
      console.log('❌ Update with available_addons failed:', error2.message);
      console.log('Error details:', error2);
    } else {
      console.log('✅ Update with available_addons succeeded');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testUpdate();
