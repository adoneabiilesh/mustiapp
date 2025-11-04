# Smart Product Recommendation System

## 🎯 **Overview**

A sophisticated recommendation engine that suggests **complementary** and **contradictory** products to enhance user experience and increase sales.

## 🧠 **Smart Recommendation Logic**

### **1. Complementary Recommendations**
**Perfect pairings that go well together:**

#### **Main Dishes + Drinks**
- **Burger** → Coca-Cola, Pepsi, Beer, Milkshake, Fries
- **Pizza** → Beer, Wine, Coca-Cola, Pepsi, Garlic Bread
- **Pasta** → Wine, Garlic Bread, Salad
- **Chicken** → Coca-Cola, Pepsi, Fries, Salad

#### **Drinks + Snacks**
- **Coca-Cola** → Burger, Pizza, Fries, Chicken Wings
- **Beer** → Burger, Pizza, Chicken Wings, Nachos
- **Coffee** → Croissant, Muffin, Bagel, Donut

#### **Desserts + Drinks**
- **Cake** → Coffee, Tea, Milk
- **Ice Cream** → Waffle, Brownie, Cookie

#### **Healthy Combinations**
- **Salad** → Soup, Smoothie, Water, Green Tea
- **Soup** → Salad, Bread, Crackers

### **2. Contradictory Recommendations**
**Opposite choices for variety and exploration:**

#### **Healthy vs Indulgent**
- **Salad** → Burger, Pizza, Fries, Ice Cream
- **Soup** → Burger, Pizza, Fries
- **Smoothie** → Burger, Pizza, Fries, Cake

#### **Hot vs Cold**
- **Soup** → Ice Cream, Smoothie, Cold Drink
- **Coffee** → Ice Cream, Smoothie, Cold Drink
- **Tea** → Ice Cream, Smoothie

#### **Light vs Heavy**
- **Salad** → Pasta, Pizza, Burger
- **Soup** → Pasta, Pizza, Burger
- **Smoothie** → Pasta, Pizza, Burger

### **3. Trending Recommendations**
**Time-based suggestions:**

#### **Morning (6 AM - 12 PM)**
- Coffee, Croissant, Bagel, Muffin

#### **Afternoon (12 PM - 5 PM)**
- Burger, Coca-Cola, Fries, Salad

#### **Evening (5 PM - 10 PM)**
- Pizza, Beer, Wine, Pasta

#### **Night (10 PM - 6 AM)**
- Burger, Beer, Fries, Chicken Wings

### **4. Similar Product Recommendations**
**Alternative options in the same category:**

- **Burger** → Chicken Burger, Veggie Burger, Sandwich
- **Pizza** → Calzone, Pasta, Lasagna
- **Salad** → Soup, Smoothie, Wrap
- **Pasta** → Pizza, Lasagna, Risotto
- **Coffee** → Latte, Cappuccino, Espresso

## 🎨 **UI Components**

### **ProductRecommendations Component**
```typescript
<ProductRecommendations
  recommendations={recommendations}
  onProductPress={handleRecommendationPress}
  onAddToCart={handleRecommendationAddToCart}
  title="You might also like"
  maxItems={6}
/>
```

### **Visual Indicators**
- **Complementary**: ❤️ Heart icon (Perfect with...)
- **Contradictory**: ⭐ Star icon (Try something different...)
- **Trending**: 🔥 Flame icon (Popular choice...)
- **Similar**: 🍴 Utensils icon (Similar to...)

## 🔧 **Technical Implementation**

### **Recommendation Engine**
```typescript
// Get smart recommendations
const recommendations = await getSmartRecommendations(product, {
  currentProduct: product,
  timeOfDay: 'afternoon',
  userPreferences: ['healthy', 'spicy'],
  orderHistory: previousOrders
});
```

### **Product Category Detection**
```typescript
function getProductCategory(product: any): string {
  const text = `${product.name} ${product.description}`.toLowerCase();
  
  if (text.includes('burger')) return 'burger';
  if (text.includes('pizza')) return 'pizza';
  if (text.includes('coca-cola')) return 'coca-cola';
  // ... more categories
}
```

### **Confidence Scoring**
- **Complementary**: 0.8 (High confidence)
- **Similar**: 0.7 (Good confidence)
- **Trending**: 0.7 (Good confidence)
- **Contradictory**: 0.6 (Medium confidence)

## 📱 **User Experience**

### **Product Detail Page**
1. **User views a burger**
2. **System suggests**:
   - Coca-Cola (complementary)
   - Fries (complementary)
   - Pizza (contradictory)
   - Chicken Burger (similar)
   - Beer (trending for evening)

### **Smart Mixing**
The system intelligently mixes different types:
- 2 Complementary (high confidence)
- 1 Contradictory (medium confidence)
- 1 Trending (good confidence)
- 1 Similar (good confidence)

## 🎯 **Business Benefits**

### **Increased Sales**
- ✅ Cross-selling complementary products
- ✅ Upselling with premium options
- ✅ Encouraging exploration with contradictory suggestions

### **Better User Experience**
- ✅ Personalized recommendations
- ✅ Time-aware suggestions
- ✅ Variety and discovery

### **Data-Driven Insights**
- ✅ Track recommendation performance
- ✅ Optimize product pairings
- ✅ Understand user preferences

## 🚀 **Setup Instructions**

### **1. Files Created**
- `lib/recommendations.ts` - Core recommendation engine
- `components/ProductRecommendations.tsx` - UI component
- Updated `app/item-detail.tsx` - Integration

### **2. Database Integration**
The system works with your existing database structure:
- Uses `getMenuItems()` to fetch all products
- Analyzes product names and descriptions
- No additional database tables needed

### **3. Customization**
You can easily customize the recommendation logic:

```typescript
// Add new complementary pairs
const COMPLEMENTARY_PAIRS = {
  'your-product': ['suggested-product1', 'suggested-product2'],
  // ... existing pairs
};

// Add new contradictory pairs
const CONTRADICTORY_PAIRS = {
  'your-product': ['opposite-product1', 'opposite-product2'],
  // ... existing pairs
};
```

## 🎨 **Visual Design**

### **Recommendation Cards**
- **Product Image** with category badge
- **Product Name** and **Price**
- **Reason** for recommendation
- **Add to Cart** button
- **View Details** on tap

### **Color Coding**
- **Complementary**: Red theme (primary)
- **Contradictory**: Blue theme (secondary)
- **Trending**: Orange theme (warning)
- **Similar**: Gray theme (neutral)

## 📊 **Analytics & Optimization**

### **Track Performance**
- Monitor which recommendations are clicked
- Track add-to-cart conversion rates
- Analyze user engagement

### **A/B Testing**
- Test different recommendation algorithms
- Compare complementary vs contradictory performance
- Optimize for different user segments

## 🎯 **Result**

Your app now has **intelligent product recommendations** that:

- ✅ **Suggest perfect pairings** (Burger + Coca-Cola)
- ✅ **Encourage exploration** (Salad → Burger)
- ✅ **Time-aware suggestions** (Evening → Pizza + Beer)
- ✅ **Similar alternatives** (Burger → Chicken Burger)
- ✅ **Increase sales** through cross-selling
- ✅ **Improve user experience** with personalized suggestions

The recommendation system is **fully integrated** and **ready to use**! 🎉
