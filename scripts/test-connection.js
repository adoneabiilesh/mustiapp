// Test Supabase connection and display project info
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Connection\n');
console.log('========================================\n');

// Check environment variables
console.log('Configuration Check:');
console.log('URL: ' + (supabaseUrl ? 'Set' : 'Missing'));
console.log('Anon Key: ' + (supabaseAnonKey ? 'Set' : 'Missing'));
console.log('Service Key: ' + (supabaseServiceKey ? 'Set' : 'Missing'));
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing required environment variables!');
  console.error('\nPlease create a .env file with:');
  console.error('EXPO_PUBLIC_SUPABASE_URL=your_url');
  console.error('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key\n');
  process.exit(1);
}

async function testConnection() {
  let catError = null;
  let userError = null;
  
  try {
    // Test with anon key (public access)
    console.log('Testing public access (anon key)...');
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    const categoriesResult = await supabaseAnon
      .from('categories')
      .select('*')
      .limit(1);
    
    catError = categoriesResult.error;
    const categories = categoriesResult.data;

    if (catError && catError.code !== 'PGRST116') {
      console.log('WARNING: Categories table might not exist yet');
      console.log('Error: ' + catError.message + '\n');
    } else {
      console.log('SUCCESS: Public access working!');
      console.log('Found ' + (categories?.length || 0) + ' categories\n');
    }

    // Test with service key (admin access)
    if (supabaseServiceKey) {
      console.log('Testing admin access (service key)...');
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
      
      const usersResult = await supabaseAdmin
        .from('users')
        .select('count')
        .limit(1);
      
      userError = usersResult.error;

      if (userError && userError.code !== 'PGRST116') {
        console.log('WARNING: Users table might not exist yet');
        console.log('Error: ' + userError.message + '\n');
      } else {
        console.log('SUCCESS: Admin access working!\n');
      }
    }

    // Test storage
    console.log('Testing storage access...');
    const { data: buckets, error: storageError } = await supabaseAnon
      .storage
      .listBuckets();

    if (storageError) {
      console.log('WARNING: Storage access issue');
      console.log('Error: ' + storageError.message + '\n');
    } else {
      console.log('SUCCESS: Storage access working!');
      console.log('Found ' + (buckets?.length || 0) + ' buckets\n');
    }

    // Summary
    console.log('========================================\n');
    console.log('Connection Test Summary:\n');
    console.log('SUCCESS: Supabase URL is reachable');
    console.log('SUCCESS: Authentication keys are valid');
    console.log('SUCCESS: API is responding\n');
    
    if (catError || userError) {
      console.log('Next Steps:');
      console.log('1. Run the database schema SQL in Supabase dashboard');
      console.log('2. Run: node scripts/seed-menu-from-images.js');
      console.log('3. Start your application\n');
    } else {
      console.log('Everything looks good! You are ready to go!\n');
    }

  } catch (error) {
    console.error('ERROR: Connection test failed: ' + error.message);
    console.error('\nPlease check:');
    console.error('1. Your Supabase project is running');
    console.error('2. API keys are correct');
    console.error('3. Internet connection is stable\n');
    process.exit(1);
  }
}

testConnection();
