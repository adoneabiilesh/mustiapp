# 🚀 MustiApp Setup Guide

## ✅ **What We've Implemented**

### **1. Real-time Order Tracking**
- ✅ Live order status updates
- ✅ Order timeline with status changes
- ✅ Estimated delivery time calculation
- ✅ Real-time subscription system
- ✅ OrderTrackingMap component

### **2. Push Notifications System**
- ✅ Expo notifications integration
- ✅ Order update notifications
- ✅ Promotional notifications
- ✅ Notification settings management
- ✅ NotificationSettings component

### **3. Favorites & Saved Orders**
- ✅ Favorite items management
- ✅ Saved orders for quick reordering
- ✅ Customizations preservation
- ✅ FavoritesList component
- ✅ SavedOrdersList component

## 🗄️ **Database Setup**

### **Step 1: Run Database Schema**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-schema.sql`
4. Click "Run" to execute the schema

### **Step 2: Verify Tables Created**
Check that these tables were created:
- `users`
- `user_notification_settings`
- `user_tokens`
- `restaurants`
- `categories`
- `menu_items`
- `addons`
- `orders`
- `order_items`
- `order_updates`
- `favorite_items`
- `saved_orders`
- `saved_order_items`
- `reviews`
- `loyalty_points`
- `loyalty_transactions`

## 📱 **App Integration**

### **Step 1: Update Your App Components**

#### **Add to your main app file:**
```typescript
// Import the new components
import { 
  OrderTrackingMap, 
  NotificationSettings, 
  FavoritesList, 
  SavedOrdersList 
} from './components';

// Add to your navigation or screens
```

#### **Update your cart screen to include order tracking:**
```typescript
// In your cart.tsx or checkout.tsx
import { OrderTrackingMap } from '../components';

// Add order tracking functionality
const handleTrackOrder = (orderId: string) => {
  // Show order tracking modal
  setShowOrderTracking(true);
  setCurrentOrderId(orderId);
};
```

#### **Add favorites to your menu items:**
```typescript
// In your MenuCard.tsx
import { addToFavorites, isItemFavorite } from '../lib/favorites';

const handleToggleFavorite = async (menuItemId: string) => {
  const isFavorite = await isItemFavorite(userId, menuItemId);
  if (isFavorite) {
    await removeFromFavorites(userId, favoriteId);
  } else {
    await addToFavorites(userId, menuItemId);
  }
};
```

### **Step 2: Environment Variables**

Add these to your `.env` file:
```bash
# Supabase (already configured)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Expo Push Notifications
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id

# Optional: Stripe (for payments)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### **Step 3: Install Required Dependencies**

```bash
# Install notification dependencies
npm install expo-notifications expo-device

# Install additional dependencies if needed
npm install @react-native-async-storage/async-storage
```

## 🔧 **Configuration Steps**

### **Step 1: Enable Real-time in Supabase**
1. Go to Supabase Dashboard
2. Navigate to Database → Replication
3. Enable real-time for these tables:
   - `orders`
   - `order_updates`
   - `favorite_items`
   - `saved_orders`

### **Step 2: Set up Push Notifications**
1. Go to Expo Dashboard
2. Navigate to your project
3. Go to Push Notifications
4. Configure your notification settings
5. Get your project ID and add it to environment variables

### **Step 3: Configure Row Level Security**
The database schema includes RLS policies, but verify they're working:
1. Go to Supabase Dashboard
2. Navigate to Authentication → Policies
3. Verify the policies are active
4. Test with a user account

## 🎯 **Usage Examples**

### **Real-time Order Tracking**
```typescript
import { getOrderTracking, subscribeToOrderUpdates } from '../lib/orderTracking';

// Get order tracking data
const trackingData = await getOrderTracking(orderId);

// Subscribe to real-time updates
const unsubscribe = subscribeToOrderUpdates(
  orderId,
  (update) => {
    console.log('New update:', update);
  },
  (status) => {
    console.log('Status changed:', status);
  }
);

// Don't forget to unsubscribe
unsubscribe();
```

### **Push Notifications**
```typescript
import { 
  registerForPushNotifications, 
  sendOrderUpdateNotification 
} from '../lib/notifications';

// Register for notifications
const token = await registerForPushNotifications(userId);

// Send order update
await sendOrderUpdateNotification(
  userId, 
  orderId, 
  'preparing', 
  'Your order is being prepared'
);
```

### **Favorites System**
```typescript
import { 
  addToFavorites, 
  getFavoriteItems, 
  removeFromFavorites 
} from '../lib/favorites';

// Add to favorites
await addToFavorites(userId, menuItemId, customizations, notes);

// Get user's favorites
const favorites = await getFavoriteItems(userId);

// Remove from favorites
await removeFromFavorites(userId, favoriteId);
```

## 🧪 **Testing**

### **Test Real-time Tracking**
1. Create an order
2. Open the OrderTrackingMap component
3. Update the order status in Supabase
4. Verify the UI updates in real-time

### **Test Push Notifications**
1. Register for notifications
2. Send a test notification
3. Verify it appears on the device

### **Test Favorites**
1. Add items to favorites
2. Check the FavoritesList component
3. Test removing items
4. Test reordering from favorites

## 🚀 **Next Steps**

### **Immediate Actions**
1. ✅ Run the database schema
2. ✅ Update your app components
3. ✅ Test the new features
4. ✅ Configure push notifications

### **Future Enhancements**
- [ ] Implement loyalty program
- [ ] Add customer reviews
- [ ] Create analytics dashboard
- [ ] Add social features
- [ ] Implement voice ordering

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Real-time not working**
- Check if RLS policies are correct
- Verify real-time is enabled for tables
- Check network connectivity

#### **Push notifications not working**
- Verify Expo project ID is correct
- Check device permissions
- Test on physical device (not simulator)

#### **Database errors**
- Check if all tables were created
- Verify RLS policies are active
- Check user authentication

### **Debug Commands**
```bash
# Check if dependencies are installed
npm list expo-notifications expo-device

# Clear Expo cache
npx expo start --clear

# Check Supabase connection
# Go to Supabase Dashboard → API → Check connection
```

## 📞 **Support**

If you encounter any issues:
1. Check the console logs
2. Verify environment variables
3. Test database connections
4. Check Supabase dashboard for errors

## 🎉 **Congratulations!**

You now have a professional food delivery app with:
- ✅ Real-time order tracking
- ✅ Push notifications
- ✅ Favorites system
- ✅ Saved orders
- ✅ Professional UI components
- ✅ Complete database schema

Your app is now ready for the next phase of development!
