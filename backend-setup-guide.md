# Backend Infrastructure Setup

## 1. DATABASE SETUP
### Option A: Supabase (Easiest)
- Upgrade to Supabase Pro ($25/month)
- Set up real database tables
- Configure RLS (Row Level Security)
- Set up real-time subscriptions

### Option B: Firebase
- Firebase Firestore for database
- Firebase Auth for authentication
- Firebase Storage for files
- Firebase Functions for server logic

### Option C: Custom Backend
- Node.js + Express + PostgreSQL
- Or Python + FastAPI + PostgreSQL
- Or any other stack you prefer

## 2. REQUIRED DATABASE TABLES
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE restaurants (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR,
  category VARCHAR,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  restaurant_id UUID REFERENCES restaurants(id),
  status VARCHAR DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  payment_intent_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  customizations JSONB
);
```

## 3. API ENDPOINTS NEEDED
```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout

// Restaurants
GET /api/restaurants
GET /api/restaurants/:id

// Menu
GET /api/restaurants/:id/menu
GET /api/menu-items/:id

// Orders
POST /api/orders
GET /api/orders/:id
PUT /api/orders/:id/status

// Payments
POST /api/payments/create-intent
POST /api/payments/confirm
POST /api/webhooks/stripe
```

## 4. SECURITY CONSIDERATIONS
- Implement rate limiting
- Add input validation
- Use HTTPS everywhere
- Implement CORS properly
- Add API authentication
- Validate payment webhooks
