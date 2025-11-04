import * as Crypto from 'expo-crypto';

/**
 * Encryption utilities for sensitive data
 */

// Generate a secure random string
export async function generateSecureRandom(length: number = 32): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length);
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

// Generate a secure hash
export async function hash(data: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    data
  );
}

// Generate a secure token
export async function generateToken(): Promise<string> {
  return await generateSecureRandom(32);
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  // Feedback
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters');
  }
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    feedback.push('Add numbers');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    feedback.push('Add special characters');
  }
  
  // Check for common patterns
  const commonPatterns = [
    /^123+/,
    /^abc+/i,
    /^password/i,
    /^qwerty/i,
    /(.)\1{2,}/,  // Repeated characters
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      feedback.push('Avoid common patterns');
      score -= 1;
      break;
    }
  }
  
  return {
    isValid: score >= 4,
    score: Math.max(0, Math.min(10, score)),
    feedback,
  };
}

// Mask sensitive data for logging
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) {
    return '****';
  }
  
  const visible = data.slice(-visibleChars);
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + visible;
}

// Mask email
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '****';
  
  const maskedLocal = local.length > 2 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '**';
  
  return `${maskedLocal}@${domain}`;
}

// Mask phone number
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  
  const visible = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  return masked + visible;
}

// Sanitize object for logging (remove sensitive fields)
export function sanitizeForLogging(obj: any): any {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'credit_card',
    'card_number',
    'cvv',
    'ssn',
  ];
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForLogging(item));
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));
    
    if (isSensitive) {
      sanitized[key] = '***REDACTED***';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

export default {
  generateSecureRandom,
  hash,
  generateToken,
  validatePasswordStrength,
  maskSensitiveData,
  maskEmail,
  maskPhone,
  sanitizeForLogging,
};



