# 🔧 Fix: Orders Not Showing in Orders Tab

## 🐛 Problem
You can't see any orders in the orders tab, even previous orders.

## 🔍 Possible Causes

### 1. **User Not Authenticated**
- Orders tab needs `user.id` to fetch orders
- If user is not signed in, no orders will show

### 2. **No Orders in Database**
- User hasn't placed any orders yet
- Orders were created with different user ID

### 3. **Field Mismatch**
- Database uses different field name than `customer_id`
- User ID format doesn't match

### 4. **RLS (Row-Level Security) Blocking Access**
- Supabase RLS policies might be preventing data access
- User role doesn't have permission

---

## 🛠️ Step-by-Step Debugging

### **STEP 1: Check if you're signed in**

Open the app and check the Profile tab:
- ✅ Are you signed in?
- ✅ Do you see your email/name?

If NOT signed in:
- Click "Sign In" button
- The orders tab only works when authenticated!

---

### **STEP 2: Check if orders exist in database**

1. Go to Supabase Dashboard → SQL Editor
2. Run this query:

```sql
-- See all orders
SELECT 
  id,
  customer_id,
  customer_name,
  customer_email,
  status,
  total,
  created_at
FROM orders
ORDER BY created_at DESC
LIMIT 10;
```

**Expected Results:**
- If you see orders → Database has data ✅
- If you see 0 rows → No orders created yet ❌

---

### **STEP 3: Check user ID match**

In Supabase SQL Editor, run:

```sql
-- Check your user ID
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Check if any orders match your user ID
SELECT 
  o.id,
  o.customer_id,
  o.customer_email,
  u.email as user_email
FROM orders o
LEFT JOIN auth.users u ON u.id = o.customer_id
WHERE o.customer_email = 'YOUR_EMAIL_HERE'; -- Replace with your email
```

**What to look for:**
- Does `customer_id` match your user `id`?
- If customer_id is NULL → Orders not linked to user ❌
- If customer_id is different → Wrong user ID used ❌

---

### **STEP 4: Check RLS (Row-Level Security)**

In Supabase SQL Editor:

```sql
-- Temporarily disable RLS to test
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Try fetching orders again in the app
-- If orders appear now, RLS is blocking access!

-- Re-enable RLS after testing
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
```

**If RLS is the issue**, create proper policy:

```sql
-- Drop old policy if exists
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Create new policy
CREATE POLICY "Users can view own orders"
ON orders
FOR SELECT
TO authenticated
USING (customer_id = auth.uid());
```

---

### **STEP 5: Check console for errors**

In the app:
1. Open React Native DevTools (shake device → "Debug")
2. Go to Console
3. Look for errors like:
   - `Error fetching user orders`
   - `customer_id is null`
   - `RLS policy violation`

**Share the error message for specific help!**

---

## ✅ Quick Fixes

### **Fix 1: User Not Signed In**
```typescript
// In app/(tabs)/orders.tsx, add this at the top:

if (!isAuthenticated || !user?.id) {
  return (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateText}>Please sign in to view orders</Text>
      <Button onPress={() => router.push('/(auth)/sign-in')}>
        Sign In
      </Button>
    </View>
  );
}
```

### **Fix 2: No Orders Exist**
- Place a test order first!
- Go to Home → Add item → Cart → Checkout → Place Order
- Then check Orders tab

### **Fix 3: Wrong Customer ID**
If orders were created with wrong customer_id, update them:

```sql
-- Update orders to use correct user ID
UPDATE orders
SET customer_id = 'YOUR_CORRECT_USER_ID_HERE'
WHERE customer_email = 'your.email@example.com';
```

### **Fix 4: RLS Blocking**
Run the RLS fix from Step 4 above.

---

## 🔬 Advanced Debugging

### **Add Debug Logging**

In `app/(tabs)/orders.tsx`, add detailed logging:

```typescript
const loadOrders = async () => {
  if (!user?.id) {
    console.log('❌ No user ID found!');
    console.log('User object:', user);
    setOrders([]);
    return;
  }

  console.log('🔍 Fetching orders for user:', user.id);
  console.log('User email:', user.email);
  
  try {
    setLoading(true);
    
    const { getUserOrders } = await import('@/lib/database');
    const fetchedOrders = await getUserOrders(user.id);
    
    console.log(`📦 Fetched ${fetchedOrders.length} orders`);
    console.log('Orders data:', fetchedOrders);
    
    // ... rest of code
  } catch (error) {
    console.error('❌ Error loading orders:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
  }
};
```

### **Test Database Query Directly**

In Supabase SQL Editor:

```sql
-- Replace with your actual user ID
DO $$
DECLARE
  user_uuid UUID := 'YOUR_USER_ID_HERE';
BEGIN
  RAISE NOTICE 'Testing orders query for user: %', user_uuid;
  
  PERFORM id FROM orders WHERE customer_id = user_uuid;
  
  IF FOUND THEN
    RAISE NOTICE 'Orders found!';
  ELSE
    RAISE NOTICE 'No orders found for this user';
  END IF;
END $$;
```

---

## 📊 Expected Behavior

**When Working Correctly:**
1. User signs in → `user.id` is set
2. Orders tab loads → Calls `getUserOrders(user.id)`
3. Database query:
   ```sql
   SELECT * FROM orders 
   WHERE customer_id = 'user-id-here'
   ORDER BY created_at DESC
   ```
4. Orders appear with restaurant names, items, prices ✅

**When Not Working:**
1. User not signed in → No user.id → Empty orders
2. Orders created with wrong customer_id → Query returns nothing
3. RLS blocking → Permission denied
4. Database connection issue → Error in console

---

## 🎯 Most Likely Causes

Based on common issues:

1. **🥇 NOT SIGNED IN** (90% of cases)
   - Solution: Sign in first!

2. **🥈 NO ORDERS YET** (8% of cases)
   - Solution: Place a test order

3. **🥉 RLS POLICY** (2% of cases)
   - Solution: Fix RLS policy

---

## 📝 Next Steps

1. **Check if you're signed in** (Profile tab)
2. **Run the SQL query** in Supabase to see if orders exist
3. **Check browser/app console** for error messages
4. **Share the error/results** for specific help

**Need help?** Share:
- ✅ Are you signed in? (yes/no)
- ✅ Console error messages (screenshot)
- ✅ Results from SQL queries above
- ✅ Have you placed any orders before? (yes/no)

I'll help you fix it! 🚀




