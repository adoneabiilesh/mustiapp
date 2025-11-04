const { createClient } = require('@supabase/supabase-js');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

// Load environment variables from admin-dashboard/.env.local
require('dotenv').config({ path: path.join(__dirname, 'admin-dashboard', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please ensure admin-dashboard/.env.local contains:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function importProducts() {
  console.log('🚀 Starting Mustiplace menu import...\n');

  // Read CSV file
  const csvPath = path.join(__dirname, 'mustiplace-menu-import.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  // Parse CSV
  const parseResult = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (parseResult.errors.length > 0) {
    console.error('❌ CSV parsing errors:');
    parseResult.errors.forEach((error) => console.error(error));
    return;
  }

  const products = parseResult.data;
  console.log(`📊 Found ${products.length} products to import\n`);

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  // Import each product
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    if (!product.name || product.name.trim() === '') {
      continue; // Skip empty rows
    }

    try {
      // Parse categories from comma-separated string
      const categories = product.categories
        ? product.categories.split(',').map(c => c.trim())
        : [];

      // Prepare product data (only include fields that exist in the database)
      const productData = {
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price) || 0,
        image_url: product.image_url || '',
        type: product.category || 'Other',
        categories: categories,
        calories: parseInt(product.calories) || null,
        protein: null,
        rating: null,
        is_vegetarian: false,
        is_vegan: false,
        is_gluten_free: product.name.toLowerCase().includes('gluten free'),
        is_spicy: product.name.toLowerCase().includes('spicy') || 
                 product.name.toLowerCase().includes('piccante') ||
                 product.name.toLowerCase().includes('chilli'),
      };

      // Only add these fields if they exist in the database
      // (They will be added by the SQL migration)
      if (product.restaurant_id) productData.restaurant_id = product.restaurant_id;
      if (product.category) productData.category = product.category;
      if (product.is_available !== undefined) productData.is_available = product.is_available === 'true';
      if (product.is_featured !== undefined) productData.is_featured = product.is_featured === 'true';
      if (product.preparation_time) productData.preparation_time = parseInt(product.preparation_time) || 0;

      // Insert into database
      const { data, error } = await supabase
        .from('menu_items')
        .insert(productData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      successCount++;
      console.log(`✅ [${i + 1}/${products.length}] Imported: ${product.name}`);
    } catch (error) {
      failCount++;
      errors.push({ product: product.name, error: error.message });
      console.error(`❌ [${i + 1}/${products.length}] Failed: ${product.name} - ${error.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully imported: ${successCount} products`);
  console.log(`❌ Failed: ${failCount} products`);
  console.log('='.repeat(60));

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach((err, index) => {
      console.log(`${index + 1}. ${err.product}: ${err.error}`);
    });
  }

  console.log('\n✨ Import process completed!');
}

// Run the import
importProducts()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

