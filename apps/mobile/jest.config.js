/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|sentry-expo|native-base|react-native-svg|@tanstack/.*|react-native-mmkv|react-native-maps))',
  ],
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
};
