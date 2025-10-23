import { supabase } from './supabase';

export const populateSampleData = async () => {
  try {
    console.log('Populating sample data...');

    // Sample categories
    const categories = [
      { name: 'Pizza', description: 'Delicious pizzas with various toppings' },
      { name: 'Burgers', description: 'Juicy burgers and sandwiches' },
      { name: 'Pasta', description: 'Italian pasta dishes' },
      { name: 'Salads', description: 'Fresh and healthy salads' },
      { name: 'Desserts', description: 'Sweet treats and desserts' },
      { name: 'Beverages', description: 'Drinks and beverages' },
    ];

    // Insert categories
    for (const category of categories) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'name' })
        .select();
      
      if (error) {
        console.log('Error inserting category:', category.name, error);
      } else {
        console.log('Successfully inserted category:', category.name, data);
      }
    }

    // Sample menu items
    const menuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
        price: 12.99,
        image_url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500',
        categories: ['Pizza'],
        rating: 4.5,
        is_available: true,
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Pizza topped with pepperoni and mozzarella cheese',
        price: 14.99,
        image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
        categories: ['Pizza'],
        rating: 4.7,
        is_available: true,
      },
      {
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, onion, and special sauce',
        price: 9.99,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
        categories: ['Burgers'],
        rating: 4.3,
        is_available: true,
      },
      {
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with lettuce, tomato, and mayo',
        price: 8.99,
        image_url: 'https://images.unsplash.com/photo-1606755962773-d324e2640b44?w=500',
        categories: ['Burgers'],
        rating: 4.4,
        is_available: true,
      },
      {
        name: 'Spaghetti Carbonara',
        description: 'Pasta with eggs, cheese, pancetta, and black pepper',
        price: 13.99,
        image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500',
        categories: ['Pasta'],
        rating: 4.6,
        is_available: true,
      },
      {
        name: 'Caesar Salad',
        description: 'Romaine lettuce with parmesan cheese, croutons, and caesar dressing',
        price: 7.99,
        image_url: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
        categories: ['Salads'],
        rating: 4.2,
        is_available: true,
      },
      {
        name: 'Greek Salad',
        description: 'Fresh vegetables with feta cheese, olives, and olive oil',
        price: 8.99,
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
        categories: ['Salads'],
        rating: 4.4,
        is_available: true,
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 5.99,
        image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
        categories: ['Desserts'],
        rating: 4.8,
        is_available: true,
      },
      {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee and mascarpone',
        price: 6.99,
        image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
        categories: ['Desserts'],
        rating: 4.7,
        is_available: true,
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 3.99,
        image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500',
        categories: ['Beverages'],
        rating: 4.1,
        is_available: true,
      },
    ];

    // Insert menu items
    for (const item of menuItems) {
      const { data, error } = await supabase
        .from('menu_items')
        .upsert(item, { onConflict: 'name' })
        .select();
      
      if (error) {
        console.log('Error inserting menu item:', item.name, error);
      } else {
        console.log('Successfully inserted menu item:', item.name, 'with categories:', item.categories);
      }
    }

    console.log('Sample data populated successfully!');
    return true;
  } catch (error) {
    console.error('Error populating sample data:', error);
    return false;
  }
};

export const checkAndPopulateData = async () => {
  try {
    // Check if we have any menu items
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);

    if (menuError) {
      console.log('Error checking menu items:', menuError);
      return false;
    }

    // If no menu items, populate sample data
    if (!menuItems || menuItems.length === 0) {
      console.log('No menu items found, populating sample data...');
      return await populateSampleData();
    }

    console.log('Menu items already exist, skipping population');
    return true;
  } catch (error) {
    console.error('Error checking data:', error);
    return false;
  }
};
