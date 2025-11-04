import { supabase } from './supabase';

// Export supabase client for direct queries
export { supabase };

// Database service functions to replace hardcoded data

// ============================================================================
// RESTAURANTS
// ============================================================================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisine_type: string;
  phone: string;
  email: string;
  logo_url: string;
  cover_image_url: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  delivery_radius: number;
  delivery_fee: number;
  minimum_order: number;
  preparation_time: number;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

// Get all active restaurants
export const getRestaurants = async (filters?: {
  is_featured?: boolean;
  is_active?: boolean;
}): Promise<Restaurant[]> => {
  try {
    let query = supabase
      .from('restaurants')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false });

    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    } else {
      query = query.eq('is_active', true); // Default to active only
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return [];
  }
};

// Get single restaurant
export const getRestaurantById = async (restaurantId: string): Promise<Restaurant | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
};

// Get restaurant by slug
export const getRestaurantBySlug = async (slug: string): Promise<Restaurant | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
};

// ============================================================================
// MENU & CATEGORIES
// ============================================================================

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  categories: string[];
  is_available: boolean;
  is_featured: boolean;
  preparation_time?: number;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: string;
  name: string;
  type: string;
  price: number;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Get all menu items
export const getMenuItems = async (filters?: {
  category?: string;
  restaurant_id?: string;
  is_available?: boolean;
  is_featured?: boolean;
  limit?: number;
}): Promise<MenuItem[]> => {
  try {
    let query = supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category && filters.category !== 'all') {
      query = query.contains('categories', [filters.category]);
    }

    if (filters?.restaurant_id) {
      query = query.eq('restaurant_id', filters.restaurant_id);
    }

    if (filters?.is_available !== undefined) {
      query = query.eq('is_available', filters.is_available);
    }

    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      if (__DEV__) {
        console.error('Error fetching menu items:', error);
      }
      throw error;
    }

    // Normalize IDs to match app expectations
    const normalizedData = (data || []).map(item => ({
      ...item,
      $id: item.id, // Add $id field for compatibility
    }));

    return normalizedData;
  } catch (error) {
    console.error('Error in getMenuItems:', error);
    return [];
  }
};

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }); // Fallback to name if sort_order is same

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    // Normalize IDs to match app expectations
    const normalizedData = (data || []).map(item => ({
      ...item,
      $id: item.id, // Add $id field for compatibility
    }));

    return normalizedData;
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
};

// Update category sort order
export const updateCategoryOrder = async (categoryId: string, sortOrder: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ sort_order: sortOrder })
      .eq('id', categoryId);

    if (error) {
      console.error('Error updating category order:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateCategoryOrder:', error);
    throw error;
  }
};

// Batch update category orders
export const updateCategoriesOrder = async (updates: { id: string; sort_order: number }[]): Promise<void> => {
  try {
    // Update each category's sort_order
    const promises = updates.map(({ id, sort_order }) =>
      supabase
        .from('categories')
        .update({ sort_order })
        .eq('id', id)
    );

    await Promise.all(promises);
  } catch (error) {
    console.error('Error in updateCategoriesOrder:', error);
    throw error;
  }
};

// Get menu item by ID
export const getMenuItemById = async (id: string): Promise<MenuItem | null> => {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }

    if (!data) return null;

    // Normalize ID to match app expectations
    const normalizedData = {
      ...data,
      $id: data.id, // Add $id field for compatibility
    };

    return normalizedData;
  } catch (error) {
    console.error('Error in getMenuItemById:', error);
    return null;
  }
};

// Get addons for menu items
export const getAddons = async (): Promise<Addon[]> => {
  try {
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching addons:', error);
      throw error;
    }

    // Normalize IDs to match app expectations
    const normalizedData = (data || []).map(item => ({
      ...item,
      $id: item.id, // Add $id field for compatibility
    }));

    return normalizedData;
  } catch (error) {
    console.error('Error in getAddons:', error);
    return [];
  }
};

