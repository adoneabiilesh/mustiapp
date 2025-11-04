/**
 * Performance Optimization Utilities
 * Makes the app FAST AS FCK! 🚀
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animated, Easing } from 'react-native';

// ============================================================================
// MEMORY CACHE (Instant Access)
// ============================================================================

class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private maxSize: number = 100; // Max cache entries

  set(key: string, data: any, ttl: number = 300000) { // Default 5 minutes
    // Evict oldest if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();

// ============================================================================
// PERSISTENT CACHE (AsyncStorage)
// ============================================================================

export const persistentCache = {
  async set(key: string, data: any, ttl: number = 3600000) { // Default 1 hour
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async get(key: string): Promise<any | null> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);

      // Check if expired
      if (Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async invalidate(key: string) {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  },

  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
};

// ============================================================================
// SMART CACHE HOOK (Memory + Persistent)
// ============================================================================

interface CacheOptions {
  ttl?: number;
  memoryOnly?: boolean;
  persistentOnly?: boolean;
  staleWhileRevalidate?: boolean;
}

export function useSmartCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    ttl = 300000, // 5 minutes
    memoryOnly = false,
    persistentOnly = false,
    staleWhileRevalidate = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const isRevalidating = useRef(false);

  const loadData = useCallback(async (background = false) => {
    try {
      if (!background) setIsLoading(true);

      // 1. Try memory cache first (instant!)
      if (!persistentOnly && !background) {
        const memoryData = memoryCache.get(key);
        if (memoryData) {
          if (isMounted.current) {
            setData(memoryData);
            setIsLoading(false);
          }
          
          // Revalidate in background if enabled (prevent infinite loop)
          if (staleWhileRevalidate && !isRevalidating.current) {
            isRevalidating.current = true;
            loadData(true).finally(() => {
              isRevalidating.current = false;
            });
          }
          return;
        }
      }

      // 2. Try persistent cache
      if (!memoryOnly && !background) {
        const persistentData = await persistentCache.get(key);
        if (persistentData) {
          if (isMounted.current) {
            setData(persistentData);
            setIsLoading(false);
          }
          
          // Store in memory cache for faster access
          memoryCache.set(key, persistentData, ttl);
          
          // Revalidate in background if enabled (prevent infinite loop)
          if (staleWhileRevalidate && !isRevalidating.current) {
            isRevalidating.current = true;
            loadData(true).finally(() => {
              isRevalidating.current = false;
            });
          }
          return;
        }
      }

      // 3. Fetch fresh data
      const freshData = await fetcher();
      
      if (isMounted.current) {
        setData(freshData);
        setIsLoading(false);
        setError(null);
      }

      // 4. Store in both caches
      if (!persistentOnly) {
        memoryCache.set(key, freshData, ttl);
      }
      if (!memoryOnly) {
        await persistentCache.set(key, freshData, ttl);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err as Error);
        setIsLoading(false);
      }
    }
  }, [key, fetcher, ttl, memoryOnly, persistentOnly, staleWhileRevalidate]);

  useEffect(() => {
    isMounted.current = true;
    loadData();

    return () => {
      isMounted.current = false;
    };
  }, [loadData]);

  const refetch = useCallback(() => {
    memoryCache.invalidate(key);
    persistentCache.invalidate(key);
    loadData();
  }, [key, loadData]);

  return { data, isLoading, error, refetch };
}

// ============================================================================
// DEBOUNCE HOOK (Reduce API Calls)
// ============================================================================

export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// THROTTLE HOOK (Limit Function Calls)
// ============================================================================

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const lastRan = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// ============================================================================
// OPTIMISTIC UPDATE HOOK
// ============================================================================

export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (data: T) => Promise<T>
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(async (optimisticData: T) => {
    const previousData = data;
    
    // Immediately update UI
    setData(optimisticData);
    setIsUpdating(true);
    
    try {
      // Perform actual update
      const result = await updateFn(optimisticData);
      setData(result);
      setError(null);
    } catch (err) {
      // Rollback on error
      setData(previousData);
      setError(err as Error);
    } finally {
      setIsUpdating(false);
    }
  }, [data, updateFn]);

  return { data, isUpdating, error, update };
}

// ============================================================================
// IMAGE PRELOADER (Faster Image Display)
// ============================================================================

import { Image } from 'react-native';

export const preloadImages = async (imageUrls: string[]): Promise<void> => {
  try {
    await Promise.all(
      imageUrls.map(url =>
        Image.prefetch(url).catch(() => {
          console.warn('Failed to preload image:', url);
        })
      )
    );
  } catch (error) {
    console.error('Image preload error:', error);
  }
};

// ============================================================================
// BATCH REQUESTS (Reduce Network Calls)
// ============================================================================

class RequestBatcher {
  private batches: Map<string, {
    requests: Array<() => Promise<any>>;
    timeout: NodeJS.Timeout;
  }> = new Map();

  batch<T>(
    key: string,
    request: () => Promise<T>,
    delay: number = 50
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batch = this.batches.get(key) || {
        requests: [],
        timeout: setTimeout(() => this.flush(key), delay),
      };

      batch.requests.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.batches.set(key, batch);
    });
  }

  private async flush(key: string) {
    const batch = this.batches.get(key);
    if (!batch) return;

    this.batches.delete(key);
    await Promise.all(batch.requests.map(req => req()));
  }
}

export const requestBatcher = new RequestBatcher();

// ============================================================================
// PERFORMANCE MONITOR
// ============================================================================

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  start(label: string) {
    return {
      end: () => {
        const duration = performance.now();
        const metrics = this.metrics.get(label) || [];
        metrics.push(duration);
        this.metrics.set(label, metrics);
      }
    };
  }

  getMetrics(label: string) {
    const metrics = this.metrics.get(label) || [];
    if (metrics.length === 0) return null;

    const avg = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return { avg, min, max, count: metrics.length };
  }

  reset(label?: string) {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

export const perfMonitor = new PerformanceMonitor();

// ============================================================================
// ANIMATION PERFORMANCE
// ============================================================================

export const useAnimatedValue = (initialValue: number = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animate = useCallback((
    toValue: number,
    duration: number = 300,
    easing: any = Easing.bezier(0.25, 0.1, 0.25, 1) // Smooth easing
  ) => {
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing,
      useNativeDriver: true, // PERFORMANCE BOOST!
    }).start();
  }, [animatedValue]);

  return { animatedValue, animate };
};

// ============================================================================
// LAZY LOADING HOOK
// ============================================================================

export function useLazyLoad<T>(
  data: T[],
  pageSize: number = 20
) {
  const [visibleData, setVisibleData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const newData = data.slice(0, page * pageSize);
    setVisibleData(newData);
    setHasMore(newData.length < data.length);
  }, [data, page, pageSize]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage(p => p + 1);
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return { visibleData, loadMore, hasMore, reset };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  memoryCache,
  persistentCache,
  useSmartCache,
  useDebounce,
  useThrottle,
  useOptimisticUpdate,
  preloadImages,
  requestBatcher,
  perfMonitor,
  useAnimatedValue,
  useLazyLoad,
};


