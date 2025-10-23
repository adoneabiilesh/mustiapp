'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus, Order } from '@/lib/supabase';
import { exportOrdersToCSV } from '@/lib/export';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import RefundDialog from '@/components/RefundDialog';
import { 
  ShoppingCart, 
  Eye, 
  CheckCircle, 
  Clock, 
  Truck, 
  XCircle, 
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'secondary',
    confirmed: 'default',
    paid: 'default',
    preparing: 'default',
    out_for_delivery: 'default',
    delivered: 'default',
    cancelled: 'destructive',
  };
  return colors[status] || 'secondary';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    confirmed: <CheckCircle className="w-4 h-4" />,
    preparing: <Clock className="w-4 h-4" />,
    out_for_delivery: <Truck className="w-4 h-4" />,
    delivered: <CheckCircle className="w-4 h-4" />,
    cancelled: <XCircle className="w-4 h-4" />,
  };
  return icons[status] || <ShoppingCart className="w-4 h-4" />;
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundOrder, setRefundOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    refetchInterval: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order');
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus as Order['status'] });
  };

  const handleExport = () => {
    if (!orders || orders.length === 0) {
      toast.error('No orders to export');
      return;
    }
    exportOrdersToCSV(filteredOrders);
    toast.success('Orders exported successfully');
  };

  // Filter orders
  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.users?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <Header />
        
        <div className="pt-16 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Orders</h1>
              <p className="text-muted-foreground">
                Manage and track all orders ({filteredOrders.length})
              </p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by order ID, customer name, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <div className="w-12 h-12 bg-muted-foreground/20 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                        <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Order ID</th>
                        <th className="text-left p-4 font-semibold">Customer</th>
                        <th className="text-left p-4 font-semibold">Items</th>
                        <th className="text-left p-4 font-semibold">Total</th>
                        <th className="text-left p-4 font-semibold">Payment</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Date</th>
                        <th className="text-left p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-sm">
                              #{order.id.slice(-6)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-semibold">{order.users?.name || 'Guest'}</p>
                              <p className="text-sm text-muted-foreground">{order.users?.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm">
                              {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items
                            </p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold">€{order.total.toFixed(2)}</p>
                          </td>
                          <td className="p-4">
                            <Badge variant={(order as any).payment_method === 'cash' ? 'secondary' : 'default'} className="capitalize">
                              {(order as any).payment_method === 'cash' ? 'Cash on Delivery' : 'Card Payment'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Select
                              value={order.status}
                              onValueChange={(value) => handleStatusChange(order.id, value)}
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue>
                                  <Badge variant={getStatusColor(order.status) as any} className="flex items-center gap-1">
                                    {getStatusIcon(order.status)}
                                    {order.status.replace('_', ' ')}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm">
                                {format(new Date(order.created_at), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {order.payment_intent_id && ['paid', 'preparing'].includes(order.status) && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setRefundOrder(order)}
                                >
                                  Refund
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">No orders found</CardTitle>
                  <CardDescription>
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Orders will appear here'}
                  </CardDescription>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(-6)}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedOrder.users?.name || 'Guest'}</p>
                  <p className="text-sm">{selectedOrder.users?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusColor(selectedOrder.status) as any}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <Badge variant={selectedOrder.payment_method === 'cash' ? 'secondary' : 'default'} className="capitalize">
                    {selectedOrder.payment_method === 'cash' ? 'Cash on Delivery' : 'Card Payment'}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{item.menu_items?.name || 'Item'}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">€{(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="text-sm">
                  {selectedOrder.delivery_address?.street},<br />
                  {selectedOrder.delivery_address?.city}, {selectedOrder.delivery_address?.state} {selectedOrder.delivery_address?.zip}
                </p>
              </div>

              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>€{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <RefundDialog
        order={refundOrder}
        open={!!refundOrder}
        onOpenChange={(open) => !open && setRefundOrder(null)}
      />
    </div>
  );
}
