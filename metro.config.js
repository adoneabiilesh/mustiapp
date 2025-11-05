const { withNativeWind } = require('nativewind/metro');
const path = require('path');
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");
const fs = require('fs');

const config = getSentryExpoConfig(__dirname);

// Configure platform-specific file resolution
config.resolver = config.resolver || {};

// Prioritize platform-specific extensions
config.resolver.sourceExts = ['web.tsx', 'web.ts', 'web.jsx', 'web.js', 'tsx', 'ts', 'jsx', 'js', 'json', 'mjs', 'cjs'];

// Ensure node_modules are resolved correctly
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

// Explicitly resolve Supabase packages to help Metro/web bundler
const supabasePackages = [
  '@supabase/postgrest-js',
  '@supabase/realtime-js',
  '@supabase/storage-js',
  '@supabase/functions-js',
  '@supabase/auth-js',
  '@supabase/node-fetch'
];

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...supabasePackages.reduce((acc, pkg) => {
    acc[pkg] = path.resolve(__dirname, 'node_modules', pkg);
    return acc;
  }, {}),
};

// Custom resolver to handle Supabase ESM imports and Node.js built-ins
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block Node.js built-in modules that don't exist in React Native FIRST
  // These modules are typically polyfilled or not needed
  const nodeBuiltins = ['stream', 'http', 'https', 'url', 'util', 'buffer', 'crypto', 'path', 'fs', 'os', 'net', 'tls', 'zlib', 'events', 'querystring'];
  if (nodeBuiltins.includes(moduleName)) {
    // Return an empty module stub for Node.js built-ins
    // Most React Native code doesn't need these, and if they do, they should use polyfills
    return {
      type: 'empty',
    };
  }
  
  // Replace @supabase/node-fetch with platform-appropriate polyfill
  // This must happen before other Supabase package resolution
  // @supabase/node-fetch uses Node.js built-ins (stream, http, url) which don't exist in React Native
  if (moduleName === '@supabase/node-fetch') {
    if (platform === 'web') {
      const fetchWrapperPath = path.resolve(__dirname, 'lib', 'web-fetch-polyfill.js');
      if (fs.existsSync(fetchWrapperPath)) {
        return { type: 'sourceFile', filePath: fetchWrapperPath };
      }
    } else {
      // For native platforms (ios, android), use React Native fetch polyfill
      const nativeFetchPath = path.resolve(__dirname, 'lib', 'native-fetch-polyfill.js');
      if (fs.existsSync(nativeFetchPath)) {
        return { type: 'sourceFile', filePath: nativeFetchPath };
      }
    }
  }
  
  // Handle @supabase/* package resolution
  if (moduleName.startsWith('@supabase/')) {
    const packagePath = path.resolve(__dirname, 'node_modules', moduleName);
    
    if (fs.existsSync(packagePath)) {
      try {
        const pkgJsonPath = path.join(packagePath, 'package.json');
        if (fs.existsSync(pkgJsonPath)) {
          const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
          
          // For web builds, prefer CommonJS main entry for better compatibility
          let entryPoint;
          if (platform === 'web') {
            // Prefer CJS for web compatibility
            entryPoint = pkgJson.main || (pkgJson.exports && pkgJson.exports.require?.default) || 'index.js';
          } else {
            // For native, use the appropriate entry
            entryPoint = pkgJson.main || pkgJson.module || 'index.js';
          }
          
          // Resolve the entry point
          const resolvedPath = path.resolve(packagePath, entryPoint);
          
          if (fs.existsSync(resolvedPath)) {
            return { type: 'sourceFile', filePath: resolvedPath };
          }
          
          // Fallback: try dist/cjs/index.js
          const cjsPath = path.resolve(packagePath, 'dist/cjs/index.js');
          if (fs.existsSync(cjsPath)) {
            return { type: 'sourceFile', filePath: cjsPath };
          }
          
          // Fallback: try just index.js
          const indexPath = path.resolve(packagePath, 'index.js');
          if (fs.existsSync(indexPath)) {
            return { type: 'sourceFile', filePath: indexPath };
          }
        }
      } catch (err) {
        console.warn(`[Metro] Error resolving ${moduleName}:`, err.message);
      }
    }
    
    // Last resort: use require.resolve
    try {
      const resolvedPath = require.resolve(moduleName, { 
        paths: [
          context.originModulePath ? path.dirname(context.originModulePath) : __dirname,
          path.resolve(__dirname, 'node_modules'),
          __dirname
        ]
      });
      return { type: 'sourceFile', filePath: resolvedPath };
    } catch (e) {
      // Will fall through to default resolver
    }
  }
  
  // Use default resolver for all other modules
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  // Fallback to default Metro resolver
  return context.resolveRequest(context, moduleName, platform);
};

// Block .native files from being analyzed in web builds
if (process.env.EXPO_PLATFORM === 'web') {
  config.resolver.blockList = [/.*\.native\.(tsx?|jsx?)$/];
}

module.exports = withNativeWind(config, { input: './app/globals.css' });