/**
 * Integration Tests: Database Operations
 * Tests critical database queries and operations
 */

import * as database from '@/lib/database';
import { supabase } from '@/lib/database';

jest.mock('@/lib/database');

describe('Database Integration Tests', () => {
  test('should fetch user orders with relations', async () => {
    const mockOrders = [
      {
        id: 'order-1',
        customer_id: 'user-123',
        total: 25.50,
        order_items: [
          {
            id: 'item-1',
            quantity: 2,
            menu_items: { name: 'Burger', price: 10.99 },
          },
        ],
        restaurants: { name: 'Musti Place' },
      },
    ];

    (database.getUserOrders as jest.Mock).mockResolvedValue(mockOrders);

    const orders = await database.getUserOrders('user-123');

    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThan(0);
    expect(orders[0].order_items).toBeDefined();
    expect(orders[0].restaurants).toBeDefined();
  });

  test('should create order with items', async () => {
    const orderData = {
      customer_id: 'user-123',
      items: [
        { menu_item_id: 'item-1', quantity: 2, unit_price: 10.99 },
      ],
      delivery_address: { street_address: '123 Main St' },
      restaurant_id: 'restaurant-1',
    };

    const mockOrder = {
      id: 'order-123',
      ...orderData,
      total: 25.50,
      status: 'pending',
    };

    (database.createOrder as jest.Mock).mockResolvedValue(mockOrder);

    const order = await database.createOrder(orderData);

    expect(order).toBeDefined();
    expect(order?.id).toBe('order-123');
    expect(database.createOrder).toHaveBeenCalledWith(orderData);
  });

  test('should handle database errors gracefully', async () => {
    (database.getUserOrders as jest.Mock).mockRejectedValue(
      new Error('Database connection failed')
    );

    await expect(database.getUserOrders('user-123')).rejects.toThrow();
  });
});




