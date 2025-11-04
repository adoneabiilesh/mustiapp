import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';

// Professional Payment Method Card
export const PaymentMethodCard: React.FC<{
  paymentMethod: {
    id: string;
    type: 'card' | 'digital_wallet' | 'cash';
    name: string;
    lastFour?: string;
    expiryDate?: string;
    isDefault: boolean;
    icon: string;
  };
  onPress: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}> = ({ paymentMethod, onPress, onSetDefault, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  
  const getCardStyle = () => {
    switch (paymentMethod.type) {
      case 'card':
        return {
          backgroundColor: '#991B1B',
          gradient: ['#991B1B', '#E53E3E'],
        };
      case 'digital_wallet':
        return {
          backgroundColor: '#000000',
          gradient: ['#000000', '#374151'],
        };
      default:
        return {
          backgroundColor: Colors.neutral[600],
          gradient: [Colors.neutral[600], Colors.neutral[400]],
        };
    }
  };
  
  const cardStyle = getCardStyle();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={() => setShowActions(!showActions)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.md,
        ...Shadows.sm,
        borderWidth: 1,
        borderColor: paymentMethod.isDefault ? Colors.primary[200] : Colors.neutral[200],
      }}
    >
      {/* Card Preview */}
      <View
        style={{
          backgroundColor: cardStyle.backgroundColor,
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          margin: Spacing.sm,
          position: 'relative',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg }}>
          <View>
            <Text style={[Typography.caption, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              {paymentMethod.type === 'card' ? 'CARD' : paymentMethod.type === 'digital_wallet' ? 'DIGITAL WALLET' : 'CASH'}
            </Text>
            <Text style={[Typography.h6, { color: '#FFFFFF', marginTop: Spacing.xs }]}>
              {paymentMethod.name}
            </Text>
          </View>
          
          {paymentMethod.isDefault && (
            <View
              style={{
                backgroundColor: Colors.success[500],
                borderRadius: BorderRadius.sm,
                paddingHorizontal: Spacing.sm,
                paddingVertical: Spacing.xs,
              }}
            >
              <Text style={[Typography.caption, { color: '#FFFFFF' }]}>
                DEFAULT
              </Text>
            </View>
          )}
        </View>
        
        {paymentMethod.type === 'card' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[Typography.body1, { color: '#FFFFFF' }]}>
              •••• •••• •••• {paymentMethod.lastFour}
            </Text>
            <Text style={[Typography.caption, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              {paymentMethod.expiryDate}
            </Text>
          </View>
        )}
      </View>
      
      {/* Actions */}
      {showActions && (
        <View style={{ flexDirection: 'row', padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.neutral[200] }}>
          <TouchableOpacity
            onPress={onSetDefault}
            style={{
              flex: 1,
              backgroundColor: Colors.primary[100],
              borderRadius: BorderRadius.md,
              paddingVertical: Spacing.sm,
              alignItems: 'center',
              marginRight: Spacing.sm,
            }}
          >
            <Text style={[Typography.label, { color: Colors.primary[700] }]}>
              Set Default
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onDelete}
            style={{
              flex: 1,
              backgroundColor: Colors.error[100],
              borderRadius: BorderRadius.md,
              paddingVertical: Spacing.sm,
              alignItems: 'center',
            }}
          >
            <Text style={[Typography.label, { color: Colors.error[700] }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Professional Add Payment Method
export const AddPaymentMethod: React.FC<{
  onAddCard: () => void;
  onAddDigitalWallet: () => void;
  onAddCash: () => void;
}> = ({ onAddCard, onAddDigitalWallet, onAddCash }) => (
  <View style={{ padding: Spacing.lg }}>
    <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.lg }]}>
      Add Payment Method
    </Text>
    
    <View style={{ gap: Spacing.md }}>
      {/* Add Card */}
      <TouchableOpacity
        onPress={onAddCard}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          ...Shadows.sm,
          borderWidth: 1,
          borderColor: Colors.neutral[200],
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.primary[100],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.md,
          }}
        >
          <Icons.CreditCard size={24} color={Colors.primary[600]} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h6, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
            Credit/Debit Card
          </Text>
          <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
            Add a new card for payments
          </Text>
        </View>
        
        <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
      </TouchableOpacity>
      
      {/* Add Digital Wallet */}
      <TouchableOpacity
        onPress={onAddDigitalWallet}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          ...Shadows.sm,
          borderWidth: 1,
          borderColor: Colors.neutral[200],
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.neutral[100],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.md,
          }}
        >
          <Icons.Smartphone size={24} color={Colors.neutral[600]} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h6, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
            Digital Wallet
          </Text>
          <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
            Apple Pay, Google Pay, PayPal
          </Text>
        </View>
        
        <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
      </TouchableOpacity>
      
      {/* Add Cash */}
      <TouchableOpacity
        onPress={onAddCash}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: BorderRadius.lg,
          padding: Spacing.lg,
          ...Shadows.sm,
          borderWidth: 1,
          borderColor: Colors.neutral[200],
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: BorderRadius.full,
            backgroundColor: Colors.success[100],
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: Spacing.md,
          }}
        >
          <Icons.Dollar size={24} color={Colors.success[600]} />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={[Typography.h6, { color: Colors.neutral[900], marginBottom: Spacing.xs }]}>
            Cash on Delivery
          </Text>
          <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
            Pay when your order arrives
          </Text>
        </View>
        
        <Icons.ChevronRight size={20} color={Colors.neutral[400]} />
      </TouchableOpacity>
    </View>
  </View>
);

