# 🔄 Real-time Order Status Updates Fix

## Problem
Order status changes in the admin dashboard are not reflecting immediately in the mobile app's orders screen.

## Root Causes
1. **Supabase Real-time not enabled** for the `orders` table
2. **RLS policies blocking** real-time updates
3. **Missing real-time triggers** on the orders table
4. **No fallback refresh mechanism** if real-time fails

## Solutions Applied

### 1. Database Configuration
Run the SQL script `fix-realtime-orders.sql` in Supabase SQL Editor:

```sql
-- Enable real-time for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Fix RLS policies for real-time
-- Allow service role to update orders (for admin dashboard)
CREATE POLICY "Service role can update orders" ON public.orders
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Add real-time trigger
CREATE TRIGGER order_update_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_update();
```

### 2. Enhanced Real-time Subscription
Updated `lib/supabase.ts` with better logging and error handling:

```typescript
export const subscribeUserOrdersRealtime = (userId: string, callback: () => void) => {
  console.log('🔗 Setting up real-time subscription for user:', userId);
  
  const channel = supabase
    .channel(`orders_${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'orders',
      filter: `customer_id=eq.${userId}`,
    }, (payload) => {
      console.log('📡 Orders updated:', payload);
      callback();
    })
    .subscribe((status) => {
      console.log('📡 Subscription status:', status);
    });

  return () => {
    console.log('🔌 Unsubscribing from orders real-time');
    supabase.removeChannel(channel);
  };
};
```

### 3. Multiple Refresh Mechanisms
Added to `app/(tabs)/orders.tsx`:

#### A. Real-time Subscription (Primary)
```typescript
useEffect(() => {
  if (!user?.$id) return;

  const unsubscribe = subscribeUserOrdersRealtime(user.$id, () => {
    console.log('🔄 Order updated, refreshing...');
    fetchOrders();
  });

  return unsubscribe;
}, [user?.$id, fetchOrders]);
```

#### B. Focus-based Refresh (Secondary)
```typescript
useFocusEffect(
  useCallback(() => {
    console.log('📱 Orders screen focused, refreshing...');
    fetchOrders();
  }, [fetchOrders])
);
```

#### C. Periodic Refresh (Backup)
```typescript
useEffect(() => {
  if (!user?.$id) return;

  const interval = setInterval(() => {
    console.log('🔄 Periodic refresh of orders...');
    fetchOrders();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [user?.$id, fetchOrders]);
```

#### D. Manual Pull-to-Refresh
```typescript
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
  // ... other props
/>
```

## Testing Steps

### 1. Run the SQL Script
```bash
# Copy the contents of fix-realtime-orders.sql
# Paste into Supabase SQL Editor and run
```

### 2. Test Real-time Updates
1. **Open mobile app** → Orders screen
2. **Open admin dashboard** → Orders management
3. **Change order status** in admin dashboard
4. **Check mobile app** - should update within 1-2 seconds

### 3. Test Fallback Mechanisms
1. **Disable real-time** (for testing)
2. **Navigate away** from orders screen and back
3. **Wait 30 seconds** - should auto-refresh
4. **Pull down** on orders screen - should manual refresh

## Expected Behavior

### ✅ Real-time Updates (Primary)
- Order status changes in admin dashboard
- Mobile app updates within 1-2 seconds
- Console shows: `📡 Orders updated: {eventType: 'UPDATE', new: {...}}`

### ✅ Focus Refresh (Secondary)
- User navigates to orders screen
- Orders refresh automatically
- Console shows: `📱 Orders screen focused, refreshing...`

### ✅ Periodic Refresh (Backup)
- Every 30 seconds, orders refresh
- Console shows: `🔄 Periodic refresh of orders...`

### ✅ Manual Refresh (User Control)
- Pull down on orders screen
- Orders refresh immediately
- Console shows: `🔄 Manual refresh triggered`

## Troubleshooting

### If Real-time Still Doesn't Work:

1. **Check Supabase Dashboard**:
   - Go to Database → Replication
   - Ensure `orders` table is enabled for real-time

2. **Check RLS Policies**:
   - Ensure service role can update orders
   - Ensure user can read their own orders

3. **Check Console Logs**:
   - Look for `📡 Subscription status: SUBSCRIBED`
   - Look for `📡 Orders updated:` messages

4. **Test with Manual Refresh**:
   - Pull down on orders screen
   - Should work even if real-time fails

## Files Modified

1. `fix-realtime-orders.sql` - Database configuration
2. `lib/supabase.ts` - Enhanced real-time subscription
3. `app/(tabs)/orders.tsx` - Multiple refresh mechanisms

## Result
Order status changes in the admin dashboard will now reflect immediately in the mobile app through multiple refresh mechanisms, ensuring reliable real-time updates.
