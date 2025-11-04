/**
 * Security Middleware
 * Adds security headers and rate limiting
 */

import { RateLimiter } from '@/lib/security/rateLimit';
import { sanitizeInput } from '@/lib/security/validation';

const rateLimiter = new RateLimiter();

/**
 * Apply security headers
 */
export function applySecurityHeaders(headers: Headers): void {
  // XSS Protection
  headers.set('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');
  
  // HSTS (if using HTTPS)
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

/**
 * Rate limit middleware
 */
export async function rateLimitMiddleware(
  identifier: string,
  action: string
): Promise<{ allowed: boolean; remaining: number }> {
  const limits = {
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 },
    signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 },
    order: { maxAttempts: 10, windowMs: 60 * 60 * 1000 },
    payment: { maxAttempts: 5, windowMs: 60 * 60 * 1000 },
    default: { maxAttempts: 100, windowMs: 15 * 60 * 1000 },
  };

  const config = limits[action as keyof typeof limits] || limits.default;
  const result = await rateLimiter.checkLimit(identifier, config);

  if (!result.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000 / 60)} minutes`);
  }

  return { allowed: true, remaining: result.remaining };
}

/**
 * Sanitize user input
 */
export function sanitizeUserInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizeInput(input);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = Array.isArray(input) ? [] : {};
    for (const key in input) {
      sanitized[key] = sanitizeUserInput(input[key]);
    }
    return sanitized;
  }
  return input;
}

/**
 * Validate and sanitize request
 */
export async function secureRequest(
  request: Request,
  action: string
): Promise<{ data: any; headers: Headers }> {
  // Get client identifier (IP or user ID)
  const identifier = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Apply rate limiting
  await rateLimitMiddleware(identifier, action);
  
  // Parse and sanitize body
  let data = {};
  if (request.method === 'POST' || request.method === 'PUT') {
    const body = await request.json();
    data = sanitizeUserInput(body);
  }
  
  // Apply security headers
  const headers = new Headers();
  applySecurityHeaders(headers);
  
  return { data, headers };
}




