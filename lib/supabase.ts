import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateEnvironment } from './env-validation';

// Validate environment variables
validateEnvironment();

// Supabase configuration with fallbacks for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ CRITICAL: Supabase credentials are missing!');
  if (!__DEV__) {
    throw new Error('Supabase configuration is missing. The app cannot function without it.');
  }
}

// Create Supabase client with AsyncStorage for auth persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ============================================================================
// AUTHENTICATION FUNCTIONS
// ============================================================================

export interface CreateUserParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

/**
 * Create a new user account
 */
export const createUser = async ({ email, password, name }: CreateUserParams) => {
  try {
    // 1. Sign up with Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Store name in user metadata
        },
      },
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('Failed to create user');

    // 2. Create user profile in public.users table
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      })
      .select()
      .single();

    if (profileError) throw profileError;

    return userData;
  } catch (error: any) {
    console.error('Create user error:', error);
    throw new Error(error.message || 'Failed to create user');
  }
};

/**
 * Sign in existing user
 */
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to sign in');

    // Get user profile from database
    const user = await getCurrentUser();
    return user;
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: __DEV__ 
          ? 'exp://localhost:8081/--/auth/callback'
          : 'mustiplace://auth/callback',
      },
    });

    if (error) {
      if (__DEV__) {
        console.error('Google sign in error:', error);
      }
      throw error;
    }
    return data;
  } catch (error: any) {
    if (__DEV__) {
      console.error('Google sign in error:', error);
    }
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: __DEV__ 
          ? 'exp://localhost:8081/--/auth/callback'
          : 'mustiplace://auth/callback',
      },
    });

    if (error) {
      if (__DEV__) {
        console.error('Apple sign in error:', error);
      }
      throw error;
    }
    return data;
  } catch (error: any) {
    if (__DEV__) {
      console.error('Apple sign in error:', error);
    }
    throw new Error(error.message || 'Failed to sign in with Apple');
  }
};

/**
 * Send OTP to phone number
 */
export const signInWithPhone = async (phone: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Phone sign in error:', error);
    throw new Error(error.message || 'Failed to send OTP');
  }
};

/**
 * Reset password - sends password reset email
 */
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'mustiapp://reset-password',
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
};

/**
 * Update password with new password
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Update password error:', error);
    throw new Error(error.message || 'Failed to update password');
  }
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (phone: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to verify OTP');

    // Check if user profile exists, create if not
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!existingUser) {
      // Create user profile
      await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          phone,
          name: phone, // Use phone as initial name
          avatar: `https://ui-avatars.com/api/?name=${phone}&background=random`,
        });
    }

    const user = await getCurrentUser();
    return user;
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    throw new Error(error.message || 'Failed to verify OTP');
  }
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    // Get auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) throw sessionError;
    if (!session?.user) return null;

    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) throw userError;

    // Return user with both auth and profile data
    return {
      ...userData,
      $id: userData.id, // For backward compatibility with Appwrite structure
    };
  } catch (error: any) {
    console.error('Get current user error:', error);
    return null;
  }
};

// ============================================================================
// MENU & CATEGORY FUNCTIONS
// ============================================================================

export interface GetMenuParams {
  category?: string;
  query?: string;
  limit?: number;
}

/**
 * Get menu items with optional filters
 */
export const getMenu = async ({ category = '', query = '', limit }: GetMenuParams = {}) => {
  try {
    let supabaseQuery = supabase
      .from('menu_items')
      .select('*')
      .order('name', { ascending: true });

    // Filter by category if provided
    if (category && category !== 'All') {
      supabaseQuery = supabaseQuery.contains('categories', [category]);
    }

    // Search by name if query provided
    if (query) {
      supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
    }

    // Apply limit if provided
    if (limit) {
      supabaseQuery = supabaseQuery.limit(limit);
    }

    const { data, error } = await supabaseQuery;

    if (error) throw error;

    // Transform to match Appwrite structure (with $id)
    return (data || []).map(item => ({
      ...item,
      $id: item.id,
    }));
  } catch (error: any) {
    console.error('Get menu error:', error);
    throw new Error(error.message || 'Failed to fetch menu items');
  }
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    // Get all menu items to count by category
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('categories');

    if (menuError) {
      console.log('Error fetching menu items for count:', menuError);
    }

    // Count items per category
    const categoryCounts: { [key: string]: number } = {};
    if (menuItems) {
      menuItems.forEach(item => {
        if (item.categories && Array.isArray(item.categories)) {
          item.categories.forEach((category: string) => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        }
      });
    }

    // Transform to match Appwrite structure and add item count
    return (data || []).map(category => ({
      ...category,
      $id: category.id,
      item_count: categoryCounts[category.name] || 0,
    }));
  } catch (error: any) {
    console.error('Get categories error:', error);
    throw new Error(error.message || 'Failed to fetch categories');
  }
};

