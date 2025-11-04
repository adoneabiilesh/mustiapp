import { supabase } from './supabase';

// ============================================================================
// FAVORITES TYPES
// ============================================================================

export interface FavoriteItem {
  id: string;
  userId: string;
  menuItemId: string;
  menuItem: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description?: string;
  };
  customizations: Customization[];
  notes?: string;
  lastOrdered: string;
  createdAt: string;
}

export interface SavedOrder {
  id: string;
  userId: string;
  name: string;
  items: SavedOrderItem[];
  total: number;
  createdAt: string;
  lastUsed: string;
}

export interface SavedOrderItem {
  menuItemId: string;
  menuItem: {
    id: string;
    name: string;
    price: number;
    image_url: string;
  };
  quantity: number;
  customizations: Customization[];
}

export interface Customization {
  id: string;
  name: string;
  value: string;
  price: number;
}

// ============================================================================
// FAVORITES FUNCTIONS
// ============================================================================

/**
 * Get user's favorite items
 */
export const getFavoriteItems = async (userId: string): Promise<FavoriteItem[]> => {
  try {
    console.log('🔄 Fetching favorite items for user:', userId);
    
    const { data, error } = await supabase
      .from('favorite_items')
      .select(`
        *,
        menu_items (
          id,
          name,
          price,
          image_url,
          description
        )
      `)
      .eq('user_id', userId)
      .order('last_ordered', { ascending: false });

    if (error) {
      console.error('❌ Error fetching favorite items:', error);
      throw error;
    }

    const favorites = (data || []).map(item => ({
      ...item,
      menuItem: item.menu_items,
      lastOrdered: item.last_ordered,
      createdAt: item.created_at,
    }));

    console.log('✅ Favorite items fetched:', favorites.length);
    return favorites;
  } catch (error: any) {
    console.error('❌ Failed to get favorite items:', error);
    return [];
  }
};

/**
 * Add item to favorites
 */
export const addToFavorites = async (
  userId: string,
  menuItemId: string,
  customizations: Customization[] = [],
  notes?: string
): Promise<boolean> => {
  try {
    console.log('➕ Adding item to favorites:', { userId, menuItemId, customizations, notes });
    
    // Check if already in favorites
    const { data: existing } = await supabase
      .from('favorite_items')
      .select('id')
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId)
      .single();

    if (existing) {
      console.log('⚠️ Item already in favorites');
      return true;
    }

    const { error } = await supabase
      .from('favorite_items')
      .insert({
        user_id: userId,
        menu_item_id: menuItemId,
        customizations,
        notes,
        created_at: new Date().toISOString(),
        last_ordered: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error adding to favorites:', error);
      throw error;
    }

    console.log('✅ Item added to favorites');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to add to favorites:', error);
    return false;
  }
};

/**
 * Remove item from favorites
 */
export const removeFromFavorites = async (
  userId: string,
  favoriteId: string
): Promise<boolean> => {
  try {
    console.log('➖ Removing item from favorites:', { userId, favoriteId });
    
    const { error } = await supabase
      .from('favorite_items')
      .delete()
      .eq('id', favoriteId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error removing from favorites:', error);
      throw error;
    }

    console.log('✅ Item removed from favorites');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to remove from favorites:', error);
    return false;
  }
};

/**
 * Update favorite item
 */
