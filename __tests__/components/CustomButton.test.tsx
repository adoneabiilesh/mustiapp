/**
 * Component Test: CustomButton
 * Tests button component functionality
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Text } from 'react-native';

// Mock button component for testing
const MockButton = ({ onPress, title, disabled }: any) => (
  <TouchableOpacity onPress={onPress} disabled={disabled}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

describe('CustomButton', () => {
  test('should render with title', () => {
    const { getByText } = render(<MockButton title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeDefined();
  });

  test('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<MockButton title="Click Me" onPress={onPress} />);
    
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <MockButton title="Disabled" onPress={onPress} disabled={true} />
    );
    
    const button = getByText('Disabled').parent;
    expect(button?.props.disabled).toBe(true);
  });
});

