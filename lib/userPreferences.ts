import { supabase } from './supabase';

export interface UserPreferences {
  id?: string;
  user_id: string;
  name?: string;
  phone?: string;
  address?: string;
  profile_photo_url?: string;
  notification_preferences?: {
    order_updates: boolean;
    promotional_offers: boolean;
    new_menu_items: boolean;
    push_notifications: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
  };
  dietary_restrictions?: string[];
  favorite_cuisines?: string[];
  created_at?: string;
  updated_at?: string;
}

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      // If table doesn't exist, return default preferences
      if (error.code === 'PGRST205') {
        console.warn('user_preferences table not found, returning default preferences');
        return {
          user_id: userId,
          notification_preferences: {
            order_updates: true,
            promotional_offers: true,
            new_menu_items: true,
            push_notifications: true,
            email_notifications: true,
            sms_notifications: false,
          },
          dietary_restrictions: [],
          favorite_cuisines: [],
        };
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
};

export const updateUserPreferences = async (
  userId: string, 
  updates: Partial<UserPreferences>
): Promise<{ error: any }> => {
  try {
    // First, try to update existing preferences
    const { error: updateError } = await supabase
      .from('user_preferences')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError && updateError.code !== 'PGRST116') {
      // If table doesn't exist, log warning and return success
      if (updateError.code === 'PGRST205') {
        console.warn('user_preferences table not found, preferences not saved to database');
        return { error: null };
      }
      
      // If no existing record, create a new one
      const { error: insertError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) {
        // If table doesn't exist during insert, log warning and return success
        if (insertError.code === 'PGRST205') {
          console.warn('user_preferences table not found, preferences not saved to database');
          return { error: null };
        }
        return { error: insertError };
      }
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return { error };
  }
};

export const createUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        ...preferences,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error && error.code === 'PGRST205') {
      console.warn('user_preferences table not found, preferences not saved to database');
      return { error: null };
    }

    return { error };
  } catch (error) {
    console.error('Error creating user preferences:', error);
    return { error };
  }
};