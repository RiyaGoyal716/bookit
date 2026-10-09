module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated's babel plugin must be listed last. In Reanimated 4 this entry
    // forwards to react-native-worklets/plugin, so gesture-handler + bottom-sheet
    // animations work in Expo Go.
    plugins: ['react-native-reanimated/plugin'],
  };
};
