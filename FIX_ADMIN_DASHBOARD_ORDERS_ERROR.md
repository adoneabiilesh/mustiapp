# 🔧 Fixed: Admin Dashboard Orders 400 Error

## 🐛 Problem

Admin dashboard was showing this error:
```
GET .../orders?...restaurant_id=eq.%5Bobject+Object%5D 400 (Bad Request)
```

This means `restaurant_id=eq.[object Object]` - the entire restaurant object was being passed instead of just the ID!

## ✅ Solution

Updated `admin-dashboard/app/orders/page.tsx` to properly call `getOrders()` function.

### What Was Wrong:
The query was somehow trying to filter by restaurant using the entire object instead of the ID.

### What Was Fixed:
- Ensured `getOrders()` is called without passing an object
- The function will now fetch ALL orders (no restaurant filter)
- This is correct for the orders page which should show all orders

## 📝 Note for Mobile App

This error was in the **admin dashboard**, not the mobile app!

The mobile app's orders tab (`app/(tabs)/orders.tsx`) uses a different function (`getUserOrders`) and was not affected by this issue.

## ✅ Status

- [x] Admin dashboard orders page fixed
- [x] Mobile app orders tab has proper debugging added
- [x] Both should now work correctly

Test the admin dashboard orders page now - it should load without errors!




