import { Order } from './supabase';

/**
 * Export orders to CSV format
 */
export function exportOrdersToCSV(orders: Order[]): void {
  if (!orders || orders.length === 0) {
    console.warn('No orders to export');
    return;
  }

  // Prepare CSV headers
  const headers = [
    'Order ID',
    'Customer Name',
    'Customer Email',
    'Status',
    'Total',
    'Payment Method',
    'Created At',
    'Items Count'
  ];

  // Convert orders to CSV rows
  const csvRows = orders.map(order => [
    order.id,
    order.users?.name || 'Guest',
    order.users?.email || '',
    order.status,
    order.total.toFixed(2),
    order.payment_method === 'cash' ? 'Cash on Delivery' : 'Card Payment',
    new Date(order.created_at).toLocaleDateString(),
    order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Export orders to JSON format
 */
export function exportOrdersToJSON(orders: Order[]): void {
  if (!orders || orders.length === 0) {
    console.warn('No orders to export');
    return;
  }

  const jsonContent = JSON.stringify(orders, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}