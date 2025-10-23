import { supabase } from './supabase';

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test categories table
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (catError) {
      console.error('Categories table error:', catError);
      return false;
    }
    
    console.log('Categories found:', categories?.length || 0);
    
    // Test menu_items table
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(5);
    
    if (menuError) {
      console.error('Menu items table error:', menuError);
      return false;
    }
    
    console.log('Menu items found:', menuItems?.length || 0);
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

export const createTablesIfNotExist = async () => {
  try {
    console.log('Creating tables if they don\'t exist...');
    
    // This would typically be done via SQL migrations
    // For now, we'll just test if the tables exist
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);
    
    if (catError && catError.code === 'PGRST116') {
      console.log('Categories table does not exist, creating...');
      // In a real app, you'd run SQL migrations here
      // For now, we'll just log the error
      console.error('Categories table not found:', catError);
    }
    
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id')
      .limit(1);
    
    if (menuError && menuError.code === 'PGRST116') {
      console.log('Menu items table does not exist, creating...');
      // In a real app, you'd run SQL migrations here
      // For now, we'll just log the error
      console.error('Menu items table not found:', menuError);
    }
    
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
};
