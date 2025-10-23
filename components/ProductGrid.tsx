import React, { useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
} from 'react-native';
import ProductCard from './ProductCard';

const { width: screenWidth } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isFavorite?: boolean;
  hasCustomizations?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onProductPress: (productId: string) => void;
  onFavoriteToggle: (productId: string, newState: boolean) => void;
  onAddToCart: (productId: string) => void;
  loading?: boolean;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const ProductGrid = ({
  products,
  onProductPress,
  onFavoriteToggle,
  onAddToCart,
  loading = false,
  onEndReached,
  onRefresh,
  refreshing = false,
}: ProductGridProps) => {
  // Memoize the render item function
  const renderItem = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductCard
      key={item.id}
      id={item.id}
      name={item.name}
      description={item.description}
      price={item.price}
      imageUrl={item.imageUrl}
      isFavorite={item.isFavorite}
      hasCustomizations={item.hasCustomizations}
      onPress={onProductPress}
      onFavoriteToggle={onFavoriteToggle}
      onAddToCart={onAddToCart}
      testID={`product-card-${index}`}
    />
  ), [onProductPress, onFavoriteToggle, onAddToCart]);

  // Memoize the key extractor
  const keyExtractor = useCallback((item: Product) => item.id, []);

  // Memoize the list footer
  const ListFooterComponent = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          {/* Add skeleton loading here if needed */}
        </View>
      );
    }
    return null;
  }, [loading]);

  // Memoize the list empty component
  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      {/* Add empty state here if needed */}
    </View>
  ), []);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={ListEmptyComponent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={6}
        getItemLayout={(data, index) => ({
          length: 200, // Approximate item height
          offset: 200 * Math.floor(index / 2),
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Extra space for tab bar
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
});

export default ProductGrid;
