// Test script to check authentication status
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log('🔄 Testing authentication...');
    
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ User authenticated:', session.user.email);
    } else {
      console.log('⚠️ No active session');
    }
    
    // Try to get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User error:', userError.message);
    } else if (user) {
      console.log('✅ User info:', user.email);
    } else {
      console.log('⚠️ No user found');
    }
    
    // Test a simple query to see if RLS is blocking
    console.log('🔄 Testing simple query...');
    const { data, error } = await supabase
      .from('menu_items')
      .select('id, name')
      .limit(1);
    
    if (error) {
      console.log('❌ Query failed:', error.message);
    } else {
      console.log('✅ Query succeeded:', data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAuth();
