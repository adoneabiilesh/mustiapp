/**
 * Environment Variable Validation
 * Validates all required environment variables are set
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
}

const REQUIRED_ENV_VARS: EnvConfig[] = [
  // Mobile App
  {
    name: 'EXPO_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    name: 'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe publishable key',
  },
  {
    name: 'EXPO_PUBLIC_SENTRY_DSN',
    required: false,
    description: 'Sentry DSN for error tracking',
  },
];

const REQUIRED_ADMIN_ENV_VARS: EnvConfig[] = [
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase project URL',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase anonymous key',
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase service role key (admin only)',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe webhook secret',
  },
];

export function validateEnvVars(env: 'mobile' | 'admin' = 'mobile'): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = env === 'mobile' ? REQUIRED_ENV_VARS : REQUIRED_ADMIN_ENV_VARS;
  const missing: string[] = [];
  const warnings: string[] = [];

  required.forEach((config) => {
    const value = process.env[config.name];
    
    if (config.required && !value) {
      missing.push(config.name);
    } else if (!value) {
      warnings.push(`${config.name} (optional) - ${config.description}`);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

export function printEnvStatus(): void {
  console.log('🔍 Validating Environment Variables...\n');

  // Check mobile app env
  console.log('📱 Mobile App Environment:');
  const mobile = validateEnvVars('mobile');
  if (mobile.valid) {
    console.log('✅ All required variables set');
  } else {
    console.error('❌ Missing required variables:');
    mobile.missing.forEach((name) => console.error(`   - ${name}`));
  }
  if (mobile.warnings.length > 0) {
    console.log('⚠️  Optional variables not set:');
    mobile.warnings.forEach((warn) => console.log(`   - ${warn}`));
  }

  console.log('\n🖥️  Admin Dashboard Environment:');
  const admin = validateEnvVars('admin');
  if (admin.valid) {
    console.log('✅ All required variables set');
  } else {
    console.error('❌ Missing required variables:');
    admin.missing.forEach((name) => console.error(`   - ${name}`));
  }
  if (admin.warnings.length > 0) {
    console.log('⚠️  Optional variables not set:');
    admin.warnings.forEach((warn) => console.log(`   - ${warn}`));
  }

  if (!mobile.valid || !admin.valid) {
    console.error('\n❌ Environment validation failed!');
    process.exit(1);
  } else {
    console.log('\n✅ All environment variables validated!');
  }
}

// Run if called directly
if (require.main === module) {
  printEnvStatus();
}