// Professional Payment Form
export const PaymentForm: React.FC<{
  onSubmit: (data: any) => void;
  loading?: boolean;
}> = ({ onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: false,
  });
  
  const handleSubmit = () => {
    onSubmit(formData);
  };
  
  return (
    <View style={{ padding: Spacing.lg }}>
      <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.lg }]}>
        Payment Details
      </Text>
      
      <View style={{ gap: Spacing.md }}>
        {/* Card Number */}
        <View>
          <Text style={[Typography.label, { color: Colors.neutral[700], marginBottom: Spacing.sm }]}>
            Card Number
          </Text>
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              borderWidth: 1,
              borderColor: Colors.neutral[300],
              ...Typography.body1,
            }}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={Colors.neutral[500]}
            value={formData.cardNumber}
            onChangeText={(text) => setFormData({ ...formData, cardNumber: text })}
            keyboardType="numeric"
          />
        </View>
        
        {/* Expiry Date and CVV */}
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.label, { color: Colors.neutral[700], marginBottom: Spacing.sm }]}>
              Expiry Date
            </Text>
            <TextInput
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                borderWidth: 1,
                borderColor: Colors.neutral[300],
                ...Typography.body1,
              }}
              placeholder="MM/YY"
              placeholderTextColor={Colors.neutral[500]}
              value={formData.expiryDate}
              onChangeText={(text) => setFormData({ ...formData, expiryDate: text })}
            />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={[Typography.label, { color: Colors.neutral[700], marginBottom: Spacing.sm }]}>
              CVV
            </Text>
            <TextInput
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: BorderRadius.md,
                padding: Spacing.md,
                borderWidth: 1,
                borderColor: Colors.neutral[300],
                ...Typography.body1,
              }}
              placeholder="123"
              placeholderTextColor={Colors.neutral[500]}
              value={formData.cvv}
              onChangeText={(text) => setFormData({ ...formData, cvv: text })}
              keyboardType="numeric"
              secureTextEntry
            />
          </View>
        </View>
        
        {/* Cardholder Name */}
        <View>
          <Text style={[Typography.label, { color: Colors.neutral[700], marginBottom: Spacing.sm }]}>
            Cardholder Name
          </Text>
          <TextInput
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              borderWidth: 1,
              borderColor: Colors.neutral[300],
              ...Typography.body1,
            }}
            placeholder="John Doe"
            placeholderTextColor={Colors.neutral[500]}
            value={formData.cardholderName}
            onChangeText={(text) => setFormData({ ...formData, cardholderName: text })}
          />
        </View>
        
        {/* Save Card Checkbox */}
        <TouchableOpacity
          onPress={() => setFormData({ ...formData, saveCard: !formData.saveCard })}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: Spacing.md,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: BorderRadius.sm,
              borderWidth: 2,
              borderColor: formData.saveCard ? Colors.primary[500] : Colors.neutral[300],
              backgroundColor: formData.saveCard ? Colors.primary[500] : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: Spacing.sm,
            }}
          >
            {formData.saveCard && (
              <Icons.Check size={12} color="#FFFFFF" />
            )}
          </View>
          <Text style={[Typography.body2, { color: Colors.neutral[700] }]}>
            Save card for future payments
          </Text>
        </TouchableOpacity>
        
        {/* Security Badges */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.neutral[50], borderRadius: BorderRadius.md }}>
          <Icons.Shield size={16} color={Colors.success[600]} />
          <Text style={[Typography.caption, { color: Colors.neutral[600], marginLeft: Spacing.sm }]}>
            Your payment information is encrypted and secure
          </Text>
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? Colors.neutral[300] : Colors.primary[500],
            borderRadius: BorderRadius.lg,
            paddingVertical: Spacing.md,
            alignItems: 'center',
            marginTop: Spacing.lg,
          }}
        >
          <Text style={[Typography.button, { color: '#FFFFFF' }]}>
            {loading ? 'Processing...' : 'Add Payment Method'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Professional Payment Summary
export const PaymentSummary: React.FC<{
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
}> = ({ items, subtotal, deliveryFee, tax, discount, total }) => (
  <View style={{ backgroundColor: '#FFFFFF', borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.sm }}>
    <Text style={[Typography.h5, { color: Colors.neutral[900], marginBottom: Spacing.md }]}>
      Order Summary
    </Text>
    
    {/* Items */}
    <View style={{ marginBottom: Spacing.md }}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm }}>
          <Text style={[Typography.body2, { color: Colors.neutral[700] }]}>
            {item.name} x{item.quantity}
          </Text>
          <Text style={[Typography.body2, { color: Colors.neutral[700] }]}>
            €{(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
    
    {/* Divider */}
    <View style={{ height: 1, backgroundColor: Colors.neutral[200], marginVertical: Spacing.md }} />
    
    {/* Totals */}
    <View style={{ gap: Spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
          Subtotal
        </Text>
        <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
          €{subtotal.toFixed(2)}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
          Delivery Fee
        </Text>
        <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
          €{deliveryFee.toFixed(2)}
        </Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
          Tax
        </Text>
        <Text style={[Typography.body2, { color: Colors.neutral[600] }]}>
          €{tax.toFixed(2)}
        </Text>
      </View>
      
      {discount > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={[Typography.body2, { color: Colors.success[600] }]}>
            Discount
          </Text>
          <Text style={[Typography.body2, { color: Colors.success[600] }]}>
            -€{discount.toFixed(2)}
          </Text>
        </View>
      )}
      
      {/* Divider */}
      <View style={{ height: 1, backgroundColor: Colors.neutral[200], marginVertical: Spacing.sm }} />
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[Typography.h6, { color: Colors.neutral[900] }]}>
          Total
        </Text>
        <Text style={[Typography.h6, { color: Colors.neutral[900] }]}>
          €{total.toFixed(2)}
        </Text>
      </View>
    </View>
  </View>
);

// Export individual components
export {
  PaymentMethodCard,
  AddPaymentMethod,
  PaymentForm,
  PaymentSummary,
};

export default {
  PaymentMethodCard,
  AddPaymentMethod,
  PaymentForm,
  PaymentSummary,
};
