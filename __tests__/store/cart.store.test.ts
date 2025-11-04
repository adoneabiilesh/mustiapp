import { renderHook, act } from '@testing-library/react-hooks';
import useCartStore from '@/store/cart.store';

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset cart before each test
    const { result } = renderHook(() => useCartStore());
    act(() => {
      result.current.clearCart();
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      const testItem = {
        id: '1',
        name: 'Test Pizza',
        price: 12.99,
        image: 'test.jpg',
      };

      act(() => {
        result.current.addToCart(testItem, 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({
        ...testItem,
        quantity: 1,
      });
    });

    it('should increment quantity if item already exists', () => {
      const { result } = renderHook(() => useCartStore());
      
      const testItem = {
        id: '1',
        name: 'Test Pizza',
        price: 12.99,
        image: 'test.jpg',
      };

      act(() => {
        result.current.addToCart(testItem, 1);
        result.current.addToCart(testItem, 1);
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('should add multiple different items', () => {
      const { result } = renderHook(() => useCartStore());
      
      const item1 = { id: '1', name: 'Pizza', price: 12.99, image: 'pizza.jpg' };
      const item2 = { id: '2', name: 'Burger', price: 8.99, image: 'burger.jpg' };

      act(() => {
        result.current.addToCart(item1, 1);
        result.current.addToCart(item2, 1);
      });

      expect(result.current.items).toHaveLength(2);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      const testItem = {
        id: '1',
        name: 'Test Pizza',
        price: 12.99,
        image: 'test.jpg',
      };

      act(() => {
        result.current.addToCart(testItem, 1);
        result.current.removeFromCart('1');
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should not affect other items when removing one', () => {
      const { result } = renderHook(() => useCartStore());
      
      const item1 = { id: '1', name: 'Pizza', price: 12.99, image: 'pizza.jpg' };
      const item2 = { id: '2', name: 'Burger', price: 8.99, image: 'burger.jpg' };

      act(() => {
        result.current.addToCart(item1, 1);
        result.current.addToCart(item2, 1);
        result.current.removeFromCart('1');
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('2');
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCartStore());
      
      const testItem = {
        id: '1',
        name: 'Test Pizza',
        price: 12.99,
        image: 'test.jpg',
      };

      act(() => {
        result.current.addToCart(testItem, 1);
        result.current.updateQuantity('1', 3);
      });

      expect(result.current.items[0].quantity).toBe(3);
    });

    it('should remove item if quantity is 0', () => {
      const { result } = renderHook(() => useCartStore());
      
      const testItem = {
        id: '1',
        name: 'Test Pizza',
        price: 12.99,
        image: 'test.jpg',
      };

      act(() => {
        result.current.addToCart(testItem, 1);
        result.current.updateQuantity('1', 0);
      });

      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate correct total for single item', () => {
      const { result } = renderHook(() => useCartStore());
      
      const testItem = {
        id: '1',
        name: 'Test Pizza',
        price: 12.99,
        image: 'test.jpg',
      };

      act(() => {
        result.current.addToCart(testItem, 2);
      });

      const total = result.current.calculateTotal();
      expect(total).toBe(25.98);
    });

    it('should calculate correct total for multiple items', () => {
      const { result } = renderHook(() => useCartStore());
      
      const item1 = { id: '1', name: 'Pizza', price: 12.99, image: 'pizza.jpg' };
      const item2 = { id: '2', name: 'Burger', price: 8.99, image: 'burger.jpg' };

      act(() => {
        result.current.addToCart(item1, 2);
        result.current.addToCart(item2, 1);
      });

      const total = result.current.calculateTotal();
      expect(total).toBe(34.97); // (12.99 * 2) + 8.99
    });

    it('should return 0 for empty cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      const total = result.current.calculateTotal();
      expect(total).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCartStore());
      
      const item1 = { id: '1', name: 'Pizza', price: 12.99, image: 'pizza.jpg' };
      const item2 = { id: '2', name: 'Burger', price: 8.99, image: 'burger.jpg' };

      act(() => {
        result.current.addToCart(item1, 1);
        result.current.addToCart(item2, 1);
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });
  });
});



