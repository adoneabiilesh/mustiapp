import AsyncStorage from '@react-native-async-storage/async-storage';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

interface RateLimitEntry {
  attempts: number;
  resetTime: number;
}

class RateLimiter {
  private static instance: RateLimiter;
  
  private constructor() {}
  
  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }
  
  private async getEntry(key: string): Promise<RateLimitEntry | null> {
    try {
      const data = await AsyncStorage.getItem(`rateLimit:${key}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Rate limit get error:', error);
      return null;
    }
  }
  
  private async setEntry(key: string, entry: RateLimitEntry): Promise<void> {
    try {
      await AsyncStorage.setItem(`rateLimit:${key}`, JSON.stringify(entry));
    } catch (error) {
      console.error('Rate limit set error:', error);
    }
  }
  
  private async clearEntry(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`rateLimit:${key}`);
    } catch (error) {
      console.error('Rate limit clear error:', error);
    }
  }
  
  public async checkLimit(
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = identifier;
    const now = Date.now();
    
    let entry = await this.getEntry(key);
    
    // If no entry or window expired, create new entry
    if (!entry || entry.resetTime < now) {
      entry = {
        attempts: 1,
        resetTime: now + config.windowMs,
      };
      await this.setEntry(key, entry);
      
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetTime: entry.resetTime,
      };
    }
    
    // Check if limit exceeded
    if (entry.attempts >= config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }
    
    // Increment attempts
    entry.attempts += 1;
    await this.setEntry(key, entry);
    
    return {
      allowed: true,
      remaining: config.maxAttempts - entry.attempts,
      resetTime: entry.resetTime,
    };
  }
  
  public async reset(identifier: string): Promise<void> {
    await this.clearEntry(identifier);
  }
  
  public async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const rateLimitKeys = keys.filter(key => key.startsWith('rateLimit:'));
      await AsyncStorage.multiRemove(rateLimitKeys);
    } catch (error) {
      console.error('Rate limit clear all error:', error);
    }
  }
}

// Hook for using rate limiter in components
export function useRateLimit(
  identifier: string,
  config: RateLimitConfig
) {
  const limiter = RateLimiter.getInstance();
  
  return {
    checkLimit: () => limiter.checkLimit(identifier, config),
    reset: () => limiter.reset(identifier),
  };
}

export default RateLimiter;



