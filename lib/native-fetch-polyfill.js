// React Native fetch polyfill for @supabase/node-fetch
// This replaces node-fetch with React Native's native fetch
// React Native has fetch built-in, so we just export it

const getGlobalFetch = () => {
  // React Native has fetch available globally
  if (typeof fetch !== 'undefined') {
    return fetch;
  }
  if (typeof global !== 'undefined' && global.fetch) {
    return global.fetch;
  }
  throw new Error('fetch is not available in React Native environment');
};

const getGlobalHeaders = () => {
  if (typeof Headers !== 'undefined') {
    return Headers;
  }
  if (typeof global !== 'undefined' && global.Headers) {
    return global.Headers;
  }
  // Create a simple Headers polyfill if needed
  return class Headers {
    constructor(init) {
      this.map = new Map();
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.map.set(key, value));
        } else {
          Object.keys(init).forEach(key => this.map.set(key, init[key]));
        }
      }
    }
    get(name) {
      return this.map.get(name.toLowerCase());
    }
    set(name, value) {
      this.map.set(name.toLowerCase(), value);
    }
    has(name) {
      return this.map.has(name.toLowerCase());
    }
    delete(name) {
      this.map.delete(name.toLowerCase());
    }
  };
};

const getGlobalRequest = () => {
  if (typeof Request !== 'undefined') {
    return Request;
  }
  // Simple Request polyfill
  return class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init.method || 'GET';
      this.headers = new (getGlobalHeaders())(init.headers);
      this.body = init.body;
    }
  };
};

const getGlobalResponse = () => {
  if (typeof Response !== 'undefined') {
    return Response;
  }
  // Simple Response polyfill
  return class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.headers = new (getGlobalHeaders())(init.headers);
    }
    async json() {
      return JSON.parse(this.body);
    }
    async text() {
      return String(this.body);
    }
  };
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

