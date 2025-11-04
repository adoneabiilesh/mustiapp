// Script to add available_addons column to menu_items table
// Run this script to add the missing column

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please ensure .env.local contains:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function addAvailableAddonsColumn() {
  try {
    console.log('🔄 Adding available_addons column to menu_items table...');
    
    // Add the column
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.menu_items 
        ADD COLUMN IF NOT EXISTS available_addons JSONB DEFAULT '[]'::jsonb;
      `
    });

    if (alterError) {
      console.error('❌ Error adding column:', alterError);
      return;
    }

    console.log('✅ Column added successfully');

    // Create index for better performance
    console.log('🔄 Creating index for better performance...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_menu_items_available_addons 
        ON public.menu_items USING GIN (available_addons);
      `
    });

    if (indexError) {
      console.error('❌ Error creating index:', indexError);
      return;
    }

    console.log('✅ Index created successfully');

    // Update existing products to have empty addons array
    console.log('🔄 Updating existing products...');
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE public.menu_items 
        SET available_addons = '[]'::jsonb 
        WHERE available_addons IS NULL;
      `
    });

    if (updateError) {
      console.error('❌ Error updating existing products:', updateError);
      return;
    }

    console.log('✅ Existing products updated successfully');
    console.log('🎉 Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

addAvailableAddonsColumn();
