const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

async function checkTables() {
  console.log('🔍 Checking database tables and data...\n');

  try {
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(5);
    
    if (usersError) {
      console.log('❌ users table:', usersError.message);
    } else {
      console.log(`✅ users table: ${users.length} rows found`);
      if (users.length > 0) console.log('   Sample:', users[0].email);
    }

    // Check categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*');
    
    if (catError) {
      console.log('❌ categories table:', catError.message);
    } else {
      console.log(`✅ categories table: ${categories.length} rows found`);
      if (categories.length > 0) {
        console.log('   Categories:', categories.map(c => c.name).join(', '));
      }
    }

    // Check menu_items table
    const { data: menu, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price');
    
    if (menuError) {
      console.log('❌ menu_items table:', menuError.message);
    } else {
      console.log(`✅ menu_items table: ${menu.length} rows found`);
      if (menu.length > 0) {
        console.log('   Sample items:');
        menu.slice(0, 3).forEach(item => {
          console.log(`   - ${item.name}: $${item.price}`);
        });
      }
    }

    // Check orders table
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total');
    
    if (ordersError) {
      console.log('❌ orders table:', ordersError.message);
    } else {
      console.log(`✅ orders table: ${orders.length} rows found`);
    }

    // Check order_items table
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id');
    
    if (orderItemsError) {
      console.log('❌ order_items table:', orderItemsError.message);
    } else {
      console.log(`✅ order_items table: ${orderItems.length} rows found`);
    }

    // Check deliveries table
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('deliveries')
      .select('id');
    
    if (deliveriesError) {
      console.log('❌ deliveries table:', deliveriesError.message);
    } else {
      console.log(`✅ deliveries table: ${deliveries.length} rows found`);
    }

    // Check courier_locations table
    const { data: locations, error: locationsError } = await supabase
      .from('courier_locations')
      .select('id');
    
    if (locationsError) {
      console.log('❌ courier_locations table:', locationsError.message);
    } else {
      console.log(`✅ courier_locations table: ${locations.length} rows found`);
    }

    console.log('\n📊 Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Database is connected and tables exist!`);
    
    if (categories.length === 0 || menu.length === 0) {
      console.log('\n⚠️  No data found. Run: npm run supabase:seed');
    } else {
      console.log('\n✅ Database has data and is ready to use!');
      console.log('\n🚀 Start your app: npx expo start');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

checkTables();