// Get addons for a specific menu item (only assigned addons)
export const getAddonsForMenuItem = async (menuItem: any): Promise<Addon[]> => {
  try {
    // Get available_addons from the menu item
    // It can be: UUID[], JSONB array, or null/undefined
    let availableAddonIds: string[] = [];

    if (menuItem.available_addons) {
      if (Array.isArray(menuItem.available_addons)) {
        // Handle UUID[] format
        availableAddonIds = menuItem.available_addons;
      } else if (typeof menuItem.available_addons === 'string') {
        // Handle JSONB string format
        try {
          const parsed = JSON.parse(menuItem.available_addons);
          availableAddonIds = Array.isArray(parsed) ? parsed : [];
        } catch {
          // If parsing fails, try treating as single ID
          availableAddonIds = [menuItem.available_addons];
        }
      }
    }

    // If no addons assigned, return empty array
    if (availableAddonIds.length === 0) {
      return [];
    }

    // Fetch only the assigned addons
    const { data, error } = await supabase
      .from('addons')
      .select('*')
      .in('id', availableAddonIds)
      .eq('is_active', true)
      .order('type', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching addons for menu item:', error);
      throw error;
    }

    // Normalize IDs to match app expectations
    const normalizedData = (data || []).map(item => ({
      ...item,
      $id: item.id, // Add $id field for compatibility
    }));

    return normalizedData;
  } catch (error) {
    console.error('Error in getAddonsForMenuItem:', error);
    return [];
  }
};

// ============================================================================
// USER ADDRESSES
// ============================================================================

export interface UserAddress {
  id: string;
  user_id: string;
  label: string;
  street_address: string;
  apartment?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  delivery_instructions?: string;
  contact_name?: string;
  contact_phone?: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Get user addresses
export const getUserAddresses = async (userId: string): Promise<UserAddress[]> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false});

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
};

// Get default address
export const getDefaultAddress = async (userId: string): Promise<UserAddress | null> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching default address:', error);
    return null;
  }
};

// Create address
export const createAddress = async (address: Omit<UserAddress, 'id' | 'created_at' | 'updated_at'>): Promise<UserAddress | null> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .insert(address)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating address:', error);
    return null;
  }
};

// Update address
export const updateAddress = async (addressId: string, updates: Partial<UserAddress>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .update(updates)
      .eq('id', addressId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
};

// Delete address
export const deleteAddress = async (addressId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
};

// Set default address
export const setDefaultAddress = async (userId: string, addressId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting default address:', error);
    return false;
  }
};

// ============================================================================
// PAYMENT METHODS
// ============================================================================

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id?: string;
  type: string;
  last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  is_default: boolean;
  created_at: string;
}

// Get user payment methods
export const getUserPaymentMethods = async (userId: string): Promise<PaymentMethod[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPaymentMethods:', error);
    return [];
  }
};

// Get default payment method
export const getDefaultPaymentMethod = async (userId: string): Promise<PaymentMethod | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching default payment method:', error);
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error in getDefaultPaymentMethod:', error);
    return null;
  }
};

// Create payment method
export const createPaymentMethod = async (
  paymentMethod: Omit<PaymentMethod, 'id' | 'created_at'>
): Promise<PaymentMethod | null> => {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentMethod)
      .select()
      .single();

    if (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }

    console.log('✅ Payment method created');
    return data;
  } catch (error) {
    console.error('Error in createPaymentMethod:', error);
    return null;
  }
};

// Delete payment method
export const deletePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId);

    if (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }

    console.log('✅ Payment method deleted');
    return true;
  } catch (error) {
    console.error('Error in deletePaymentMethod:', error);
    return false;
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (
  userId: string,
  paymentMethodId: string
): Promise<boolean> => {
  try {
    // The trigger in the database will handle unsetting other defaults
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }

    console.log('✅ Default payment method updated');
    return true;
  } catch (error) {
    console.error('Error in setDefaultPaymentMethod:', error);
    return false;
  }
};

// ============================================================================
// RESTAURANT SETTINGS
// ============================================================================

export interface RestaurantSettings {
  id: string;
  restaurant_id: string;
  delivery_fee: number;
  minimum_order: number;
  tax_rate: number;
  preparation_time: number;
  delivery_radius: number;
  is_accepting_orders: boolean;
  business_hours: any;
  created_at: string;
  updated_at: string;
}

