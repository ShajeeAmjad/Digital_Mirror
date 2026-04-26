module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.ts'],
  moduleNameMapper: {
    '@shopify/react-native-skia': '@shopify/react-native-skia/src/mock',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!' +
      [
        'react-native',
        'react-native-.*',
        '@react-native(-community)?/.*',
        '@react-native/.*',
        'expo',
        'expo-.*',
        '@expo/.*',
        '@expo-google-fonts/.*',
        'react-navigation',
        '@react-navigation/.*',
        '@unimodules/.*',
        'unimodules',
        'sentry-expo',
        'native-base',
        'react-native-svg',
        '@shopify/react-native-skia',
        '@nozbe/watermelondb',
        '@supabase/.*',
        'react-native-reanimated',
        'react-native-worklets',
        'react-native-worklets-core',
        'react-native-gesture-handler',
        'react-native-mmkv',
        'react-native-purchases',
      ].join('|') +
    ')',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
};
