const { getDefaultConfig } = require('expo/metro-config');

// When `npx expo start` runs from the repo root, this config is used.
// The repo root IS the workspace root and already contains node_modules,
// so no extra watchFolders or nodeModulesPaths are needed.
module.exports = getDefaultConfig(__dirname);
