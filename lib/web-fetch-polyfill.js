// Browser fetch polyfill for @supabase/node-fetch
// This replaces node-fetch with native browser fetch for web builds
// Supabase will automatically use the global fetch in browser environments

const getGlobalFetch = () => {
  if (typeof fetch !== 'undefined') {
    return fetch;
  }
  if (typeof global !== 'undefined' && global.fetch) {
    return global.fetch;
  }
  if (typeof window !== 'undefined' && window.fetch) {
    return window.fetch;
  }
  throw new Error('fetch is not available in this environment');
};

const getGlobalHeaders = () => {
  if (typeof Headers !== 'undefined') {
    return Headers;
  }
  if (typeof global !== 'undefined' && global.Headers) {
    return global.Headers;
  }
  if (typeof window !== 'undefined' && window.Headers) {
    return window.Headers;
  }
  throw new Error('Headers is not available in this environment');
};

const getGlobalRequest = () => {
  if (typeof Request !== 'undefined') {
    return Request;
  }
  if (typeof global !== 'undefined' && global.Request) {
    return global.Request;
  }
  if (typeof window !== 'undefined' && window.Request) {
    return window.Request;
  }
  throw new Error('Request is not available in this environment');
};

const getGlobalResponse = () => {
  if (typeof Response !== 'undefined') {
    return Response;
  }
  if (typeof global !== 'undefined' && global.Response) {
    return global.Response;
  }
  if (typeof window !== 'undefined' && window.Response) {
    return window.Response;
  }
  throw new Error('Response is not available in this environment');
};

const fetchImpl = getGlobalFetch();

// Export as default and named export for compatibility
module.exports = fetchImpl;
module.exports.default = fetchImpl;
module.exports.Headers = getGlobalHeaders();
module.exports.Request = getGlobalRequest();
module.exports.Response = getGlobalResponse();

// Also export as ESM-style for better compatibility
module.exports.__esModule = true;

