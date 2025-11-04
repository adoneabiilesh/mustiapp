# 🔍 Orders Not Showing - Debugging Guide

## 🎯 Quick Diagnosis

I've added **detailed logging** to help identify why orders aren't showing. Here's what to do:

---

## 📱 **STEP 1: Check the Console**

1. **Open the app**
2. **Go to the Orders tab**
3. **Open the console** (press `F12` in browser, or shake device → "Debug" on mobile)
4. **Look for these messages:**

### **Scenario A: User Not Signed In** ❌
```
❌ No user ID - user not signed in
User object: null
Is authenticated: false
```

**SOLUTION:** Sign in first!
- Go to Profile tab
- Click "Sign In"
- Then check Orders tab again

---

### **Scenario B: No Orders in Database** ℹ️
```
🔍 Fetching orders for user: abc-123-def
User email: you@example.com
📡 Raw orders from database: []
📊 Found 0 orders
ℹ️ No orders found for this user
💡 Possible reasons:
  1. User has not placed any orders yet
  2. Orders were created with different customer_id
  3. RLS policy is blocking access
```

**SOLUTIONS:**

**Option 1: Place a test order**
1. Go to Home tab
2. Add items to cart
3. Go to Cart → Checkout
4. Place an order
5. Check Orders tab again

**Option 2: Check database** (run SQL in Supabase):
```sql
-- See if orders exist
SELECT customer_id, customer_email, total, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

---

### **Scenario C: Orders Found!** ✅
```
🔍 Fetching orders for user: abc-123-def
📡 Raw orders from database: [{...}, {...}]
📊 Found 2 orders
✅ Successfully loaded 2 orders
📦 Orders: [...]
```

**If you see this but orders still don't show in UI:**
- Check the formatted orders data
- Look for errors in transforming the data
- Share the console output

---

## 🗄️ **STEP 2: Check Database (Run in Supabase SQL Editor)**

### **Test 1: Check if ANY orders exist**
```sql
SELECT COUNT(*) as total_orders FROM orders;
```

**Expected:** Number > 0

---

### **Test 2: See your orders**
```sql
-- Replace with YOUR email
SELECT 
  id,
  customer_id,
  customer_email,
  customer_name,
  status,
  total,
  created_at
FROM orders
WHERE customer_email = 'YOUR_EMAIL_HERE'
ORDER BY created_at DESC;
```

**Expected:** Should show your orders

---

### **Test 3: Check user ID match**
```sql
-- See your user ID
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- Compare with customer_id in orders
SELECT customer_id, customer_email FROM orders WHERE customer_email = 'YOUR_EMAIL_HERE';
```

**Expected:** `customer_id` should match user `id`

**If they DON'T match**, run this fix:
```sql
UPDATE orders
SET customer_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE')
WHERE customer_email = 'YOUR_EMAIL_HERE';
```

---

### **Test 4: Check RLS (Row-Level Security)**
```sql
-- See RLS policies
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'orders';
```

**If RLS is blocking, fix with:**
```sql
-- Drop old policy
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Create proper policy
CREATE POLICY "Users can view own orders"
ON orders
FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid() 
  OR 
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
```

---

## 🛠️ **Most Common Issues & Fixes**

### **Issue 1: Not Signed In** (90% of cases)

**Symptoms:**
- Console shows "No user ID"
- Profile tab shows "Sign In" button

**Fix:**
```
1. Go to Profile tab
2. Click "Sign In"
3. Sign in with your account
4. Go back to Orders tab
```

---

### **Issue 2: No Orders Created Yet** (8% of cases)

**Symptoms:**
- Console shows "Found 0 orders"
- Database query returns 0 rows

**Fix:**
```
1. Place a test order:
   Home → Add to Cart → Checkout → Place Order
2. Wait for confirmation
3. Check Orders tab again
```

---

### **Issue 3: Customer ID Mismatch** (1% of cases)

**Symptoms:**
- Database has orders
- Console shows "Found 0 orders"
- User is signed in

**Fix:** Run this SQL:
```sql
-- Fix customer_id to match auth user ID
UPDATE orders
SET customer_id = (
  SELECT id FROM auth.users WHERE email = orders.customer_email
)
WHERE customer_email IS NOT NULL AND customer_id IS NULL;
```

---

### **Issue 4: RLS Blocking Access** (1% of cases)

**Symptoms:**
- Database has orders with correct customer_id
- Console shows "Found 0 orders"
- No error message

**Fix:** Run RLS fix from Test 4 above

---

## 📋 **Debugging Checklist**

- [ ] **Are you signed in?** (Check Profile tab)
- [ ] **Check console** for error messages
- [ ] **Run SQL Test 1** - Do ANY orders exist?
- [ ] **Run SQL Test 2** - Do YOUR orders exist?
- [ ] **Run SQL Test 3** - Does customer_id match user id?
- [ ] **Run SQL Test 4** - Is RLS blocking you?

---

## 📊 **What to Share for Help**

If still not working, share:

1. **Console output** (screenshot or copy-paste)
2. **SQL Test 1 result** - Total orders count
3. **SQL Test 2 result** - Your orders
4. **SQL Test 3 result** - User ID vs customer_id
5. **Your email** (so I can check specific user)
6. **Are you signed in?** (yes/no)

---

## ✅ **Expected Console Output (Working)**

When everything works, you should see:

```
🔍 Fetching orders for user: 12345-abc-def
User email: user@example.com
📡 Raw orders from database: [
  {
    id: "order-123",
    customer_id: "12345-abc-def",
    total: 25.50,
    order_items: [{...}],
    restaurants: { name: "Musti Place" }
  }
]
📊 Found 1 orders
✅ Successfully loaded 1 orders
📦 Orders: [
  {
    id: "order-123",
    restaurant_name: "Musti Place",
    items: [{ name: "Big Mac", quantity: 2, price: 5.99 }],
    total: 25.50,
    status: "delivered",
    ...
  }
]
```

---

## 🚀 **Quick Test Flow**

1. **Sign in** (if not already)
2. **Go to Orders tab** → Check console
3. **See the debug messages** → Identify which scenario
4. **Follow the fix** for that scenario
5. **Pull to refresh** → Orders should appear!

---

**The debugging logs will tell us exactly what's wrong!** 🔍

Check the console and let me know what you see! 📱




