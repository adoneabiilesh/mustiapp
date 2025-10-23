import { Platform } from 'react-native';

// Professional Analytics System
export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private events: Array<{ event: string; properties: any; timestamp: number }> = [];
  private userId: string | null = null;
  private sessionId: string | null = null;
  
  static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }
  
  // Initialize analytics
  initialize(userId: string) {
    this.userId = userId;
    this.sessionId = this.generateSessionId();
    this.track('app_opened', {
      platform: Platform.OS,
      timestamp: Date.now(),
    });
  }
  
  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Track custom events
  track(event: string, properties: any = {}) {
    const eventData = {
      event,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        platform: Platform.OS,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
    };
    
    this.events.push(eventData);
    console.log('📊 Analytics Event:', event, properties);
    
    // In a real app, you would send this to your analytics service
    // this.sendToAnalyticsService(eventData);
  }
  
  // User Events
  trackUserSignUp(method: 'email' | 'google' | 'apple' | 'facebook') {
    this.track('user_signup', { method });
  }
  
  trackUserSignIn(method: 'email' | 'google' | 'apple' | 'facebook') {
    this.track('user_signin', { method });
  }
  
  trackUserSignOut() {
    this.track('user_signout');
  }
  
  trackProfileUpdate(fields: string[]) {
    this.track('profile_update', { fields });
  }
  
  // Search Events
  trackSearch(query: string, resultsCount: number, filters?: any) {
    this.track('search_performed', {
      query,
      resultsCount,
      filters,
    });
  }
  
  trackSearchFilter(filterType: string, filterValue: string) {
    this.track('search_filter_applied', {
      filterType,
      filterValue,
    });
  }
  
  trackSearchResultClick(resultId: string, position: number, query: string) {
    this.track('search_result_clicked', {
      resultId,
      position,
      query,
    });
  }
  
  // Restaurant Events
  trackRestaurantView(restaurantId: string, restaurantName: string) {
    this.track('restaurant_viewed', {
      restaurantId,
      restaurantName,
    });
  }
  
  trackRestaurantFavorite(restaurantId: string, action: 'add' | 'remove') {
    this.track('restaurant_favorited', {
      restaurantId,
      action,
    });
  }
  
  trackRestaurantFilter(filterType: string, filterValue: string) {
    this.track('restaurant_filter_applied', {
      filterType,
      filterValue,
    });
  }
  
  // Menu Events
  trackMenuItemView(itemId: string, itemName: string, restaurantId: string) {
    this.track('menu_item_viewed', {
      itemId,
      itemName,
      restaurantId,
    });
  }
  
  trackMenuItemFavorite(itemId: string, action: 'add' | 'remove') {
    this.track('menu_item_favorited', {
      itemId,
      action,
    });
  }
  
  trackMenuItemCustomization(itemId: string, customizations: any) {
    this.track('menu_item_customized', {
      itemId,
      customizations,
    });
  }
  
  // Cart Events
  trackAddToCart(itemId: string, itemName: string, price: number, quantity: number, restaurantId: string) {
    this.track('item_added_to_cart', {
      itemId,
      itemName,
      price,
      quantity,
      restaurantId,
    });
  }
  
  trackRemoveFromCart(itemId: string, itemName: string, quantity: number) {
    this.track('item_removed_from_cart', {
      itemId,
      itemName,
      quantity,
    });
  }
  
  trackCartView(itemCount: number, totalValue: number) {
    this.track('cart_viewed', {
      itemCount,
      totalValue,
    });
  }
  
  trackCartAbandoned(itemCount: number, totalValue: number, timeSpent: number) {
    this.track('cart_abandoned', {
      itemCount,
      totalValue,
      timeSpent,
    });
  }
  
  // Order Events
  trackOrderStarted(restaurantId: string, itemCount: number, totalValue: number) {
    this.track('order_started', {
      restaurantId,
      itemCount,
      totalValue,
    });
  }
  
  trackOrderCompleted(orderId: string, totalValue: number, paymentMethod: string, deliveryTime: number) {
    this.track('order_completed', {
      orderId,
      totalValue,
      paymentMethod,
      deliveryTime,
    });
  }
  
  trackOrderCancelled(orderId: string, reason: string, stage: string) {
    this.track('order_cancelled', {
      orderId,
      reason,
      stage,
    });
  }
  
  trackOrderRated(orderId: string, rating: number, review?: string) {
    this.track('order_rated', {
      orderId,
      rating,
      review,
    });
  }
  
  // Payment Events
  trackPaymentMethodAdded(method: string) {
    this.track('payment_method_added', { method });
  }
  
  trackPaymentMethodRemoved(method: string) {
    this.track('payment_method_removed', { method });
  }
  
  trackPaymentCompleted(orderId: string, amount: number, method: string) {
    this.track('payment_completed', {
      orderId,
      amount,
      method,
    });
  }
  
  trackPaymentFailed(orderId: string, amount: number, method: string, error: string) {
    this.track('payment_failed', {
      orderId,
      amount,
      method,
      error,
    });
  }
  
  // Promotion Events
  trackPromotionViewed(promotionId: string, promotionType: string) {
    this.track('promotion_viewed', {
      promotionId,
      promotionType,
    });
  }
  
  trackPromotionClicked(promotionId: string, promotionType: string) {
    this.track('promotion_clicked', {
      promotionId,
      promotionType,
    });
  }
  
  trackPromoCodeApplied(code: string, discount: number) {
    this.track('promo_code_applied', {
      code,
      discount,
    });
  }
  
  trackPromoCodeRemoved(code: string) {
    this.track('promo_code_removed', { code });
  }
  
  // Navigation Events
  trackScreenView(screenName: string, previousScreen?: string) {
    this.track('screen_viewed', {
      screenName,
      previousScreen,
    });
  }
  
  trackButtonClick(buttonName: string, screenName: string) {
    this.track('button_clicked', {
      buttonName,
      screenName,
    });
  }
  
  trackTabSwitch(tabName: string, previousTab?: string) {
    this.track('tab_switched', {
      tabName,
      previousTab,
    });
  }
  
  // Error Events
  trackError(error: string, screen: string, severity: 'low' | 'medium' | 'high') {
    this.track('error_occurred', {
      error,
      screen,
      severity,
    });
  }
  
  trackCrash(error: string, stackTrace: string) {
    this.track('app_crashed', {
      error,
      stackTrace,
    });
  }
  
  // Performance Events
  trackPerformance(metric: string, value: number, unit: string) {
    this.track('performance_metric', {
      metric,
      value,
      unit,
    });
  }
  
  trackLoadTime(screen: string, loadTime: number) {
    this.track('screen_load_time', {
      screen,
      loadTime,
    });
  }
  
  // User Engagement Events
  trackSessionStart() {
    this.track('session_started');
  }
  
  trackSessionEnd(duration: number) {
    this.track('session_ended', { duration });
  }
  
  trackFeatureUsed(feature: string, usageCount: number) {
    this.track('feature_used', {
      feature,
      usageCount,
    });
  }
  
  // Get analytics data
  getEvents() {
    return this.events;
  }
  
  getSessionId() {
    return this.sessionId;
  }
  
  getUserId() {
    return this.userId;
  }
  
  // Clear analytics data
  clearEvents() {
    this.events = [];
  }
  
  // Export analytics data
  exportData() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      events: this.events,
      totalEvents: this.events.length,
    };
  }
}

// Analytics Hooks
export const useAnalytics = () => {
  const analytics = AnalyticsManager.getInstance();
  
  return {
    track: (event: string, properties?: any) => analytics.track(event, properties),
    trackScreenView: (screenName: string, previousScreen?: string) => 
      analytics.trackScreenView(screenName, previousScreen),
    trackButtonClick: (buttonName: string, screenName: string) => 
      analytics.trackButtonClick(buttonName, screenName),
    trackError: (error: string, screen: string, severity: 'low' | 'medium' | 'high') => 
      analytics.trackError(error, screen, severity),
  };
};

// Screen tracking decorator
export const withAnalytics = (WrappedComponent: React.ComponentType<any>, screenName: string) => {
  return (props: any) => {
    const analytics = AnalyticsManager.getInstance();
    
    React.useEffect(() => {
      analytics.trackScreenView(screenName);
    }, []);
    
    return <WrappedComponent {...props} />;
  };
};

export default AnalyticsManager;