// ============================================================================
// USER PROFILE FUNCTIONS
// ============================================================================

/**
 * Update user profile information
 */
export const updateUserProfile = async (userId: string, profileData: {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
}) => {
  try {
    // Update user metadata in auth
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
        phone: profileData.phone,
        address: profileData.address,
      }
    });

    if (authError) throw authError;

    // Update or insert user profile in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name: profileData.name,
        email: profileData.email,
        avatar: profileData.avatar,
        phone: profileData.phone,
        address: profileData.address,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error: any) {
    console.error('Update profile error:', error);
    return { data: null, error };
  }
};

/**
 * Get user profile information
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get profile error:', error);
    return { data: null, error };
  }
};

/**
 * Initialize user profile (create if doesn't exist)
 */
export const initializeUserProfile = async (userId: string, userData: {
  name: string;
  email: string;
  avatar?: string;
}) => {
  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Create new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }

    return { data: existingProfile, error: null };
  } catch (error: any) {
    console.error('Initialize profile error:', error);
    return { data: null, error };
  }
};

// ============================================================================
// PROMOTION FUNCTIONS
// ============================================================================

/**
 * Get active promotions
 */
export const getPromotions = async () => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .gt('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

// ============================================================================
// ORDER FUNCTIONS
// ============================================================================

/**
 * Create a new order
 */
export const createOrder = async (orderData: {
  customer_id: string;
  customer_name?: string;
  delivery_address: any;
  phone_number?: string;
  items: any[];
  total: number;
  special_instructions?: string;
  payment_method?: 'card' | 'cash';
  status?: string;
  restaurant_id?: string;
}) => {
  try {
    // 1. Create the order with only existing columns
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        phone_number: orderData.phone_number,
        status: orderData.status || 'draft',
        total: orderData.total,
        delivery_address: orderData.delivery_address,
        special_instructions: orderData.special_instructions,
        // Remove payment_method and restaurant_id if they don't exist
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Create order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      customizations: item.customizations || [],
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return {
      ...order,
      $id: order.id, // Backward compatibility
      id: order.id,
    };
  } catch (error: any) {
    console.error('Create order error:', error);
    throw new Error(error.message || 'Failed to create order');
  }
};

/**
 * Get orders for a specific user
 */
export const getUserOrders = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          unit_price,
          customizations,
          menu_items (
            id,
            name,
            image_url
          )
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to expected structure
    return (data || []).map(order => ({
      ...order,
      $id: order.id,
    }));
  } catch (error: any) {
    console.error('Get user orders error:', error);
    return [];
  }
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to category changes (real-time)
 */
export const subscribeCategoriesRealtime = (callback: () => void) => {
  const channel = supabase
    .channel('categories_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
      },
      () => {
        console.log('📡 Categories updated');
        callback();
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Subscribe to user's order changes (real-time)
 */
export const subscribeUserOrdersRealtime = (userId: string, callback: () => void) => {
  console.log('🔗 Setting up real-time subscription for user:', userId);
  
  const channel = supabase
    .channel(`orders_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${userId}`,
      },
      (payload) => {
        console.log('📡 Orders updated:', payload);
        console.log('📡 Event type:', payload.eventType);
        console.log('📡 New data:', payload.new);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
    });

  // Return unsubscribe function
  return () => {
    console.log('🔌 Unsubscribing from orders real-time');
    supabase.removeChannel(channel);
  };
};

// ============================================================================
// ADDONS FUNCTIONS
// ============================================================================

/**
 * Get all addons from the database
 */
export const getAddons = async () => {
  try {
    console.log('🔄 Fetching addons from database...');
    
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching addons:', error);
      throw error;
    }

    console.log('✅ Addons fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Failed to fetch addons:', error);
    return [];
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Get current auth session
 */
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Note: Types are already exported with their declarations above