// Get restaurant settings
export const getRestaurantSettings = async (restaurantId: string): Promise<RestaurantSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .single();

    if (error) {
      console.warn('No settings found for restaurant, using defaults');
      // Return default settings if none exist
      return {
        id: '',
        restaurant_id: restaurantId,
        delivery_fee: 2.99,
        minimum_order: 10.00,
        tax_rate: 0.10,
        preparation_time: 30,
        delivery_radius: 5.00,
        is_accepting_orders: true,
        business_hours: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return data;
  } catch (error) {
    console.error('Error fetching restaurant settings:', error);
    return null;
  }
};

// Update restaurant settings
export const updateRestaurantSettings = async (
  restaurantId: string,
  settings: Partial<RestaurantSettings>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('restaurant_settings')
      .upsert({
        restaurant_id: restaurantId,
        ...settings,
      })
      .eq('restaurant_id', restaurantId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating restaurant settings:', error);
    return false;
  }
};

// ============================================================================
// LOYALTY & REWARDS
// ============================================================================

export interface LoyaltyPoints {
  id: string;
  user_id: string;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  order_id?: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'referral';
  description?: string;
  created_at: string;
}

export interface Reward {
  id: string;
  title: string;
  description?: string;
  points_required: number;
  discount_type?: 'percentage' | 'fixed' | 'free_item';
  discount_value?: number;
  image_url?: string;
  active: boolean;
  tier_required?: 'bronze' | 'silver' | 'gold' | 'platinum';
  max_redemptions?: number;
  current_redemptions?: number;
  expiry_date?: string;
  display_order?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface UserReward {
  id: string;
  user_id: string;
  reward_id: string;
  redeemed: boolean;
  redeemed_at?: string;
  order_id?: string;
  expires_at?: string;
  created_at: string;
  rewards?: Reward;
}

// Get tier based on points
const calculateTier = (points: number): 'bronze' | 'silver' | 'gold' | 'platinum' => {
  if (points >= 4000) return 'platinum';
  if (points >= 1500) return 'gold';
  if (points >= 500) return 'silver';
  return 'bronze';
};

// Get tier multiplier for points earning
const getTierMultiplier = (tier: string): number => {
  switch (tier) {
    case 'platinum': return 3;
    case 'gold': return 2;
    case 'silver': return 1.5;
    default: return 1;
  }
};

// Get or create user loyalty points
export const getLoyaltyPoints = async (userId: string): Promise<LoyaltyPoints | null> => {
  try {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If user doesn't have loyalty points, create them
      if (error.code === 'PGRST116') {
        const { data: newPoints, error: createError } = await supabase
          .from('loyalty_points')
          .insert({
            user_id: userId,
            points: 0,
            tier: 'bronze',
            total_earned: 0,
            total_spent: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        return newPoints;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return null;
  }
};

// Get all active rewards
export const getRewards = async (): Promise<Reward[]> => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('active', true)
      .order('points_required', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
};

// Get user's redeemed rewards
export const getUserRewards = async (userId: string): Promise<UserReward[]> => {
  try {
    const { data, error } = await supabase
      .from('user_rewards')
      .select('*, rewards(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    return [];
  }
};

// Get points transaction history
export const getPointsTransactions = async (userId: string, limit: number = 50): Promise<PointsTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching points transactions:', error);
    return [];
  }
};

// Add points to user (on order completion, bonus, etc.)
export const addPoints = async (
  userId: string,
  points: number,
  type: 'earned' | 'bonus' | 'referral',
  description?: string,
  orderId?: string
): Promise<boolean> => {
  try {
    // Get current loyalty points
    const loyalty = await getLoyaltyPoints(userId);
    if (!loyalty) throw new Error('Failed to get loyalty points');

    // Calculate new points and tier
    const newPoints = loyalty.points + points;
    const newTier = calculateTier(newPoints);
    const newTotalEarned = loyalty.total_earned + points;

    // Update loyalty points
    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        tier: newTier,
        total_earned: newTotalEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        order_id: orderId,
        points: points,
        type: type,
        description: description || `${type} points`,
      });

    if (transactionError) throw transactionError;

    console.log(`✅ Added ${points} points to user ${userId}. New total: ${newPoints}`);
    return true;
  } catch (error) {
    console.error('Error adding points:', error);
    return false;
  }
};

// Redeem a reward
export const redeemReward = async (userId: string, rewardId: string): Promise<UserReward | null> => {
  try {
    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .eq('active', true)
      .single();

    if (rewardError || !reward) throw new Error('Reward not found');

    // Get user loyalty points
    const loyalty = await getLoyaltyPoints(userId);
    if (!loyalty) throw new Error('Failed to get loyalty points');

    // Check if user has enough points
    if (loyalty.points < reward.points_required) {
      throw new Error(`Insufficient points. Need ${reward.points_required}, have ${loyalty.points}`);
    }

    // Check tier requirement
    if (reward.tier_required) {
      const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
      const userTierIndex = tierOrder.indexOf(loyalty.tier);
      const requiredTierIndex = tierOrder.indexOf(reward.tier_required);
      
      if (userTierIndex < requiredTierIndex) {
        throw new Error(`Requires ${reward.tier_required} tier or higher`);
      }
    }

    // Deduct points
    const newPoints = loyalty.points - reward.points_required;
    const newTier = calculateTier(newPoints);
    const newTotalSpent = loyalty.total_spent + reward.points_required;

    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        tier: newTier,
        total_spent: newTotalSpent,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: -reward.points_required,
        type: 'redeemed',
        description: `Redeemed: ${reward.title}`,
      });

