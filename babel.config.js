module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // IMPORTANTE: react-native-reanimated/plugin debe ir siempre al final.
      'react-native-reanimated/plugin',
    ],
  };
};
