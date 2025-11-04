import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';

interface StripeCardInputProps {
  onPaymentMethodCreated: (paymentMethodId: string, cardDetails: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  }) => void;
  onError: (error: string) => void;
  saveCard: boolean;
  setSaveCard: (value: boolean) => void;
}

const StripeCardInput: React.FC<StripeCardInputProps> = ({
  onPaymentMethodCreated,
  onError,
  saveCard,
  setSaveCard,
}) => {
  const { createPaymentMethod } = useStripe();
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleCreatePaymentMethod = async () => {
    if (!cardComplete) {
      Alert.alert('Incomplete', 'Please enter valid card details');
      return;
    }

    setProcessing(true);

    try {
      // Create payment method (tokenizes card securely)
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Stripe error:', error);
        onError(error.message);
        return;
      }

      if (!paymentMethod) {
        onError('Failed to create payment method');
        return;
      }

      console.log('✅ Payment method created:', paymentMethod.id);

      // Pass tokenized data to parent
      onPaymentMethodCreated(paymentMethod.id, {
        brand: paymentMethod.Card?.brand || 'card',
        last4: paymentMethod.Card?.last4 || '0000',
        exp_month: paymentMethod.Card?.expMonth || 0,
        exp_year: paymentMethod.Card?.expYear || 0,
      });
    } catch (error: any) {
      console.error('Payment method creation error:', error);
      onError(error.message || 'Failed to process card');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Card Information</Text>
      
      {/* Stripe's Secure Card Field */}
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242',
          expiration: 'MM/YY',
          cvc: 'CVC',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: Colors.text.primary,
          fontSize: 16,
          placeholderColor: Colors.neutral[400],
          borderWidth: 1,
          borderColor: Colors.neutral[200],
          borderRadius: BorderRadius.md,
        }}
        style={styles.cardField}
        onCardChange={(cardDetails) => {
          setCardComplete(cardDetails.complete);
        }}
      />

      {/* Save Card Checkbox */}
      <TouchableOpacity
        onPress={() => setSaveCard(!saveCard)}
        style={styles.checkboxContainer}
      >
        <View style={[styles.checkbox, saveCard && styles.checkboxChecked]}>
          {saveCard && <Icons.Check size={16} color="#FFFFFF" />}
        </View>
        <Text style={styles.checkboxLabel}>
          Save payment info for faster checkout next time
        </Text>
      </TouchableOpacity>

      {/* Security Info */}
      <View style={styles.securityInfo}>
        <Icons.Shield size={16} color={Colors.success[500]} />
        <Text style={styles.securityText}>
          Secured by Stripe. Your card details are never stored on our servers.
        </Text>
      </View>

      {/* Add/Use Card Button */}
      <TouchableOpacity
        onPress={handleCreatePaymentMethod}
        disabled={!cardComplete || processing}
        style={[
          styles.button,
          (!cardComplete || processing) && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>
          {processing ? 'Processing...' : saveCard ? 'Save Card' : 'Use Card'}
        </Text>
      </TouchableOpacity>

      {/* Test Card Info (only show in development) */}
      {__DEV__ && (
        <View style={styles.testInfo}>
          <Text style={styles.testInfoText}>
            💡 Test card: 4242 4242 4242 4242
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral[50],
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text.primary,
    flex: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success[50],
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  securityText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
    flex: 1,
  },
  button: {
    backgroundColor: Colors.primary[500],
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testInfo: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.neutral[100],
    borderRadius: BorderRadius.sm,
  },
  testInfoText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default StripeCardInput;




