import { z } from 'zod';

// User validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Order validation schemas
export const createOrderSchema = z.object({
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    customizations: z.record(z.any()).optional(),
    notes: z.string().max(500).optional(),
  })).min(1, 'Order must contain at least one item'),
  delivery_address: z.object({
    street: z.string().min(5).max(200),
    city: z.string().min(2).max(100),
    postal_code: z.string().min(3).max(20),
    country: z.string().length(2),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  }),
  payment_method: z.enum(['card', 'cash']),
  delivery_instructions: z.string().max(500).optional(),
  scheduled_for: z.string().datetime().optional(),
});

// Review validation schemas
export const createReviewSchema = z.object({
  order_id: z.string().uuid(),
  menu_item_id: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
});

// Address validation schemas
export const addressSchema = z.object({
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  postal_code: z.string().min(3).max(20),
  country: z.string().length(2),
  label: z.string().max(50).optional(),
  is_default: z.boolean().optional(),
});

// Profile validation schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.object({
    dietary_restrictions: z.array(z.string()).optional(),
    allergens: z.array(z.string()).optional(),
    favorite_cuisines: z.array(z.string()).optional(),
  }).optional(),
});

// Payment validation schemas
export const paymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
  order_id: z.string().uuid(),
  payment_method_id: z.string().optional(),
  save_payment_method: z.boolean().optional(),
});

// Refund validation schemas
export const refundSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive().optional(),
  reason: z.string().min(10).max(500),
});

// Search validation schemas
export const searchSchema = z.object({
  query: z.string().max(100).optional(),
  category: z.string().uuid().optional(),
  min_price: z.number().nonnegative().optional(),
  max_price: z.number().positive().optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
  rating_min: z.number().int().min(1).max(5).optional(),
  sort_by: z.enum(['price_asc', 'price_desc', 'rating', 'popular', 'newest']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// Loyalty validation schemas
export const redeemRewardSchema = z.object({
  reward_id: z.string().uuid(),
  order_id: z.string().uuid().optional(),
});

// Support ticket validation schemas
export const createTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(20).max(2000),
  category: z.enum(['order', 'payment', 'technical', 'other']),
  order_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
});

// Validation helper function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: true; 
  data: T 
} | { 
  success: false; 
  errors: z.ZodError 
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Sanitization functions
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 10000); // Prevent extremely long inputs
}

// Rate limiting configuration
export const RATE_LIMITS = {
  // Authentication endpoints
  LOGIN: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  SIGNUP: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  PASSWORD_RESET: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
  
  // API endpoints
  ORDER_CREATE: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 orders per hour
  REVIEW_CREATE: { maxAttempts: 5, windowMs: 24 * 60 * 60 * 1000 }, // 5 reviews per day
  PAYMENT: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 payment attempts per hour
  
  // Search endpoints
  SEARCH: { maxAttempts: 100, windowMs: 60 * 1000 }, // 100 searches per minute
  
  // General API
  GENERAL: { maxAttempts: 100, windowMs: 15 * 60 * 1000 }, // 100 requests per 15 minutes
};

export default {
  signUpSchema,
  signInSchema,
  createOrderSchema,
  createReviewSchema,
  addressSchema,
  updateProfileSchema,
  paymentIntentSchema,
  refundSchema,
  searchSchema,
  redeemRewardSchema,
  createTicketSchema,
  validateData,
  sanitizeHtml,
  sanitizeInput,
  RATE_LIMITS,
};



