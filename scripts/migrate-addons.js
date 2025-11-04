// Simple migration script to add available_addons column
// This can be run from the admin dashboard

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrate() {
  try {
    console.log('🔄 Running migration...');
    
    // Execute the SQL directly
    const { data, error } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Database connection error:', error);
      return;
    }

    console.log('✅ Database connection successful');
    console.log('📝 Please run the following SQL in your Supabase dashboard:');
    console.log('');
    console.log('ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS available_addons JSONB DEFAULT \'[]\'::jsonb;');
    console.log('CREATE INDEX IF NOT EXISTS idx_menu_items_available_addons ON public.menu_items USING GIN (available_addons);');
    console.log('UPDATE public.menu_items SET available_addons = \'[]\'::jsonb WHERE available_addons IS NULL;');
    console.log('');
    console.log('🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

migrate();