    if (transactionError) throw transactionError;

    // Create user reward record
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Reward valid for 30 days

    const { data: userReward, error: userRewardError } = await supabase
      .from('user_rewards')
      .insert({
        user_id: userId,
        reward_id: rewardId,
        redeemed: false,
        expires_at: expiresAt.toISOString(),
      })
      .select('*, rewards(*)')
      .single();

    if (userRewardError) throw userRewardError;

    console.log(`✅ Redeemed reward: ${reward.title} for ${reward.points_required} points`);
    return userReward;
  } catch (error) {
    console.error('Error redeeming reward:', error);
    throw error;
  }
};

// Mark reward as used (when applied to order)
export const useReward = async (userRewardId: string, orderId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_rewards')
      .update({
        redeemed: true,
        redeemed_at: new Date().toISOString(),
        order_id: orderId,
      })
      .eq('id', userRewardId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error using reward:', error);
    return false;
  }
};

// ============================================================================
// ADMIN LOYALTY & REWARDS MANAGEMENT
// ============================================================================

export interface LoyaltySetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  updated_by?: string;
  updated_at: string;
  created_at: string;
}

// Get all rewards (including inactive) for admin
export const getAllRewards = async (): Promise<Reward[]> => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all rewards:', error);
    return [];
  }
};

// Create a new reward (admin only)
export const createReward = async (rewardData: {
  title: string;
  description?: string;
  points_required: number;
  discount_type?: 'percentage' | 'fixed' | 'free_item';
  discount_value?: number;
  image_url?: string;
  active?: boolean;
  tier_required?: string;
  max_redemptions?: number;
  expiry_date?: string;
  display_order?: number;
}): Promise<Reward | null> => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .insert({
        ...rewardData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating reward:', error);
    throw error;
  }
};

// Update a reward (admin only)
export const updateReward = async (
  rewardId: string,
  rewardData: Partial<Reward>
): Promise<Reward | null> => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .update({
        ...rewardData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', rewardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating reward:', error);
    throw error;
  }
};

// Delete a reward (admin only)
export const deleteReward = async (rewardId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', rewardId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting reward:', error);
    return false;
  }
};

