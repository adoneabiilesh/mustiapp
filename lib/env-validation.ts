/**
 * Environment Variable Validation
 * Ensures all required environment variables are set
 */

export const validateEnvironment = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required environment variables
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL is missing');
  }

  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY is missing');
  }

  if (!process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing');
  }

  // Optional but recommended
  if (!process.env.EXPO_PUBLIC_SENTRY_DSN) {
    warnings.push('EXPO_PUBLIC_SENTRY_DSN is missing (error tracking will be disabled)');
  }

  // Log errors and warnings
  if (errors.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:');
    errors.forEach(error => console.error(`   - ${error}`));
    console.error('\n📝 Please configure environment variables in EAS secrets.');
    console.error('   Run: eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value <your-value>\n');
    
    // In production, don't throw - return error status instead
    // The app will show an error screen instead of crashing
  }

  if (warnings.length > 0 && __DEV__) {
    console.warn('⚠️ WARNINGS:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Validate on import
if (typeof window !== 'undefined' || typeof global !== 'undefined') {
  validateEnvironment();
}

