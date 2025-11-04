# 🔍 Browser Console Debug Script

## Run This in Your Browser Console

When you're on the admin dashboard Products page:

1. Press **F12** to open Developer Tools
2. Click the **Console** tab
3. Copy and paste this entire script:

```javascript
// Admin Dashboard Debug Script
(async function debugProducts() {
  console.log('🔍 Starting Product Debug...\n');
  
  // Check localStorage
  console.log('📦 LocalStorage:');
  console.log('  Selected Restaurant ID:', localStorage.getItem('selectedRestaurantId'));
  console.log('');
  
  // Try to get Supabase client from window
  console.log('🔌 Checking Supabase connection...');
  
  // Manual check using fetch
  const supabaseUrl = localStorage.getItem('supabase.url') || 'YOUR_SUPABASE_URL';
  const supabaseKey = localStorage.getItem('supabase.key') || 'YOUR_SUPABASE_KEY';
  
  if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.error('❌ Supabase URL not found! Check your .env.local file');
    return;
  }
  
  try {
    // Test query to restaurants
    const restaurantsResponse = await fetch(`${supabaseUrl}/rest/v1/restaurants?select=id,name`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });
    
    const restaurants = await restaurantsResponse.json();
    console.log('✅ Restaurants found:', restaurants.length);
    console.log('📋 Restaurant list:');
    restaurants.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name} (${r.id})`);
    });
    console.log('');
    
    // Test query to menu_items
    console.log('🔍 Checking products...');
    const productsResponse = await fetch(`${supabaseUrl}/rest/v1/menu_items?select=id,name,restaurant_id&limit=10`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    });
    
    const products = await productsResponse.json();
    console.log('✅ Products found:', products.length);
    console.log('📦 Sample products:');
    products.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
      console.log(`     Restaurant ID: ${p.restaurant_id || 'NULL (unassigned)'}`);
    });
    console.log('');
    
    // Count products per restaurant
    console.log('📊 Products per restaurant:');
    for (const rest of restaurants) {
      const countResponse = await fetch(
        `${supabaseUrl}/rest/v1/menu_items?select=id&restaurant_id=eq.${rest.id}`, 
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer': 'count=exact'
          }
        }
      );
      const countData = await countResponse.json();
      console.log(`  ${rest.name}: ${countData.length} products`);
    }
    
    // Check unassigned
    const unassignedResponse = await fetch(
      `${supabaseUrl}/rest/v1/menu_items?select=id&restaurant_id=is.null`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'count=exact'
        }
      }
    );
    const unassignedData = await unassignedResponse.json();
    console.log(`  Unassigned (NULL): ${unassignedData.length} products`);
    console.log('');
    
    console.log('✅ Debug complete!');
    console.log('\n📋 SUMMARY:');
    console.log('- If you see products above, they exist in the database ✅');
    console.log('- If Products page is empty, there may be a React/query issue');
    console.log('- Check the Network tab for failed API requests');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
})();
```

---

## Alternative: Visit Debug Page

I've created a dedicated debug page for you:

**Go to: http://localhost:3000/debug**

This page will show you:
- ✅ Connection status
- ✅ Authentication status  
- ✅ Restaurants list
- ✅ Products count per restaurant
- ✅ Current selected restaurant
- ✅ Test query results

---

## What To Look For

### ✅ Good Signs:
- "Connected successfully" message
- Shows list of restaurants
- Shows product counts
- Products found in database

### ❌ Bad Signs:
- "Not logged in" - You need to log in first
- "No restaurants found" - Need to create restaurants
- "0 products" for all restaurants - Products not imported
- Connection errors - Check .env.local file

---

## Quick Fixes Based on Results

### If "Not logged in":
1. Go to login page
2. Sign in with your Supabase credentials

### If "No restaurants found":
1. Go to Restaurants page
2. Create at least one restaurant

### If "0 products for all restaurants":
1. Products haven't been imported yet
2. Run: `node import-mustiplace-menu.js` from project root

### If "Connection error":
1. Check `admin-dashboard/.env.local` file exists
2. Verify `NEXT_PUBLIC_SUPABASE_URL` is set
3. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set

---

## After Running Debug

**Share these with me:**
1. What does the console output show?
2. Any errors (red text)?
3. How many products were found?
4. How many restaurants were found?
5. Is a restaurant selected?

This will help me understand exactly what's happening! 🔍


