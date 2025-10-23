const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

const dummyData = {
  categories: [
    { name: "Burgers", description: "Juicy grilled burgers" },
    { name: "Pizzas", description: "Oven-baked cheesy pizzas" },
    { name: "Burritos", description: "Rolled Mexican delights" },
    { name: "Sandwiches", description: "Stacked and stuffed sandwiches" },
    { name: "Wraps", description: "Rolled up wraps packed with flavor" },
    { name: "Bowls", description: "Balanced rice and protein bowls" },
  ],
  menu: [
    {
      name: "Classic Cheeseburger",
      description: "Beef patty, cheese, lettuce, tomato",
      image_url: "https://static.vecteezy.com/system/resources/previews/044/844/600/large_2x/homemade-fresh-tasty-burger-with-meat-and-cheese-classic-cheese-burger-and-vegetable-ai-generated-free-png.png",
      price: 25.99,
      rating: 4.5,
      calories: 550,
      protein: 25,
      category_name: "Burgers",
    },
    {
      name: "Pepperoni Pizza",
      description: "Loaded with cheese and pepperoni slices",
      image_url: "https://static.vecteezy.com/system/resources/previews/023/742/417/large_2x/pepperoni-pizza-isolated-illustration-ai-generative-free-png.png",
      price: 30.99,
      rating: 4.7,
      calories: 700,
      protein: 30,
      category_name: "Pizzas",
    },
    {
      name: "Bean Burrito",
      description: "Stuffed with beans, rice, salsa",
      image_url: "https://static.vecteezy.com/system/resources/previews/055/133/581/large_2x/deliciously-grilled-burritos-filled-with-beans-corn-and-fresh-vegetables-served-with-lime-wedge-and-cilantro-isolated-on-transparent-background-free-png.png",
      price: 20.99,
      rating: 4.2,
      calories: 480,
      protein: 18,
      category_name: "Burritos",
    },
    {
      name: "BBQ Bacon Burger",
      description: "Smoky BBQ sauce, crispy bacon, cheddar",
      image_url: "https://static.vecteezy.com/system/resources/previews/060/236/245/large_2x/a-large-hamburger-with-cheese-onions-and-lettuce-free-png.png",
      price: 27.5,
      rating: 4.8,
      calories: 650,
      protein: 29,
      category_name: "Burgers",
    },
    {
      name: "Chicken Caesar Wrap",
      description: "Grilled chicken, lettuce, Caesar dressing",
      image_url: "https://static.vecteezy.com/system/resources/previews/048/930/603/large_2x/caesar-wrap-grilled-chicken-isolated-on-transparent-background-free-png.png",
      price: 21.5,
      rating: 4.4,
      calories: 490,
      protein: 28,
      category_name: "Wraps",
    },
  ],
};

async function seed() {
  console.log('🌱 Seeding database...');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Insert categories
    console.log('📂 Inserting categories...');
    const { error: catError } = await supabase
      .from('categories')
      .insert(dummyData.categories);
    
    if (catError) throw catError;
    console.log(`✅ Inserted ${dummyData.categories.length} categories`);
    
    // Insert menu items
    console.log('🍔 Inserting menu items...');
    const menuItems = dummyData.menu.map(item => ({
      name: item.name,
      price: item.price,
      image_url: item.image_url,
      description: item.description,
      calories: item.calories,
      protein: item.protein,
      rating: item.rating,
      type: item.category_name,
      categories: [item.category_name],
    }));
    
    const { error: menuError } = await supabase
      .from('menu_items')
      .insert(menuItems);
    
    if (menuError) throw menuError;
    console.log(`✅ Inserted ${menuItems.length} menu items`);
    
    console.log('🎉 Database seeded successfully!');
    console.log('\n📱 Ready to start the app:');
    console.log('npm start');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();

