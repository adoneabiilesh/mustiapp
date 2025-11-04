import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/lib/designSystem';
import { Icons } from '@/lib/icons';

interface StripeCardInputProps {
  onPaymentMethodCreated: (paymentMethodId: string, cardDetails: any) => void;
  onError: (error: string) => void;
  saveCard: boolean;
  setSaveCard: (value: boolean) => void;
}

const StripeCardInput: React.FC<StripeCardInputProps> = () => {
  return (
    <View style={styles.webNotSupported}>
      <Icons.AlertCircle size={48} color={Colors.neutral[400]} />
      <Text style={styles.webNotSupportedTitle}>Card Payments Not Available on Web</Text>
      <Text style={styles.webNotSupportedText}>
        Please use the mobile app (iOS/Android) to add payment methods and process card payments.
      </Text>
      <Text style={[styles.webNotSupportedText, { marginTop: Spacing.sm }]}>
        You can still use Cash on Delivery for web orders.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  webNotSupported: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  webNotSupportedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  webNotSupportedText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default StripeCardInput;