// Get loyalty settings
export const getLoyaltySettings = async (): Promise<LoyaltySetting[]> => {
  try {
    const { data, error } = await supabase
      .from('loyalty_settings')
      .select('*')
      .order('setting_key', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching loyalty settings:', error);
    return [];
  }
};

// Update loyalty setting (admin only)
export const updateLoyaltySetting = async (
  settingKey: string,
  settingValue: any,
  description?: string
): Promise<LoyaltySetting | null> => {
  try {
    const { data, error } = await supabase
      .from('loyalty_settings')
      .upsert({
        setting_key: settingKey,
        setting_value: settingValue,
        description,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating loyalty setting:', error);
    throw error;
  }
};

// Get all loyalty points (admin - for analytics)
export const getAllLoyaltyPoints = async (limit: number = 100): Promise<LoyaltyPoints[]> => {
  try {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .order('points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all loyalty points:', error);
    return [];
  }
};

// Admin function to adjust user points
export const adjustUserPoints = async (
  userId: string,
  points: number,
  reason: string
): Promise<boolean> => {
  try {
    // Get current loyalty points
    const loyalty = await getLoyaltyPoints(userId);
    if (!loyalty) throw new Error('Failed to get loyalty points');

    // Calculate new points and tier
    const newPoints = Math.max(0, loyalty.points + points);
    const newTier = calculateTier(newPoints);

    // Update loyalty points
    const { error: updateError } = await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        tier: newTier,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        points: points,
        type: 'admin_adjustment',
        description: reason,
      });

    if (transactionError) throw transactionError;

    console.log(`✅ Adjusted ${points} points for user ${userId}. New total: ${newPoints}`);
    return true;
  } catch (error) {
    console.error('Error adjusting user points:', error);
    return false;
  }
};

// Get reward analytics (admin)
export const getRewardAnalytics = async (): Promise<{
  totalRewards: number;
  activeRewards: number;
  totalRedemptions: number;
  topRewards: Array<{ id: string; title: string; redemptions: number }>;
}> => {
  try {
    const rewards = await getAllRewards();
    const activeRewards = rewards.filter(r => r.active);

    // Get top redeemed rewards
    const { data: topRewards, error } = await supabase
      .from('rewards')
      .select('id, title, current_redemptions')
      .order('current_redemptions', { ascending: false })
      .limit(10);

    if (error) throw error;

    return {
      totalRewards: rewards.length,
      activeRewards: activeRewards.length,
      totalRedemptions: rewards.reduce((sum, r) => sum + (r.current_redemptions || 0), 0),
      topRewards: (topRewards || []).map(r => ({
        id: r.id,
        title: r.title,
        redemptions: r.current_redemptions || 0,
      })),
    };
  } catch (error) {
    console.error('Error fetching reward analytics:', error);
    return {
      totalRewards: 0,
      activeRewards: 0,
      totalRedemptions: 0,
      topRewards: [],
    };
  }
};

// ============================================================================
// ORDERS
// ============================================================================

export interface Order {
  id: string;
  customer_id: string;
  customer_name?: string;
  phone_number?: string;
  status: string;
  total: number;
  delivery_address: any;
  special_instructions?: string;
  estimated_delivery_time?: string;
  driver_location?: any;
  payment_intent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  customizations: any[];
  created_at: string;
  updated_at: string;
}

// Award points for completed order
export const awardOrderPoints = async (orderId: string, userId: string): Promise<boolean> => {
  try {
    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('total')
      .eq('id', orderId)
      .single();

    if (error || !order) throw new Error('Order not found');

    // Calculate points (1 point per dollar spent)
    const basePoints = Math.floor(order.total);
    
    // Get user's current tier to apply multiplier
    const loyalty = await getLoyaltyPoints(userId);
    const multiplier = loyalty ? getTierMultiplier(loyalty.tier) : 1;
    
    // Calculate final points with tier bonus
    const pointsToAward = Math.floor(basePoints * multiplier);

    // Award the points
    const success = await addPoints(
      userId,
      pointsToAward,
      'earned',
      `Order completed - $${order.total.toFixed(2)} (${multiplier}x ${loyalty?.tier || 'bronze'} bonus)`,
      orderId
    );

    if (success) {
      console.log(`🎯 Awarded ${pointsToAward} points for order ${orderId} ($${order.total})`);
    }

    return success;
  } catch (error) {
    console.error('Error awarding order points:', error);
    return false;
  }
};

// Create new order
export const createOrder = async (orderData: {
  customer_id: string;
  customer_name?: string;
  phone_number?: string;
  delivery_address: any;
  special_instructions?: string;
  restaurant_id?: string;
  stripe_payment_intent_id?: string;
  items: Array<{
    menu_item_id: string;
    quantity: number;
    unit_price: number;
    customizations?: any[];
  }>;
}): Promise<Order | null> => {
  try {
    // Get restaurant_id from first item if not provided
    let restaurantId = orderData.restaurant_id;
    if (!restaurantId && orderData.items.length > 0) {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('restaurant_id')
        .eq('id', orderData.items[0].menu_item_id)
        .single();
      
      restaurantId = menuItem?.restaurant_id;
    }

    // Get restaurant settings for dynamic pricing
    const settings = await getRestaurantSettings(restaurantId!);
    const deliveryFee = settings?.delivery_fee || 2.99;
    const taxRate = settings?.tax_rate || 0.10;

    // Calculate total
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + (item.unit_price * item.quantity),
      0
    );
    
    const tax = subtotal * taxRate;
    const total = subtotal + deliveryFee + tax;

    console.log('💰 Order pricing:', {
      subtotal,
      deliveryFee,
      taxRate,
      tax,
      total,
    });

    // Validate required fields
    if (!restaurantId) {
      console.error('❌ Missing restaurant_id');
      throw new Error('Restaurant ID is required');
    }

    if (!orderData.customer_id) {
      console.error('❌ Missing customer_id');
      throw new Error('Customer ID is required');
    }

    if (!orderData.items || orderData.items.length === 0) {
      console.error('❌ No items in order');
      throw new Error('Order must contain at least one item');
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name || 'Guest',
        phone_number: orderData.phone_number || '',
        restaurant_id: restaurantId,
        status: 'pending',
        total,
        delivery_address: orderData.delivery_address,
        special_instructions: orderData.special_instructions || '',
        payment_method: orderData.stripe_payment_intent_id ? 'card' : 'cash',
        payment_status: orderData.stripe_payment_intent_id ? 'completed' : 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        tax,
        stripe_payment_intent_id: orderData.stripe_payment_intent_id || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', {
        error: orderError,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint,
      });
      throw orderError;
    }

    console.log('✅ Order created:', order);

    // Create order items
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

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      throw itemsError;
    }

    console.log('✅ Order items created');

    return order;
  } catch (error) {
    console.error('❌ Error in createOrder:', error);
    return null;
  }
};

