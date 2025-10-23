import { supabase } from './supabase';

export interface UserPreferences {
  id: string;
  user_id: string;
  name?: string;
  default_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  payment_methods: {
    id: string;
    type: 'card' | 'cash';
    is_default: boolean;
    card_details?: {
      brand: string;
      last4: string;
      exp_month: number;
      exp_year: number;
    };
  }[];
  delivery_instructions?: string;
  notification_preferences?: {
    order_updates: boolean;
    promotional_offers: boolean;
    new_menu_items: boolean;
    push_notifications: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Get user preferences
 */
export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    console.log('=== GET USER PREFERENCES DEBUG ===');
    console.log('userId:', userId);
    
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true);

    console.log('Supabase query result:', { data, error });
    
    if (error) throw error;
    
    // Transform the data to match UserPreferences interface
    if (data && data.length > 0) {
      const addressData = data[0]; // Get the first (and should be only) address
      const result = {
        id: addressData.id,
        user_id: addressData.user_id,
        default_address: {
          name: addressData.name,
          address: addressData.address,
          type: addressData.type,
        },
        payment_methods: [],
        created_at: addressData.created_at,
        updated_at: addressData.updated_at,
      };
      console.log('Transformed user preferences:', result);
      return result;
    }
    
    console.log('No data found, returning null');
    return null;
  } catch (error: any) {
    console.error('Get user preferences error:', error);
    return null;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  try {
    // For now, we'll only handle address updates through the address system
    // This function can be expanded later for other preferences
    const { data, error } = await supabase
      .from('user_addresses')
      .upsert({
        user_id: userId,
        name: preferences.default_address?.fullName || 'Default Address', // Add required name field
        address: preferences.default_address, // Store as JSON object
        type: preferences.default_address?.type || 'home',
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Update user preferences error:', error);
    return { data: null, error };
  }
};

/**
 * Add payment method
 */
export const addPaymentMethod = async (userId: string, paymentMethod: {
  type: 'card' | 'cash';
  card_details?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  is_default?: boolean;
}) => {
  try {
    // Get current preferences
    const currentPrefs = await getUserPreferences(userId);
    
    const newPaymentMethod = {
      id: `pm_${Date.now()}`,
      ...paymentMethod,
    };

    const updatedPaymentMethods = currentPrefs?.payment_methods || [];
    
    // If this is set as default, remove default from others
    if (paymentMethod.is_default) {
      updatedPaymentMethods.forEach(pm => pm.is_default = false);
    }
    
    updatedPaymentMethods.push(newPaymentMethod);

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        payment_methods: updatedPaymentMethods,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Add payment method error:', error);
    return { data: null, error };
  }
};

/**
 * Set default payment method
 */
export const setDefaultPaymentMethod = async (userId: string, paymentMethodId: string) => {
  try {
    const currentPrefs = await getUserPreferences(userId);
    if (!currentPrefs?.payment_methods) return { data: null, error: new Error('No payment methods found') };

    const updatedPaymentMethods = currentPrefs.payment_methods.map(pm => ({
      ...pm,
      is_default: pm.id === paymentMethodId
    }));

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        payment_methods: updatedPaymentMethods,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Set default payment method error:', error);
    return { data: null, error };
  }
};

/**
 * Update default address
 */
export const updateDefaultAddress = async (userId: string, address: {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  fullName?: string;
  phoneNumber?: string;
  apartment?: string;
  landmark?: string;
  type?: string;
}) => {
  try {
    console.log('=== UPDATE DEFAULT ADDRESS DEBUG ===');
    console.log('userId:', userId);
    console.log('address:', address);
    
    const { data, error } = await supabase
      .from('user_addresses')
      .upsert({
        user_id: userId,
        name: address.name || 'My Address',
        address: address.address, // Simple text field
        type: address.type || 'home',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    console.log('Supabase upsert result:', { data, error });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Update default address error:', error);
    return { data: null, error };
  }
};
