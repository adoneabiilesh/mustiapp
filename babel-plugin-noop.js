// No-op Babel plugin to replace react-native-worklets/plugin
module.exports = function() {
  return {
    name: 'noop',
    visitor: {
      // Empty visitor - does nothing
    }
  };
};

