module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Alias '@' to apps/mobile/src — same as apps/mobile/babel.config.js but
      // with the path adjusted for the repo root as the Babel rootDir.
      ['module-resolver', { alias: { '@': './apps/mobile/src' } }],
      'react-native-reanimated/plugin',
    ],
  };
};
