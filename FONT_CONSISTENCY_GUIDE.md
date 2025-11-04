# Font Consistency Fix Guide

## 🚨 **Problem Identified**

The app has **inconsistent font usage** across multiple systems:

1. **Tailwind CSS classes** (`font-semibold`, `font-bold`, `text-lg`, etc.)
2. **ProfessionalText component** with Typography system
3. **Inline styles** with `fontWeight`, `fontSize`
4. **Mixed approaches** throughout the app

## ✅ **Solution: Unified Font System**

I've created a **UnifiedText component system** that provides:

### **🎯 Consistent Typography**
- **Single source of truth** for all text styling
- **Quicksand fonts** throughout the app
- **Proper font weight mapping**
- **Consistent sizing and spacing**

### **🔧 UnifiedText Components**
```typescript
// Main component
<UnifiedText variant="h1" color={Colors.neutral[900]}>
  Heading Text
</UnifiedText>

// Convenience components
<Heading1 color={Colors.neutral[900]}>Main Title</Heading1>
<Heading2 color={Colors.primary[600]}>Section Title</Heading2>
<Heading3 color={Colors.neutral[700]}>Subsection</Heading3>
<BodyText color={Colors.neutral[600]}>Body content</BodyText>
<CaptionText color={Colors.neutral[500]}>Small text</CaptionText>
<PriceText color={Colors.primary[600]}>€25.99</PriceText>
```

## 📋 **Font Replacement Rules**

### **1. Replace Tailwind Font Classes**
```typescript
// ❌ Before (Tailwind)
<Text className="text-3xl font-bold text-gray-900">
  Title
</Text>

// ✅ After (UnifiedText)
<Heading1 color={Colors.neutral[900]}>
  Title
</Heading1>
```

### **2. Replace Inline Font Styles**
```typescript
// ❌ Before (Inline styles)
<Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
  Content
</Text>

// ✅ After (UnifiedText)
<Heading3 color={Colors.neutral[700]}>
  Content
</Heading3>
```

### **3. Replace Mixed Approaches**
```typescript
// ❌ Before (Mixed)
<Text style={[Typography.body1, { fontWeight: '600' }]}>
  Content
</Text>

// ✅ After (UnifiedText)
<BodyText color={Colors.neutral[900]}>
  Content
</BodyText>
```

## 🎨 **Typography Hierarchy**

### **Display Text**
- **Variant**: `display`
- **Use**: Hero titles, main headings
- **Size**: 48px, Bold

### **Headings (H1-H6)**
- **H1**: 36px, Bold - Main page titles
- **H2**: 30px, Bold - Section titles
- **H3**: 24px, SemiBold - Subsection titles
- **H4**: 20px, SemiBold - Card titles
- **H5**: 18px, Medium - Small headings
- **H6**: 16px, Medium - Labels

### **Body Text**
- **Body1**: 16px, Regular - Main content
- **Body2**: 14px, Regular - Secondary content
- **Label**: 14px, Medium - Form labels
- **Caption**: 12px, Regular - Small text
- **Small**: 10px, Regular - Tiny text

### **Special Text**
- **Button**: 16px, SemiBold - Button text
- **Price**: 18px, Bold - Price display
- **PriceLarge**: 24px, Bold - Large prices

## 🔧 **Implementation Steps**

### **1. Import UnifiedText Components**
```typescript
import { 
  UnifiedText, 
  Heading1, 
  Heading2, 
  Heading3, 
  BodyText, 
  CaptionText, 
  PriceText 
} from '../components/UnifiedText';
```

### **2. Replace Font Classes**
- Search for `className.*font` patterns
- Replace with appropriate UnifiedText components
- Use consistent color system

### **3. Replace Inline Styles**
- Search for `style.*font` patterns
- Replace with UnifiedText variants
- Remove manual font styling

### **4. Test Consistency**
- Check all screens for font consistency
- Verify Quicksand fonts are loading
- Ensure proper fallbacks

## 📱 **Files to Fix**

### **High Priority (Many Font Issues)**
1. `app/order-confirmation.tsx` ✅ **FIXED**
2. `app/item-detail.tsx`
3. `app/(tabs)/search.tsx`
4. `app/(tabs)/index.tsx`
5. `app/order-details.tsx`

### **Medium Priority**
6. `app/payment-method.tsx`
7. `app/checkout.tsx`
8. `app/order-tracking.tsx`
9. `app/(tabs)/orders.tsx`
10. `app/(tabs)/profile.tsx`

### **Low Priority**
11. `app/order-success.tsx`
12. `app/rate-order.tsx`
13. `app/(tabs)/_layout.tsx`

## 🎯 **Benefits of Unified System**

### **✅ Consistency**
- Same fonts throughout the app
- Consistent sizing and spacing
- Professional appearance

### **✅ Maintainability**
- Single source of truth
- Easy to update globally
- Reduced code duplication

### **✅ Performance**
- Optimized font loading
- Proper fallbacks
- Better rendering

### **✅ Developer Experience**
- Clear typography hierarchy
- Easy to use components
- TypeScript support

## 🚀 **Next Steps**

1. **Fix remaining files** with font inconsistencies
2. **Test font loading** across platforms
3. **Verify consistency** in all screens
4. **Update documentation** for team

## 📊 **Progress Tracking**

- ✅ **UnifiedText component** created
- ✅ **Order confirmation** fixed
- 🔄 **Item detail** - in progress
- ⏳ **Search screen** - pending
- ⏳ **Index screen** - pending
- ⏳ **Other screens** - pending

The font consistency fix is **in progress** and will ensure a **professional, consistent appearance** throughout your app! 🎉
