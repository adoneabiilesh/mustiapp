// Test script to check if available_addons column exists
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testColumnExists() {
  try {
    console.log('🔄 Testing if available_addons column exists...');
    
    const { data, error } = await supabase
      .from('menu_items')
      .select('available_addons')
      .limit(1);

    if (error) {
      if (error.message.includes('available_addons')) {
        console.log('❌ Column does NOT exist');
        console.log('Error:', error.message);
        return false;
      } else {
        console.log('❌ Other error:', error.message);
        return false;
      }
    } else {
      console.log('✅ Column exists!');
      console.log('Sample data:', data);
      return true;
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

testColumnExists();
