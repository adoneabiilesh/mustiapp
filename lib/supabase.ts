import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if required environment variables are present
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Missing Supabase environment variables!');
  console.error('Please create admin-dashboard/.env.local with:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
}

// Client for browser-side operations (respects RLS)
// Use dummy values if env vars are missing to prevent crash
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

// Admin client for server-side operations (bypasses RLS)
// Uses service role key which bypasses Row Level Security
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : supabase; // Fallback to regular client if service key not available

// Types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  calories: number | null;
  protein: number | null;
  rating: number | null;
  type: string;
  categories: string[];
  available_addons?: string[];
  is_vegetarian?: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  is_spicy?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Cache for column existence check
let columnExistsCache: boolean | null = null;

// Function to check if available_addons column exists
async function checkAvailableAddonsColumn(): Promise<boolean> {
  if (columnExistsCache !== null) {
    return columnExistsCache;
  }

  try {
    const { error } = await supabase
      .from('menu_items')
      .select('available_addons')
      .limit(1);

    const exists = !error || !error.message.includes('available_addons');
    columnExistsCache = exists;
    return exists;
  } catch (error) {
    columnExistsCache = false;
    return false;
  }
}

// Function to clear the column existence cache (useful after migration)
export function clearColumnExistsCache() {
  columnExistsCache = null;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  restaurant_id: string | null;
  status: 'draft' | 'confirmed' | 'paid' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  payment_intent_id: string | null;
  delivery_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    name: string;
    email: string;
    avatar: string;
  };
  order_items?: OrderItem[];
  deliveries?: Delivery[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  customizations: any[];
  menu_items?: {
    id: string;
    name: string;
    image_url: string;
  };
}

export interface Delivery {
  id: string;
  order_id: string;
  courier_id: string | null;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
  pickup_eta: string | null;
  dropoff_eta: string | null;
  actual_pickup_at: string | null;
  actual_delivery_at: string | null;
  route: any | null;
  created_at: string;
  updated_at: string;
  courier?: {
    name: string;
    email: string;
    avatar: string;
  };
}

export interface CourierLocation {
  id: string;
  courier_id: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  created_at?: string;
}

// API Functions

// ============= MENU ITEMS =============
export async function getMenuItems() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as MenuItem[];
}

export async function getMenuItem(id: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Product not found');
  return data as MenuItem;
}

export async function createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) {
  // Use regular supabase client (with auth session) instead of admin client
  // This works with RLS policies that allow authenticated users to insert
  
  // Check authentication status
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.warn('⚠️ No active session, trying with admin client');
    // Fallback to admin client if no session
    return createMenuItemWithAdmin(item);
  }
  
  // Check if available_addons column exists
  const columnExists = await checkAvailableAddonsColumn();
  
  // If column doesn't exist, remove it from insert to prevent 406 error
  const safeItem = { ...item };
  if (!columnExists && 'available_addons' in safeItem) {
    console.warn('available_addons column does not exist, removing from insert');
    delete safeItem.available_addons;
  }

  const { data, error } = await supabase
    .from('menu_items')
    .insert(safeItem)
    .select()
    .maybeSingle();

  if (error) {
    // If regular client fails, try with admin client
    if (error.message.includes('406') || error.message.includes('Not Acceptable')) {
      console.warn('🔄 Regular client failed, trying with admin client');
      return createMenuItemWithAdmin(item);
    }
    throw error;
  }
  if (!data) throw new Error('Failed to create product');
  return data as MenuItem;
}

