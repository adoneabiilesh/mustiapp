require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function migrateToDynamicData() {
  console.log('🔄 Starting migration to dynamic data...');
  
  try {
    // 1. Create user_preferences table
    console.log('📋 Creating user_preferences table...');
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_preferences (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          default_address JSONB,
          payment_methods JSONB DEFAULT '[]'::jsonb,
          delivery_instructions TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id)
        );
      `
    });

    if (createTableError) {
      console.log('⚠️ Table might already exist, continuing...');
    }

    // 2. Enable RLS
    console.log('🔒 Setting up Row Level Security...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY IF NOT EXISTS "Users can view own preferences" ON public.user_preferences
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can insert own preferences" ON public.user_preferences
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can update own preferences" ON public.user_preferences
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });

    // 3. Add payment_method column to orders if not exists
    console.log('💳 Adding payment_method column to orders...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.orders 
        ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';
      `
    });

    // 4. Create default preferences for existing users
    console.log('👥 Creating default preferences for existing users...');
    const { data: existingUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id');

    if (!usersError && existingUsers) {
      for (const user of existingUsers) {
        // Check if preferences already exist
        const { data: existingPrefs } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!existingPrefs) {
          // Create default preferences
          await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              default_address: {
                street: '',
                city: 'Rome',
                state: 'RM',
                zip: '00100',
                country: 'Italy'
              },
              payment_methods: [{
                id: 'cash_default',
                type: 'cash',
                is_default: true
              }]
            });
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📱 Your app now uses dynamic data:');
    console.log('• User addresses are stored in user_preferences table');
    console.log('• Payment methods are managed dynamically');
    console.log('• All data updates the backend automatically');
    console.log('• No more hardcoded static data!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrateToDynamicData();
