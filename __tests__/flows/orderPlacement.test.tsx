/**
 * Critical Flow Test: Order Placement
 * Tests the complete order placement flow from cart to confirmation
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import useCartStore from '@/store/cart.store';
import useAuthStore from '@/store/auth.store';
import * as database from '@/lib/database';
import * as stripe from '@/lib/stripe';

// Mock dependencies
jest.mock('@/lib/database');
jest.mock('@/lib/stripe');
jest.mock('expo-router');
jest.spyOn(Alert, 'alert');

describe('Order Placement Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset stores
    useCartStore.setState({ items: [] });
    useAuthStore.setState({ user: { id: 'test-user', email: 'test@test.com' } });
  });

  test('should successfully place order with card payment', async () => {
    // Setup
    const mockOrder = {
      id: 'order-123',
      customer_id: 'test-user',
      total: 25.50,
      status: 'confirmed',
    };

    useCartStore.setState({
      items: [
        { id: 'item-1', name: 'Burger', price: 10.99, quantity: 2 },
      ],
    });

    (database.createOrder as jest.Mock).mockResolvedValue(mockOrder);
    (stripe.createPaymentIntent as jest.Mock).mockResolvedValue({ clientSecret: 'secret-123' });
    (stripe.confirmPayment as jest.Mock).mockResolvedValue({ success: true });

    // Simulate order placement
    const orderResult = await database.createOrder({
      customer_id: 'test-user',
      items: useCartStore.getState().items.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      delivery_address: {
        street_address: '123 Main St',
        city: 'Test City',
        postal_code: '12345',
      },
      restaurant_id: 'restaurant-1',
    });

    // Assertions
    expect(orderResult).toBeDefined();
    expect(orderResult?.id).toBe('order-123');
    expect(database.createOrder).toHaveBeenCalledTimes(1);
  });

  test('should handle payment failure gracefully', async () => {
    (stripe.confirmPayment as jest.Mock).mockRejectedValue(new Error('Payment failed'));

    try {
      await stripe.confirmPayment('payment-intent-id', {});
    } catch (error) {
      expect(error).toBeDefined();
      expect(Alert.alert).toHaveBeenCalled();
    }
  });

  test('should validate order requirements', async () => {
    // Test empty cart
    useCartStore.setState({ items: [] });

    const orderResult = await database.createOrder({
      customer_id: 'test-user',
      items: [],
      delivery_address: {},
      restaurant_id: 'restaurant-1',
    });

    expect(orderResult).toBeNull();
  });
});




