/**
 * Utility Tests: Input Validation
 * Tests validation functions
 */

import { sanitizeInput, signInSchema, createOrderSchema } from '@/lib/security/validation';

describe('Input Validation', () => {
  describe('sanitizeInput', () => {
    test('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      const sanitized = sanitizeInput(input);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Hello');
    });

    test('should trim whitespace', () => {
      const input = '  test  ';
      const sanitized = sanitizeInput(input);
      expect(sanitized).toBe('test');
    });

    test('should limit length', () => {
      const input = 'a'.repeat(10000);
      const sanitized = sanitizeInput(input);
      expect(sanitized.length).toBeLessThanOrEqual(5000); // Max reasonable length
    });
  });

  describe('signInSchema', () => {
    test('should validate correct sign in data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'password123',
      };
      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('createOrderSchema', () => {
    test('should validate correct order data', () => {
      const data = {
        items: [
          { menu_item_id: '123', quantity: 2 },
        ],
        delivery_address: {
          street: '123 Main St',
          city: 'Test City',
          postal_code: '12345',
          country: 'US',
        },
        payment_method: 'card',
      };
      const result = createOrderSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test('should reject empty items array', () => {
      const data = {
        items: [],
        delivery_address: {
          street: '123 Main St',
          city: 'Test City',
          postal_code: '12345',
          country: 'US',
        },
        payment_method: 'card',
      };
      const result = createOrderSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});




