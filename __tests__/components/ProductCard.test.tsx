import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '@/components/ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Pizza',
    description: 'Delicious test pizza',
    price: 12.99,
    image: 'https://example.com/pizza.jpg',
    category: 'Pizza',
  };

  const mockOnPress = jest.fn();
  const mockOnAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render product information correctly', () => {
    const { getByText } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(getByText('Test Pizza')).toBeTruthy();
    expect(getByText('Delicious test pizza')).toBeTruthy();
    expect(getByText('€12.99')).toBeTruthy();
  });

  it('should call onPress when card is pressed', () => {
    const { getByTestId } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress}
        onAddToCart={mockOnAddToCart}
        testID="product-card"
      />
    );

    const card = getByTestId('product-card');
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnPress).toHaveBeenCalledWith(mockProduct);
  });

  it('should call onAddToCart when add button is pressed', () => {
    const { getByTestId } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress}
        onAddToCart={mockOnAddToCart}
      />
    );

    const addButton = getByTestId('add-to-cart-button');
    fireEvent.press(addButton);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('should render image with correct source', () => {
    const { getByTestId } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress}
        onAddToCart={mockOnAddToCart}
      />
    );

    const image = getByTestId('product-image');
    expect(image.props.source).toEqual({ uri: mockProduct.image });
  });

  it('should format price correctly', () => {
    const { getByText } = render(
      <ProductCard 
        product={mockProduct} 
        onPress={mockOnPress}
        onAddToCart={mockOnAddToCart}
      />
    );

    expect(getByText('€12.99')).toBeTruthy();
  });

  it('should handle products without images', () => {
    const productWithoutImage = { ...mockProduct, image: null };
    
    const { getByTestId } = render(
      <ProductCard 
        product={productWithoutImage} 
        onPress={mockOnPress}
        onAddToCart={mockOnAddToCart}
      />
    );

    const placeholder = getByTestId('product-placeholder');
    expect(placeholder).toBeTruthy();
  });
});



