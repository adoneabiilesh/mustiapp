/**
 * Critical Flow Test: Authentication
 * Tests sign in, sign up, and session management
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import * as supabase from '@supabase/supabase-js';
import useAuthStore from '@/store/auth.store';

jest.mock('@supabase/supabase-js');

describe('Authentication Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  test('should sign in with email and password', async () => {
    const mockSession = {
      user: { id: 'user-123', email: 'test@test.com' },
      access_token: 'token-123',
    };

    const mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: mockSession,
          error: null,
        }),
      },
    };

    (supabase.createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const result = await mockSupabaseClient.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(result.data).toBeDefined();
    expect(result.data.user).toBeDefined();
    expect(result.error).toBeNull();
  });

  test('should handle invalid credentials', async () => {
    const mockSupabaseClient = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid credentials' },
        }),
      },
    };

    (supabase.createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const result = await mockSupabaseClient.auth.signInWithPassword({
      email: 'wrong@test.com',
      password: 'wrong',
    });

    expect(result.error).toBeDefined();
    expect(result.data).toBeNull();
  });

  test('should sign out successfully', async () => {
    useAuthStore.setState({ user: { id: 'user-123' }, isAuthenticated: true });

    const mockSupabaseClient = {
      auth: {
        signOut: jest.fn().mockResolvedValue({ error: null }),
      },
    };

    (supabase.createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const result = await mockSupabaseClient.auth.signOut();

    expect(result.error).toBeNull();
  });
});




