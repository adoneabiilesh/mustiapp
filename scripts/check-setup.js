// Comprehensive setup checker
const fs = require('fs');
const path = require('path');

console.log('🔍 MustiApp Setup Checker\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    console.log(`✅ ${description}`);
    checks.passed++;
  } else {
    console.log(`❌ ${description}`);
    checks.failed++;
  }
  return exists;
}

function checkEnvVar(varName, description) {
  require('dotenv').config();
  const exists = !!process.env[varName];
  if (exists) {
    console.log(`✅ ${description}`);
    checks.passed++;
  } else {
    console.log(`⚠️  ${description}`);
    checks.warnings++;
  }
  return exists;
}

// Check project structure
console.log('📁 Project Structure:\n');
checkFile('package.json', 'Mobile app package.json');
checkFile('app/_layout.tsx', 'Mobile app layout');
checkFile('admin-dashboard/package.json', 'Admin dashboard package.json');
checkFile('admin-dashboard/app/page.tsx', 'Admin dashboard home page');
checkFile('scripts/create-supabase-schema.sql', 'Database schema file');

// Check environment files
console.log('\n📝 Environment Configuration:\n');
const mobileEnvExists = checkFile('.env', 'Mobile app .env file');
const adminEnvExists = checkFile('admin-dashboard/.env.local', 'Admin dashboard .env.local file');

if (!mobileEnvExists) {
  console.log('   💡 Copy .env.example to .env and add your keys');
}
if (!adminEnvExists) {
  console.log('   💡 Copy admin-dashboard/.env.example to admin-dashboard/.env.local');
}

// Check environment variables
if (mobileEnvExists || adminEnvExists) {
  console.log('\n🔑 Environment Variables:\n');
  checkEnvVar('EXPO_PUBLIC_SUPABASE_URL', 'Supabase URL');
  checkEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'Supabase Anon Key');
  checkEnvVar('SUPABASE_SERVICE_ROLE_KEY', 'Supabase Service Key (for admin)');
  checkEnvVar('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'Stripe Publishable Key');
  checkEnvVar('STRIPE_SECRET_KEY', 'Stripe Secret Key (for admin)');
}

// Check dependencies
console.log('\n📦 Dependencies:\n');
checkFile('node_modules', 'Mobile app node_modules installed');
checkFile('admin-dashboard/node_modules', 'Admin dashboard node_modules installed');

// Check critical files
console.log('\n🔧 Critical Files:\n');
checkFile('lib/supabase.ts', 'Supabase client (mobile)');
checkFile('admin-dashboard/lib/supabase.ts', 'Supabase client (admin)');
checkFile('store/auth.store.ts', 'Auth store');
checkFile('store/cart.store.ts', 'Cart store');

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📊 Setup Summary:\n');
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}\n`);

if (checks.failed > 0) {
  console.log('🔴 Setup Incomplete\n');
  console.log('Please fix the failed checks above.\n');
  console.log('Quick fixes:');
  console.log('1. Run: npm install');
  console.log('2. Run: cd admin-dashboard && npm install');
  console.log('3. Copy .env.example to .env and add your keys\n');
  process.exit(1);
} else if (checks.warnings > 0) {
  console.log('🟡 Setup Almost Complete\n');
  console.log('Some optional configurations are missing.');
  console.log('The app will work but some features may not be available.\n');
  console.log('Next steps:');
  console.log('1. Add missing environment variables');
  console.log('2. Run: node scripts/test-connection.js');
  console.log('3. Run database schema in Supabase dashboard');
  console.log('4. Run: node scripts/seed-menu-from-images.js\n');
} else {
  console.log('🟢 Setup Complete!\n');
  console.log('Next steps:');
  console.log('1. Test connection: node scripts/test-connection.js');
  console.log('2. Start mobile app: npm start');
  console.log('3. Start admin: cd admin-dashboard && npm run dev\n');
}


