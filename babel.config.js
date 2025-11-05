// Intercept require for react-native-worklets/plugin before any presets load
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function(request, parent, isMain, options) {
  if (request === 'react-native-worklets/plugin' || request.endsWith('react-native-worklets/plugin')) {
    // Return a no-op module path instead
    const path = require('path');
    return path.resolve(__dirname, 'babel-plugin-noop.js');
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

module.exports = function (api) {
    api.cache(true);
    
    return {
        presets: [
            ["babel-preset-expo", { 
                jsxImportSource: "nativewind",
            }],
            "nativewind/babel",
        ],
        plugins: [
            // react-native-reanimated plugin must be listed last
            "react-native-reanimated/plugin",
        ],
    };
};
