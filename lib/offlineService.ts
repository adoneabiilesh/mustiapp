/**
 * Offline Service
 * Handles offline mode, data caching, and action queuing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from './supabase';

const OFFLINE_QUEUE_KEY = '@offline_action_queue';
const CACHE_KEY_PREFIX = '@cache_';

export interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
}

/**
 * Check if device is online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('Error checking network status:', error);
    return false;
  }
};

/**
 * Subscribe to network status changes
 */
export const subscribeToNetworkStatus = (callback: (isOnline: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    callback(state.isConnected ?? false);
  });
};

/**
 * Cache data locally
 */
export const cacheData = async (key: string, data: any, ttl?: number): Promise<void> => {
  try {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttl || 24 * 60 * 60 * 1000, // Default 24 hours
    };

    await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

/**
 * Get cached data
 */
export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${key}`);
    if (!cached) return null;

    const cacheItem = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      await AsyncStorage.removeItem(`${CACHE_KEY_PREFIX}${key}`);
      return null;
    }

    return cacheItem.data as T;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Queue an action for when online
 */
export const queueAction = async (action: Omit<QueuedAction, 'id' | 'timestamp' | 'retries'>): Promise<void> => {
  try {
    const queue = await getActionQueue();
    const queuedAction: QueuedAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    queue.push(queuedAction);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error queueing action:', error);
  }
};

/**
 * Get action queue
 */
export const getActionQueue = async (): Promise<QueuedAction[]> => {
  try {
    const queue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('Error getting action queue:', error);
    return [];
  }
};

/**
 * Process queued actions when back online
 */
export const processActionQueue = async (): Promise<void> => {
  try {
    const online = await isOnline();
    if (!online) {
      console.log('Still offline, skipping queue processing');
      return;
    }

    const queue = await getActionQueue();
    if (queue.length === 0) return;

    console.log(`Processing ${queue.length} queued actions...`);

    const processed: string[] = [];
    const failed: QueuedAction[] = [];

    for (const action of queue) {
      try {
        // Process action based on type
        let success = false;

        switch (action.type) {
          case 'add_to_cart':
            // Cart actions don't need to be synced (local state)
            success = true;
            break;

          case 'create_order':
            // Try to create order
            const { error: orderError } = await supabase
              .from('orders')
              .insert(action.payload);
            
            success = !orderError;
            break;

          case 'update_profile':
            const { error: profileError } = await supabase
              .from('users')
              .update(action.payload.data)
              .eq('id', action.payload.userId);
            
            success = !profileError;
            break;

          default:
            console.warn(`Unknown action type: ${action.type}`);
            success = false;
        }

        if (success) {
          processed.push(action.id);
        } else {
          // Retry logic
          if (action.retries < 3) {
            action.retries++;
            failed.push(action);
          } else {
            // Max retries reached, remove from queue
            processed.push(action.id);
            console.error(`Action ${action.id} failed after max retries`);
          }
        }
      } catch (error) {
        console.error(`Error processing action ${action.id}:`, error);
        if (action.retries < 3) {
          action.retries++;
          failed.push(action);
        } else {
          processed.push(action.id);
        }
      }
    }

    // Remove processed actions
    const remaining = queue.filter(a => !processed.includes(a.id));
    const updated = [...failed, ...remaining];

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));

    if (processed.length > 0) {
      console.log(`Processed ${processed.length} actions successfully`);
    }
  } catch (error) {
    console.error('Error processing action queue:', error);
  }
};

/**
 * Clear action queue
 */
export const clearActionQueue = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing action queue:', error);
  }
};

/**
 * Cache cart offline
 */
export const cacheCart = async (cartItems: any[]): Promise<void> => {
  await cacheData('cart', cartItems, 7 * 24 * 60 * 60 * 1000); // 7 days
};

/**
 * Get cached cart
 */
export const getCachedCart = async (): Promise<any[] | null> => {
  return await getCachedData<any[]>('cart');
};

/**
 * Cache menu items offline
 */
export const cacheMenuItems = async (items: any[]): Promise<void> => {
  await cacheData('menu_items', items, 60 * 60 * 1000); // 1 hour
};

/**
 * Get cached menu items
 */
export const getCachedMenuItems = async (): Promise<any[] | null> => {
  return await getCachedData<any[]>('menu_items');
};

/**
 * Initialize offline support
 */
export const initializeOfflineSupport = () => {
  // Subscribe to network changes
  const unsubscribe = subscribeToNetworkStatus(async (isConnected) => {
    if (isConnected) {
      console.log('Connection restored, processing queued actions...');
      await processActionQueue();
    } else {
      console.log('Connection lost, entering offline mode');
    }
  });

  // Process queue on startup if online
  isOnline().then(online => {
    if (online) {
      processActionQueue();
    }
  });

  return unsubscribe;
};

