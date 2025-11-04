import { renderHook, act } from '@testing-library/react-hooks';
import useAuthStore from '@/store/auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset auth state before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  describe('setUser', () => {
    it('should set user data', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const testUser = {
        $id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      act(() => {
        result.current.setUser(testUser);
      });

      expect(result.current.user).toEqual(testUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle null user', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user data on logout', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const testUser = {
        $id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      act(() => {
        result.current.setUser(testUser);
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is set', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const testUser = {
        $id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      act(() => {
        result.current.setUser(testUser);
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return false when user is null', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});