// Fallback function using admin client
async function createMenuItemWithAdmin(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) {
  // console.log('🔄 Using admin client for create');
  
  // Check if available_addons column exists
  const columnExists = await checkAvailableAddonsColumn();
  
  // If column doesn't exist, remove it from insert to prevent 406 error
  const safeItem = { ...item };
  if (!columnExists && 'available_addons' in safeItem) {
    console.warn('available_addons column does not exist, removing from insert');
    delete safeItem.available_addons;
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert(safeItem)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to create product');
  return data as MenuItem;
}

export async function updateMenuItem(id: string, updates: Partial<MenuItem>) {
  // Use regular supabase client (with auth session) instead of admin client
  // This works with RLS policies that allow authenticated users to update
  
  // Debug logging (remove in production)
  // console.log('🔄 Updating product:', id);
  // console.log('📝 Updates:', updates);
  
  // Check authentication status
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    console.warn('⚠️ No active session, trying with admin client');
    // Fallback to admin client if no session
    return updateMenuItemWithAdmin(id, updates);
  }
  
  // Check if available_addons column exists
  const columnExists = await checkAvailableAddonsColumn();
  // console.log('📊 Column exists:', columnExists);
  
  // If column doesn't exist, remove it from updates to prevent 406 error
  const safeUpdates = { ...updates };
  if (!columnExists && 'available_addons' in safeUpdates) {
    console.warn('available_addons column does not exist, removing from update');
    delete safeUpdates.available_addons;
  }

  // console.log('🔧 Safe updates:', safeUpdates);

  const { data, error } = await supabase
    .from('menu_items')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('❌ Update error:', error);
    // If regular client fails, try with admin client
    if (error.message.includes('406') || error.message.includes('Not Acceptable')) {
      console.warn('🔄 Regular client failed, trying with admin client');
      return updateMenuItemWithAdmin(id, updates);
    }
    throw error;
  }
  if (!data) {
    console.error('❌ Product not found for ID:', id);
    throw new Error('Product not found');
  }
  
  // console.log('✅ Update successful:', data);
  return data as MenuItem;
}

