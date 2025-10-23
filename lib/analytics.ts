// Analytics helper functions

import { Order } from './supabase';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

export interface RevenueData {
  labels: string[];
  values: number[];
}

export interface OrdersData {
  labels: string[];
  values: number[];
}

/**
 * Generate revenue data for the last N days
 */
export function generateRevenueData(orders: Order[], days: number = 7): RevenueData {
  const data: { [key: string]: number } = {};
  
  // Initialize last N days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM dd');
    data[dateStr] = 0;
  }

  // Aggregate orders by day
  orders.forEach(order => {
    if (order.status === 'paid' || order.status === 'preparing' || 
        order.status === 'out_for_delivery' || order.status === 'delivered') {
      const orderDate = new Date(order.created_at);
      const dateStr = format(orderDate, 'MMM dd');
      
      if (data[dateStr] !== undefined) {
        data[dateStr] += order.total;
      }
    }
  });

  return {
    labels: Object.keys(data),
    values: Object.values(data),
  };
}

/**
 * Generate orders count data for the last N days
 */
export function generateOrdersData(orders: Order[], days: number = 7): OrdersData {
  const data: { [key: string]: number } = {};
  
  // Initialize last N days with 0
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MMM dd');
    data[dateStr] = 0;
  }

  // Count orders by day
  orders.forEach(order => {
    const orderDate = new Date(order.created_at);
    const dateStr = format(orderDate, 'MMM dd');
    
    if (data[dateStr] !== undefined) {
      data[dateStr]++;
    }
  });

  return {
    labels: Object.keys(data),
    values: Object.values(data),
  };
}

/**
 * Calculate today's stats
 */
export function getTodayStats(orders: Order[]) {
  const today = new Date();
  const startToday = startOfDay(today);
  const endToday = endOfDay(today);

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= startToday && orderDate <= endToday;
  });

  const todayRevenue = todayOrders
    .filter(o => ['paid', 'preparing', 'out_for_delivery', 'delivered'].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);

  return {
    orderCount: todayOrders.length,
    revenue: todayRevenue,
  };
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): string {
  if (previous === 0) return '+0%';
  const growth = ((current - previous) / previous) * 100;
  return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
}


