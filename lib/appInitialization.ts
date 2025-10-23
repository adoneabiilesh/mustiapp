import { Platform } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AnalyticsManager } from './analytics';
import { NotificationManager } from './notifications';
import { checkAndPopulateData } from './sampleData';
import { testDatabaseConnection } from './testDatabase';

// Professional App Initialization
export class AppInitializer {
  private static instance: AppInitializer;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  
  static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }
  
  // Initialize the entire app
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;
    
    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }
  
  private async _performInitialization(): Promise<void> {
    try {
      console.log('🚀 Starting app initialization...');
      
      // Keep splash screen visible
      await SplashScreen.preventAutoHideAsync();
      
      // Initialize core systems
      await this.initializeCoreSystems();
      
      // Initialize fonts
      await this.initializeFonts();
      
      // Initialize database
      await this.initializeDatabase();
      
      // Initialize analytics
      await this.initializeAnalytics();
      
      // Initialize notifications
      await this.initializeNotifications();
      
      // Initialize sample data
      await this.initializeSampleData();
      
      // Mark as initialized
      this.isInitialized = true;
      
      // Hide splash screen
      await SplashScreen.hideAsync();
      
      console.log('✅ App initialization completed successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      throw error;
    }
  }
  
  // Initialize core systems
  private async initializeCoreSystems(): Promise<void> {
    console.log('🔧 Initializing core systems...');
    
    // Set up error handling
    this.setupErrorHandling();
    
    // Set up performance monitoring
    this.setupPerformanceMonitoring();
    
    console.log('✅ Core systems initialized');
  }
  
  // Initialize fonts
  private async initializeFonts(): Promise<void> {
    console.log('🔤 Loading fonts...');
    
    try {
      await Font.loadAsync({
        'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
        'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
        'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
        'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
      });
      
      console.log('✅ Fonts loaded successfully');
    } catch (error) {
      console.warn('⚠️ Font loading failed, using system fonts:', error);
    }
  }
  
  // Initialize database
  private async initializeDatabase(): Promise<void> {
    console.log('🗄️ Initializing database...');
    
    try {
      // Test database connection
      await testDatabaseConnection();
      console.log('✅ Database connection established');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }
  
  // Initialize analytics
  private async initializeAnalytics(): Promise<void> {
    console.log('📊 Initializing analytics...');
    
    try {
      const analytics = AnalyticsManager.getInstance();
      analytics.track('app_initialized', {
        platform: Platform.OS,
        timestamp: Date.now(),
      });
      
      console.log('✅ Analytics initialized');
    } catch (error) {
      console.warn('⚠️ Analytics initialization failed:', error);
    }
  }
  
  // Initialize notifications
  private async initializeNotifications(): Promise<void> {
    console.log('🔔 Initializing notifications...');
    
    try {
      const notificationManager = NotificationManager.getInstance();
      await notificationManager.initialize();
      notificationManager.setupListeners();
      
      console.log('✅ Notifications initialized');
    } catch (error) {
      console.warn('⚠️ Notifications initialization failed:', error);
    }
  }
  
  // Initialize sample data
  private async initializeSampleData(): Promise<void> {
    console.log('📦 Initializing sample data...');
    
    try {
      await checkAndPopulateData();
      console.log('✅ Sample data initialized');
    } catch (error) {
      console.warn('⚠️ Sample data initialization failed:', error);
    }
  }
  
  // Set up error handling
  private setupErrorHandling(): void {
    // Global error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      console.error('🚨 Global error:', error);
      
      // Track error in analytics
      const analytics = AnalyticsManager.getInstance();
      analytics.trackError(
        error.message || 'Unknown error',
        'global',
        isFatal ? 'high' : 'medium'
      );
      
      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });
  }
  
  // Set up performance monitoring
  private setupPerformanceMonitoring(): void {
    // Monitor app startup time
    const startTime = Date.now();
    
    // Track startup performance
    setTimeout(() => {
      const analytics = AnalyticsManager.getInstance();
      analytics.trackPerformance(
        'app_startup_time',
        Date.now() - startTime,
        'ms'
      );
    }, 1000);
  }
  
  // Check if app is initialized
  isAppInitialized(): boolean {
    return this.isInitialized;
  }
  
  // Get initialization status
  getInitializationStatus(): {
    isInitialized: boolean;
    isInitializing: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      isInitializing: this.initializationPromise !== null && !this.isInitialized,
    };
  }
  
  // Reset initialization (for testing)
  reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// App initialization hook
export const useAppInitialization = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        const appInitializer = AppInitializer.getInstance();
        await appInitializer.initialize();
        
        setIsInitialized(true);
      } catch (err) {
        setError(err as Error);
        console.error('App initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeApp();
  }, []);
  
  return {
    isInitialized,
    isInitializing,
    error,
  };
};

// App initialization component
export const AppInitializationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { isInitialized, isInitializing, error } = useAppInitialization();
  
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>
          App Initialization Failed
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>
          {error.message}
        </Text>
        <TouchableOpacity
          onPress={() => {
            const appInitializer = AppInitializer.getInstance();
            appInitializer.reset();
            // Restart initialization
            window.location.reload();
          }}
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 20, fontSize: 16, color: '#666' }}>
          Initializing app...
        </Text>
      </View>
    );
  }
  
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: '#666' }}>
          App not initialized
        </Text>
      </View>
    );
  }
  
  return <>{children}</>;
};

export default AppInitializer;