export const updateFavoriteItem = async (
  favoriteId: string,
  customizations: Customization[],
  notes?: string
): Promise<boolean> => {
  try {
    console.log('🔄 Updating favorite item:', { favoriteId, customizations, notes });
    
    const { error } = await supabase
      .from('favorite_items')
      .update({
        customizations,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', favoriteId);

    if (error) {
      console.error('❌ Error updating favorite item:', error);
      throw error;
    }

    console.log('✅ Favorite item updated');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update favorite item:', error);
    return false;
  }
};

/**
 * Get user's saved orders
 */
export const getSavedOrders = async (userId: string): Promise<SavedOrder[]> => {
  try {
    console.log('🔄 Fetching saved orders for user:', userId);
    
    const { data, error } = await supabase
      .from('saved_orders')
      .select(`
        *,
        saved_order_items (
          id,
          menu_item_id,
          quantity,
          customizations,
          menu_items (
            id,
            name,
            price,
            image_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('last_used', { ascending: false });

    if (error) {
      console.error('❌ Error fetching saved orders:', error);
      throw error;
    }

    const savedOrders = (data || []).map(order => ({
      ...order,
      items: order.saved_order_items.map((item: any) => ({
        menuItemId: item.menu_item_id,
        menuItem: item.menu_items,
        quantity: item.quantity,
        customizations: item.customizations || [],
      })),
      createdAt: order.created_at,
      lastUsed: order.last_used,
    }));

    console.log('✅ Saved orders fetched:', savedOrders.length);
    return savedOrders;
  } catch (error: any) {
    console.error('❌ Failed to get saved orders:', error);
    return [];
  }
};

/**
 * Save order for later
 */
export const saveOrder = async (
  userId: string,
  name: string,
  items: SavedOrderItem[],
  total: number
): Promise<boolean> => {
  try {
    console.log('💾 Saving order:', { userId, name, items: items.length, total });
    
    // Create saved order
    const { data: savedOrder, error: orderError } = await supabase
      .from('saved_orders')
      .insert({
        user_id: userId,
        name,
        total,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error saving order:', orderError);
      throw orderError;
    }

    // Create saved order items
    const orderItems = items.map(item => ({
      saved_order_id: savedOrder.id,
      menu_item_id: item.menuItemId,
      quantity: item.quantity,
      customizations: item.customizations || [],
    }));

    const { error: itemsError } = await supabase
      .from('saved_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error saving order items:', itemsError);
      throw itemsError;
    }

    console.log('✅ Order saved successfully');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to save order:', error);
    return false;
  }
};

/**
 * Delete saved order
 */
export const deleteSavedOrder = async (
  userId: string,
  savedOrderId: string
): Promise<boolean> => {
  try {
    console.log('🗑️ Deleting saved order:', { userId, savedOrderId });
    
    const { error } = await supabase
      .from('saved_orders')
      .delete()
      .eq('id', savedOrderId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting saved order:', error);
      throw error;
    }

    console.log('✅ Saved order deleted');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to delete saved order:', error);
    return false;
  }
};

/**
 * Reorder from saved order
 */
export const reorderFromSaved = async (
  savedOrderId: string,
  userId: string
): Promise<SavedOrderItem[]> => {
  try {
    console.log('🔄 Reordering from saved order:', { savedOrderId, userId });
    
    const { data, error } = await supabase
      .from('saved_orders')
      .select(`
        *,
        saved_order_items (
          id,
          menu_item_id,
          quantity,
          customizations,
          menu_items (
            id,
            name,
            price,
            image_url
          )
        )
      `)
      .eq('id', savedOrderId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Error fetching saved order:', error);
      throw error;
    }

    if (!data) {
      throw new Error('Saved order not found');
    }

    // Update last used timestamp
    await supabase
      .from('saved_orders')
      .update({ last_used: new Date().toISOString() })
      .eq('id', savedOrderId);

    const items = data.saved_order_items.map((item: any) => ({
      menuItemId: item.menu_item_id,
      menuItem: item.menu_items,
      quantity: item.quantity,
      customizations: item.customizations || [],
    }));

    console.log('✅ Saved order items retrieved:', items.length);
    return items;
  } catch (error: any) {
    console.error('❌ Failed to reorder from saved:', error);
    return [];
  }
};

/**
 * Check if item is in favorites
 */
export const isItemFavorite = async (
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

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('❌ Error checking favorite status:', error);
      return false;
    }

    return !!data;
  } catch (error: any) {
    console.error('❌ Failed to check favorite status:', error);
    return false;
  }
};

/**
 * Update last ordered timestamp for favorite item
 */
export const updateFavoriteLastOrdered = async (
  userId: string,
  menuItemId: string
): Promise<void> => {
  try {
    await supabase
      .from('favorite_items')
      .update({ last_ordered: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('menu_item_id', menuItemId);
  } catch (error: any) {
    console.error('❌ Failed to update favorite last ordered:', error);
  }
};