// Get orders for user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
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
            image_url,
            price
          )
        ),
        restaurants (
          id,
          name,
          phone,
          address
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }

    // Normalize IDs to match app expectations
    const normalizedData = (data || []).map(item => ({
      ...item,
      $id: item.id, // Add $id field for compatibility
    }));

    console.log(`✅ Fetched ${normalizedData.length} orders with full details for user ${userId}`);
    
    return normalizedData;
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return [];
  }
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }

    if (!data) return null;

    // Normalize ID to match app expectations
    const normalizedData = {
      ...data,
      $id: data.id, // Add $id field for compatibility
    };

    return normalizedData;
  } catch (error) {
    console.error('Error in getOrderById:', error);
    return null;
  }
};

// Get order items
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        menu_items (
          id,
          name,
          description,
          image_url
        )
      `)
      .eq('order_id', orderId);

    if (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }

    // Normalize IDs to match app expectations
    const normalizedData = (data || []).map(item => ({
      ...item,
      $id: item.id, // Add $id field for compatibility
    }));

    return normalizedData;
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    return [];
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: string,
  message?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    // Create order update record
    if (message) {
      await supabase
        .from('order_updates')
        .insert({
          order_id: orderId,
          status,
          message,
          is_customer_visible: true,
        });
    }

    // Award points when order is delivered
    if (status === 'delivered') {
      // Get order customer_id
      const { data: order } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('id', orderId)
        .single();
      
      if (order?.customer_id) {
        console.log('🎯 Order delivered! Awarding loyalty points...');
        await awardOrderPoints(orderId, order.customer_id);
      }
    }

    return true;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    return false;
  }
};

// ============================================================================
// FAVORITES
// ============================================================================

export interface FavoriteItem {
  id: string;
  user_id: string;
  menu_item_id: string;
  customizations: any[];
  notes?: string;
  created_at: string;
  last_ordered: string;
}

// Get user favorites
export const getUserFavorites = async (userId: string): Promise<FavoriteItem[]> => {
  try {
    const { data, error } = await supabase
      .from('favorite_items')
      .select(`
        *,
        menu_items (
          id,
          name,
          description,
          price,
          image_url,
          categories
        )
      `)
      .eq('user_id', userId)
      .order('last_ordered', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }

    // Normalize IDs to match app expectations
    const normalizedData = (data || []).map(item => ({
      ...item,
      $id: item.id, // Add $id field for compatibility
    }));

    return normalizedData;
  } catch (error) {
    console.error('Error in getUserFavorites:', error);
    return [];
  }
};

// Add to favorites
export const addToFavorites = async (
  userId: string,
  menuItemId: string,
  customizations: any[] = [],
  notes?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorite_items')
      .upsert({
        user_id: userId,
        menu_item_id: menuItemId,
        customizations,
        notes,
        last_ordered: new Date().toISOString(),
      });

    if (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in addToFavorites:', error);
    return false;
  }
};

// Remove from favorites
export const removeFromFavorites = async (
  userId: string,
  menuItemId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('favorite_items')
      .delete()
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);

    if (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in removeFromFavorites:', error);
    return false;
  }
};

// Check if item is favorite
export const isFavorite = async (
  userId: string,
  menuItemId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('favorite_items')
      .select('id')
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking favorite status:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isFavorite:', error);
    return false;
  }
};


// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

// Subscribe to order updates
export const subscribeToOrderUpdates = (
  orderId: string,
  callback: (update: any) => void
) => {
  return supabase
    .channel(`order_updates_${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'order_updates',
        filter: `order_id=eq.${orderId}`,
      },
      callback
    )
    .subscribe();
};