// Fallback function using admin client
async function updateMenuItemWithAdmin(id: string, updates: Partial<MenuItem>) {
  // console.log('🔄 Using admin client for update');
  
  // Check if available_addons column exists
  const columnExists = await checkAvailableAddonsColumn();
  
  // If column doesn't exist, remove it from updates to prevent 406 error
  const safeUpdates = { ...updates };
  if (!columnExists && 'available_addons' in safeUpdates) {
    console.warn('available_addons column does not exist, removing from update');
    delete safeUpdates.available_addons;
  }

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(safeUpdates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Product not found');
  return data as MenuItem;
}

export async function deleteMenuItem(id: string) {
  // Use regular supabase client (with auth session) instead of admin client
  // This works with RLS policies that allow authenticated users to delete
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============= CATEGORIES =============
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>) {
  // Use regular supabase client (with auth session) instead of admin client
  // This works with RLS policies that allow authenticated users to insert
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to create category');
  return data as Category;
}

export async function updateCategory(id: string, updates: Partial<Category>) {
  // Use regular supabase client (with auth session) instead of admin client
  // This works with RLS policies that allow authenticated users to update
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Category not found');
  return data as Category;
}

export async function deleteCategory(id: string) {
  // Use regular supabase client (with auth session) instead of admin client
  // This works with RLS policies that allow authenticated users to delete
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============= ORDERS =============
export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      users:customer_id (name, email, avatar),
      order_items (
        id,
        quantity,
        unit_price,
        customizations,
        menu_items (id, name, image_url)
      ),
      deliveries (
        id,
        status,
        courier_id,
        pickup_eta,
        dropoff_eta,
        courier:courier_id (name, email, avatar)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Order[];
}

export async function getOrder(id: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      users:customer_id (name, email, avatar),
      order_items (
        id,
        quantity,
        unit_price,
        customizations,
        menu_items (id, name, image_url)
      ),
      deliveries (
        id,
        status,
        courier_id,
        pickup_eta,
        dropoff_eta,
        actual_pickup_at,
        actual_delivery_at,
        courier:courier_id (name, email, avatar)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Order;
}

export async function updateOrderStatus(orderId: string, status: Order['status']) {
  // Use regular supabase client (with auth session) instead of admin client
  // This works with RLS policies that allow authenticated users to update orders
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Order not found');
  return data as Order;
}

export async function assignCourier(orderId: string, courierId: string) {
  // Create delivery record
  const { data, error } = await supabaseAdmin
    .from('deliveries')
    .insert({
      order_id: orderId,
      courier_id: courierId,
      status: 'assigned',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Delivery;
}

export async function updateDeliveryStatus(deliveryId: string, status: Delivery['status']) {
  const { data, error } = await supabaseAdmin
    .from('deliveries')
    .update({ status })
    .eq('id', deliveryId)
    .select()
    .single();

  if (error) throw error;
  return data as Delivery;
}

// ============= COURIER TRACKING =============
export async function getCourierLocation(courierId: string) {
  const { data, error } = await supabase
    .from('courier_locations')
    .select('*')
    .eq('courier_id', courierId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
  return data as CourierLocation | null;
}

export async function updateCourierLocation(
  courierId: string,
  location: { lat: number; lng: number }
) {
  const { data, error } = await supabaseAdmin
    .from('courier_locations')
    .upsert({
      courier_id: courierId,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
      },
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as CourierLocation;
}

// ============= USERS =============
export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as User[];
}

export async function getUserOrderHistory(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total,
      created_at,
      order_items (
        id,
        quantity,
        unit_price,
        menu_items (name, image_url)
      )
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============= REAL-TIME SUBSCRIPTIONS =============
export function subscribeToOrders(callback: (payload: any) => void) {
  const channel = supabase
    .channel('orders_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToDeliveries(callback: (payload: any) => void) {
  const channel = supabase
    .channel('deliveries_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deliveries',
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToCourierLocation(courierId: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`courier_location_${courierId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'courier_locations',
        filter: `courier_id=eq.${courierId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============= ANALYTICS =============
export async function getAnalytics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get total revenue
  const { data: revenueData, error: revenueError } = await supabase
    .from('orders')
    .select('total')
    .in('status', ['paid', 'preparing', 'out_for_delivery', 'delivered']);

  if (revenueError) throw revenueError;

  const totalRevenue = revenueData.reduce((sum, order) => sum + order.total, 0);

  // Get today's orders
  const { data: todayOrders, error: todayError } = await supabase
    .from('orders')
    .select('id')
    .gte('created_at', today.toISOString());

  if (todayError) throw todayError;

  // Get order counts by status
  const { data: statusData, error: statusError } = await supabase
    .from('orders')
    .select('status');

  if (statusError) throw statusError;

  const statusCounts = statusData.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get popular items
  const { data: popularItems, error: popularError } = await supabase
    .from('order_items')
    .select('menu_item_id, quantity, menu_items(name, image_url)')
    .limit(10);

  if (popularError) throw popularError;

  // Aggregate popular items
  const itemCounts = popularItems.reduce((acc: any, item: any) => {
    const id = item.menu_item_id;
    if (!acc[id]) {
      acc[id] = {
        name: item.menu_items?.name,
        image_url: item.menu_items?.image_url,
        count: 0,
      };
    }
    acc[id].count += item.quantity;
    return acc;
  }, {});

  const topItems = Object.values(itemCounts)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  return {
    totalRevenue,
    todayOrders: todayOrders.length,
    statusCounts,
    topItems,
  };
}

// Addon Management Functions
export async function getAddons() {
  const { data, error } = await supabaseAdmin
    .from('addons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching addons:', error);
    throw new Error('Failed to fetch addons');
  }

  return data || [];
}

export async function createAddon(addonData: {
  name: string;
  description?: string;
  price: number;
  type: 'size' | 'addon' | 'spice';
  is_required?: boolean;
  is_active?: boolean;
}) {
  const { data, error } = await supabaseAdmin
    .from('addons')
    .insert([addonData])
    .select()
    .single();

  if (error) {
    console.error('Error creating addon:', error);
    throw new Error('Failed to create addon');
  }

  return data;
}

export async function updateAddon(id: string, addonData: {
  name?: string;
  description?: string;
  price?: number;
  type?: 'size' | 'addon' | 'spice';
  is_required?: boolean;
  is_active?: boolean;
}) {
  const { data, error } = await supabaseAdmin
    .from('addons')
    .update(addonData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating addon:', error);
    throw new Error('Failed to update addon');
  }

  return data;
}

export async function deleteAddon(id: string) {
  const { error } = await supabaseAdmin
    .from('addons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting addon:', error);
    throw new Error('Failed to delete addon');
  }

  return true;
}


