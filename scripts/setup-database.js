// Setup database with schema and seed data
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting database setup...\n');

  try {
    // Check connection
    console.log('1️⃣ Testing connection to Supabase...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') {
      console.log('⚠️  Tables might not exist yet. This is normal for first setup.');
      console.log('📝 Please run the SQL schema from scripts/create-supabase-schema.sql');
      console.log('   in your Supabase SQL Editor dashboard.');
      console.log('\nSteps:');
      console.log('1. Go to: https://app.supabase.com/project/YOUR_PROJECT/editor');
      console.log('2. Copy contents of scripts/create-supabase-schema.sql');
      console.log('3. Paste and run in SQL Editor');
      console.log('4. Run this script again\n');
      return;
    }

    console.log('✅ Connected to Supabase successfully!\n');

    // Check if data already exists
    console.log('2️⃣ Checking existing data...');
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('count');

    if (existingCategories && existingCategories.length > 0) {
      console.log('✅ Database already has data. Skipping seed.\n');
      console.log('🎉 Database is ready to use!');
      return;
    }

    console.log('📦 No data found. Running seed script...\n');
    
    // Import and run seed script
    const seedScript = require('./seed-menu-from-images.js');
    console.log('\n✅ Database setup complete!');
    console.log('🎉 You can now start using the application!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. Your .env file has correct Supabase credentials');
    console.error('2. You have run the database schema SQL');
    console.error('3. Your Supabase project is active\n');
    process.exit(1);
  }
}

setupDatabase();


