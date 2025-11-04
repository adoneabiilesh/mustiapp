'use client';

import { useQuery } from '@tanstack/react-query';
import { getAnalytics, getOrders } from '@/lib/supabase';
import { generateRevenueData, generateOrdersData, getTodayStats } from '@/lib/analytics';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Package,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';

// Dynamically import charts to avoid SSR issues
const RevenueChart = dynamic(() => import('@/components/RevenueChart'), { ssr: false });
const OrdersChart = dynamic(() => import('@/components/OrdersChart'), { ssr: false });
const StatusPieChart = dynamic(() => import('@/components/StatusPieChart'), { ssr: false });

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

function StatCard({ title, value, icon, trend, color }: StatCardProps) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          {trend && (
            <Badge variant={trend.startsWith('+') ? 'default' : 'secondary'}>
              {trend}
            </Badge>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

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

export default function Dashboard() {
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
    refetchInterval: 30000,
  });

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    refetchInterval: 10000,
  });

  // Debug logging
  console.log('📊 Dashboard data:', { 
    analytics, 
    analyticsLoading, 
    analyticsError,
    orders, 
    ordersLoading,
    ordersError 
  });

  const recentOrders = orders?.slice(0, 5);
  const revenueData = orders ? generateRevenueData(orders, 7) : { labels: [], values: [] };
  const ordersData = orders ? generateOrdersData(orders, 7) : { labels: [], values: [] };
  const todayStats = orders ? getTodayStats(orders) : { orderCount: 0, revenue: 0 };

  // Show error state if data fetch failed
  if (analyticsError || ordersError) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <Header />
          <div className="pt-16 p-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-red-900 mb-2">Error Loading Dashboard</h2>
                <p className="text-red-700 mb-4">
                  {analyticsError?.toString() || ordersError?.toString()}
                </p>
                <p className="text-sm text-red-600">
                  Make sure your database tables are created. Run the schema SQL in Supabase.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <Header />
        
        <div className="pt-16 p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <StatCard
              title="Total Revenue"
              value={analyticsLoading ? '...' : `€${analytics?.totalRevenue.toFixed(2)}`}
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
              trend="+12.5%"
              color="bg-green-50"
            />
            <StatCard
              title="Orders Today"
              value={todayStats.orderCount}
              icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
              trend="+8.2%"
              color="bg-blue-50"
            />
            <StatCard
              title="Active Orders"
              value={analyticsLoading ? '...' : analytics?.statusCounts?.preparing || 0}
              icon={<Clock className="w-6 h-6 text-yellow-600" />}
              color="bg-yellow-50"
            />
            <StatCard
              title="Delivered"
              value={analyticsLoading ? '...' : analytics?.statusCounts?.delivered || 0}
              icon={<CheckCircle className="w-6 h-6 text-purple-600" />}
              color="bg-purple-50"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
                <CardDescription>Daily revenue overview</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueData.labels.length > 0 ? (
                  <RevenueChart data={revenueData} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-lg font-medium">No data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Orders Volume (Last 7 Days)</CardTitle>
                <CardDescription>Daily order count</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersData.labels.length > 0 ? (
                  <OrdersChart data={ordersData} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-lg font-medium">No data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Orders</CardTitle>
                    <Link 
                      href="/orders" 
                      className="text-sm text-orange-600 hover:underline font-medium"
                    >
                      View All →
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="space-y-4">
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
                  ) : recentOrders && recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.map((order: any) => (
                        <Link
                          key={order.id}
                          href={`/orders`}
                          className="flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors border"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShoppingCart className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">
                                #{order.id.slice(-6)}
                              </p>
                              <Badge variant={getStatusColor(order.status) as any}>
                                {order.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {order.users?.name || 'Guest'} • €{order.total.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No orders yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Status Distribution */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Distribution by status</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics?.statusCounts ? (
                  <StatusPieChart data={analytics.statusCounts} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-lg font-medium">Loading...</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