// Subscribe to order status changes (real-time)
export const subscribeToOrderStatus = (
  orderId: string,
  callback: (order: any) => void
) => {
  const channel = supabase
    .channel(`order_status_${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        console.log('📡 Order status changed:', payload.new);
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    console.log('🔌 Unsubscribing from order status updates');
    supabase.removeChannel(channel);
  };
};

// Get order with all details (items + restaurant info)
export const getOrderDetails = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          menu_items (
            id,
            name,
            image_url,
            price
          )
        ),
        restaurants (
          id,
          name,
          phone,
          address,
          latitude,
          longitude
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      $id: data.id,
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    return null;
  }
};

// Subscribe to menu item updates
export const subscribeToMenuUpdates = (callback: (update: any) => void) => {
  return supabase
    .channel('menu_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'menu_items',
      },
      callback
    )
    .subscribe();
};

// ============================================================================
// FEATURED PRODUCTS
// ============================================================================

export const getFeaturedProducts = async (filters?: {
  restaurant_id?: string;
  limit?: number;
}) => {
  try {
    let query = supabase
      .from('menu_items')
      .select(`
        *,
        restaurants (
          id,
          name
        )
      `)
      .eq('is_featured', true)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (filters?.restaurant_id) {
      query = query.eq('restaurant_id', filters.restaurant_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(item => ({
      ...item,
      $id: item.id,
      restaurant: item.restaurants,
    }));
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// ============================================================================
// SPECIAL OFFERS & COMBOS
// ============================================================================

export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  original_price: number;
  offer_price: number;
  discount_percentage?: number;
  restaurant_id?: string;
  is_active: boolean;
  is_featured: boolean;
  valid_from: string;
  valid_until: string;
  terms?: string;
  max_redemptions?: number;
  current_redemptions: number;
  created_at: string;
  updated_at: string;
}

export const getSpecialOffers = async (filters?: {
  restaurant_id?: string;
  is_featured?: boolean;
  limit?: number;
}) => {
  try {
    let query = supabase
      .from('special_offers')
      .select(`
        *,
        special_offer_items (
          id,
          quantity,
          menu_items (
            id,
            name,
            price,
            image_url
          )
        )
      `)
      .eq('is_active', true)
      .gt('valid_until', new Date().toISOString())
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    // Only filter by restaurant_id if it's explicitly provided
    // This allows showing offers from all restaurants when no restaurant is selected
    if (filters?.restaurant_id) {
      query = query.eq('restaurant_id', filters.restaurant_id);
    }

    if (filters?.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching special offers:', error);
      throw error;
    }

    console.log('✅ Loaded special offers:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error fetching special offers:', error);
    return [];
  }
};

export const getSpecialOfferById = async (offerId: string) => {
  try {
    const { data, error } = await supabase
      .from('special_offers')
      .select(`
        *,
        special_offer_items (
          id,
          quantity,
          menu_items (
            id,
            name,
            description,
            price,
            image_url
          )
        )
      `)
      .eq('id', offerId)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching special offer:', error);
    return null;
  }
};

// ============================================================================
// FEATURED RESTAURANT (Primary/Main Restaurant)
// ============================================================================

export const getFeaturedRestaurant = async () => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // If no featured restaurant, get the first active one
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(1)
        .single();

      if (fallbackError) throw fallbackError;
      return fallbackData;
    }

    return data;
  } catch (error) {
    console.error('Error fetching featured restaurant:', error);
    return null;
  }
};
