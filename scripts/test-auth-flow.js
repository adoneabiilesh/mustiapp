const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function testAuthFlow() {
  console.log('🔍 Testing authentication flow...\n');
  
  // Test 1: Check auth settings
  console.log('1. Checking auth configuration...');
  const { data: settings } = await supabase.auth.getSettings();
  console.log('Email confirmation required:', settings.email_confirm);
  console.log('Email confirmation URL:', settings.email_confirm_url);
  
  // Test 2: Try to create a user
  console.log('\n2. Testing user creation...');
  const testEmail = `test${Date.now()}@gmail.com`;
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: 'testpassword123'
  });
  
  if (signUpError) {
    console.log('❌ Sign up failed:', signUpError.message);
    return;
  }
  
  console.log('✅ User created successfully');
  console.log('User ID:', signUpData.user?.id);
  console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
  
  // Test 3: Try to sign in immediately
  console.log('\n3. Testing immediate sign in...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: 'testpassword123'
  });
  
  if (signInError) {
    console.log('❌ Sign in failed:', signInError.message);
    console.log('💡 This is expected if email confirmation is required');
  } else {
    console.log('✅ Sign in successful');
  }
  
  console.log('\n📋 Solutions:');
  console.log('Option 1: Disable email confirmation in Supabase Dashboard');
  console.log('   - Go to Authentication → Settings');
  console.log('   - Turn OFF "Enable email confirmations"');
  console.log('   - Save changes');
  console.log('\nOption 2: Set up email confirmation');
  console.log('   - Configure SMTP settings in Supabase');
  console.log('   - Users will receive confirmation emails');
}

testAuthFlow().catch(console.error);

