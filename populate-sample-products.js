// Script to populate sample products in the database
// Run this with: node populate-sample-products.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleProducts = [
  {
    name: "Classic Cheeseburger",
    description: "Juicy beef patty with melted cheese, lettuce, tomato, and our special sauce",
    price: 12.99,
    image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
    categories: ["Burgers", "Main Course"],
    is_available: true,
    is_featured: true,
    preparation_time: 15,
    ingredients: ["Beef Patty", "Cheese", "Lettuce", "Tomato", "Onion", "Special Sauce"],
    dietary_tags: ["Contains Dairy", "Contains Gluten"],
    difficulty_level: "easy",
    spice_level: "mild",
    cuisine_type: "american",
    cooking_method: "grilled"
  },
  {
    name: "Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella, tomato sauce, and basil",
    price: 16.99,
    image_url: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500",
    categories: ["Pizza", "Italian"],
    is_available: true,
    is_featured: true,
    preparation_time: 20,
    ingredients: ["Pizza Dough", "Mozzarella", "Tomato Sauce", "Fresh Basil", "Olive Oil"],
    dietary_tags: ["Vegetarian", "Contains Gluten", "Contains Dairy"],
    difficulty_level: "medium",
    spice_level: "mild",
    cuisine_type: "italian",
    cooking_method: "baked"
  },
  {
    name: "Chicken Caesar Salad",
    description: "Fresh romaine lettuce with grilled chicken, parmesan cheese, croutons, and caesar dressing",
    price: 14.99,
    image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500",
    categories: ["Salads", "Healthy"],
    is_available: true,
    is_featured: false,
    preparation_time: 10,
    ingredients: ["Romaine Lettuce", "Grilled Chicken", "Parmesan Cheese", "Croutons", "Caesar Dressing"],
    dietary_tags: ["Contains Dairy", "Contains Gluten"],
    difficulty_level: "easy",
    spice_level: "mild",
    cuisine_type: "american",
    cooking_method: "raw"
  },
  {
    name: "Spicy Thai Basil Chicken",
    description: "Stir-fried chicken with fresh basil, chili peppers, and aromatic Thai spices",
    price: 18.99,
    image_url: "https://images.unsplash.com/photo-1563379091339-03246963d4b0?w=500",
    categories: ["Asian", "Spicy", "Main Course"],
    is_available: true,
    is_featured: true,
    preparation_time: 25,
    ingredients: ["Chicken Breast", "Thai Basil", "Chili Peppers", "Garlic", "Soy Sauce", "Fish Sauce"],
    dietary_tags: ["Gluten-Free", "Dairy-Free"],
    difficulty_level: "medium",
    spice_level: "hot",
    cuisine_type: "thai",
    cooking_method: "stir-fried"
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten chocolate center, served with vanilla ice cream",
    price: 8.99,
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500",
    categories: ["Desserts", "Chocolate"],
    is_available: true,
    is_featured: false,
    preparation_time: 30,
    ingredients: ["Dark Chocolate", "Butter", "Eggs", "Sugar", "Flour", "Vanilla Ice Cream"],
    dietary_tags: ["Contains Dairy", "Contains Gluten", "Contains Eggs"],
    difficulty_level: "hard",
    spice_level: "mild",
    cuisine_type: "american",
    cooking_method: "baked"
  }
];

async function populateProducts() {
  console.log('🚀 Populating sample products...\n');

  try {
    // First, check if we have a restaurant
    const { data: restaurants, error: restError } = await supabase
      .from('restaurants')
      .select('id')
      .limit(1);

    if (restError) {
      console.error('❌ Error checking restaurants:', restError);
      return;
    }

    let restaurantId;
    if (restaurants && restaurants.length > 0) {
      restaurantId = restaurants[0].id;
      console.log(`✅ Using existing restaurant ID: ${restaurantId}`);
    } else {
      // Create a default restaurant
      const { data: newRestaurant, error: createError } = await supabase
        .from('restaurants')
        .insert({
          name: 'MustiApp Restaurant',
          description: 'Your favorite local restaurant',
          address: '123 Main St, City, State',
          phone: '+1-555-0123',
          email: 'info@mustiapp.com',
          is_active: true,
          delivery_fee: 2.99,
          minimum_order: 15.00
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating restaurant:', createError);
        return;
      }

      restaurantId = newRestaurant.id;
      console.log(`✅ Created new restaurant with ID: ${restaurantId}`);
    }

    // Insert sample products
    console.log('\n📦 Inserting sample products...');
    
    const productsWithRestaurantId = sampleProducts.map(product => ({
      ...product,
      restaurant_id: restaurantId
    }));

    const { data: insertedProducts, error: insertError } = await supabase
      .from('menu_items')
      .insert(productsWithRestaurantId)
      .select();

    if (insertError) {
      console.error('❌ Error inserting products:', insertError);
      return;
    }

    console.log(`✅ Successfully inserted ${insertedProducts.length} products:`);
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
    });

    // Create some sample categories if they don't exist
    console.log('\n📂 Creating sample categories...');
    
    const categories = [
      { name: 'Burgers', description: 'Juicy grilled burgers', is_active: true },
      { name: 'Pizza', description: 'Oven-baked cheesy pizzas', is_active: true },
      { name: 'Salads', description: 'Fresh and healthy salads', is_active: true },
      { name: 'Asian', description: 'Asian cuisine dishes', is_active: true },
      { name: 'Desserts', description: 'Sweet treats and desserts', is_active: true },
      { name: 'Main Course', description: 'Main course dishes', is_active: true },
      { name: 'Healthy', description: 'Healthy and nutritious options', is_active: true },
      { name: 'Spicy', description: 'Spicy and hot dishes', is_active: true },
      { name: 'Italian', description: 'Traditional Italian cuisine', is_active: true },
      { name: 'Chocolate', description: 'Chocolate-based desserts', is_active: true }
    ];

    const { data: insertedCategories, error: catError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'name' })
      .select();

    if (catError) {
      console.error('❌ Error inserting categories:', catError);
    } else {
      console.log(`✅ Successfully created/updated ${insertedCategories.length} categories`);
    }

    console.log('\n🎉 Database population complete!');
    console.log('💡 You can now test your app with these sample products.');

  } catch (error) {
    console.error('❌ Error in populate script:', error);
  }
}

// Run the population script
populateProducts().then(() => {
  console.log('\n✅ Population script complete!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Population script failed:', error);
  process.exit(1);
});
