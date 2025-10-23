# Order Flow Test Guide

## Test Steps for Complete Order Flow

### 1. Mobile App Order Creation
1. **Open the mobile app** (running on port 8081)
2. **Add items to cart**:
   - Browse food items on home screen
   - Tap the "+" button on food cards to add items
   - Verify items appear in cart with correct quantities
3. **Go to cart screen**:
   - Tap cart icon in bottom navigation
   - Verify all items are displayed correctly
   - Check total calculation (items + delivery fee)
4. **Select payment method**:
   - Choose between "Credit/Debit Card" or "Pay on Delivery (Cash)"
   - Verify UI updates correctly for selected method
5. **Place order**:
   - Tap "Place Order" button
   - Verify success message shows correct payment method
   - Check that cart is cleared after successful order

### 2. Admin Dashboard Verification
1. **Open admin dashboard** (running on port 3001)
2. **Navigate to Orders page**:
   - Click "Orders" in sidebar
   - Verify new order appears in the orders table
3. **Check order details**:
   - Verify order ID, customer info, items, total
   - Check payment method is displayed correctly
   - Verify order status (should be "pending" for cash, "pending_payment" for card)
4. **Test order management**:
   - Click "View" to see order details
   - Update order status (confirmed → preparing → out_for_delivery → delivered)
   - Verify status updates are reflected in real-time

### 3. Mobile App Order Tracking
1. **Go to Orders tab** in mobile app
2. **Verify order appears** in orders list
3. **Check order details**:
   - Order ID, status, items, total
   - Payment method information
4. **Test order actions**:
   - For delivered orders: "Reorder" button should add items back to cart
   - For out_for_delivery orders: "Track" button should navigate to tracking

## Expected Results

### ✅ Success Criteria:
- [ ] Orders can be created with both payment methods
- [ ] Orders appear in admin dashboard immediately
- [ ] Payment method is correctly displayed in admin dashboard
- [ ] Order status updates work in admin dashboard
- [ ] Mobile app shows updated order status
- [ ] Reorder functionality works for delivered orders
- [ ] UI alignment is consistent across all screens
- [ ] Liquid glass effects are working properly

### 🐛 Known Issues to Check:
- [ ] No console errors during order creation
- [ ] No UI misalignment or broken layouts
- [ ] Payment method selection works smoothly
- [ ] Cart calculations are accurate
- [ ] Real-time updates work between mobile and admin

## Test Data
- **Test User**: Use existing authenticated user
- **Test Items**: Add 2-3 different food items to cart
- **Test Address**: Default address (123 Main St, Rome, RM 00100)
- **Test Payment**: Try both card and cash payment methods

## Performance Checks
- [ ] App loads quickly
- [ ] Smooth animations and transitions
- [ ] No memory leaks during navigation
- [ ] Efficient data fetching and caching

