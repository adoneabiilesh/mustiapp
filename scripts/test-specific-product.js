// Test script to check a specific product ID
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSpecificProduct() {
  const productId = 'b88be5eb-16e1-426e-8fc4-236ac14013d8';
  
  try {
    console.log('🔄 Testing specific product ID:', productId);
    
    // First, check if the product exists
    const { data: product, error: fetchError } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.log('❌ Product not found:', fetchError.message);
      return;
    }

    console.log('✅ Product found:', product.name);
    
    // Test update with available_addons
    console.log('🔄 Testing update with available_addons...');
    const { data: update, error: updateError } = await supabase
      .from('menu_items')
      .update({ 
        name: product.name, // Keep original name
        available_addons: []
      })
      .eq('id', productId)
      .select();

    if (updateError) {
      console.log('❌ Update failed:', updateError.message);
      console.log('Error details:', updateError);
    } else {
      console.log('✅ Update succeeded');
    }

  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testSpecificProduct();
