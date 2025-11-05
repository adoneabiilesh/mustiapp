module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { 
                jsxImportSource: "nativewind",
                // Disable react-native-worklets plugin since it's not compatible with RN 0.76.9
                // react-native-reanimated provides worklets support instead
            }],
            "nativewind/babel",
        ],
        plugins: [
            // react-native-reanimated plugin must be listed last
            "react-native-reanimated/plugin",
        ],
    };
};
