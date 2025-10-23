const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...');
console.log('URL:', url ? '✅ Set' : '❌ Missing');
console.log('Key:', key ? '✅ Set' : '❌ Missing');

if (!url || !key) {
  console.log('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
  try {
    console.log('\n📡 Testing database connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      
      if (error.message.includes('relation "categories" does not exist')) {
        console.log('💡 Run the SQL schema first: scripts/create-supabase-schema.sql');
      }
      return false;
    }
    
    console.log('✅ Database connection successful!');
    
    // Test auth
    console.log('\n🔐 Testing auth...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Auth test failed:', authError.message);
      return false;
    }
    
    console.log('✅ Auth service working!');
    
    // Test storage
    console.log('\n📦 Testing storage...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log('❌ Storage test failed:', storageError.message);
      return false;
    }
    
    console.log('✅ Storage service working!');
    console.log('📁 Available buckets:', buckets.map(b => b.name).join(', '));
    
    // Test realtime
    console.log('\n⚡ Testing realtime...');
    const channel = supabase.channel('test-channel');
    
    const subscription = channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {})
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime service working!');
          supabase.removeChannel(channel);
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Realtime test failed');
        }
      });
    
    // Wait a bit for realtime test
    setTimeout(() => {
      console.log('\n🎉 All tests completed!');
      console.log('\n📋 Next steps:');
      console.log('1. Run the SQL schema: scripts/create-supabase-schema.sql');
      console.log('2. Create "images" bucket in Storage (make it public)');
      console.log('3. Run: npm start');
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    process.exit(1);
  }
}

testConnection();

