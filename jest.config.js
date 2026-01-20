module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase|expo-.*|react-native-reanimated|react-native-worklets)',
  ],
  moduleNameMapper: {
    '^expo$': '<rootDir>/__mocks__/expo.js',
    '^expo/(.*)$': '<rootDir>/__mocks__/expo.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/services/firebaseConfig.ts',
    '!src/types/**',
    // Exclude modules with complex native dependencies
    '!src/context/DatabaseContext.tsx',
    '!src/context/AuthContext.tsx',
    '!src/context/SecurityContext.tsx',
    '!src/services/syncService.ts',
    '!src/services/importService.ts',
    '!src/services/database.ts',
    '!src/services/database.web.ts',
    '!src/services/imageService.ts',
    '!src/services/securityService.ts',
    '!src/services/calendarSyncService.ts',
    '!src/services/db/adapter.ts',
    '!src/services/db/init.ts',
    '!src/hooks/useSync.ts',
    '!src/utils/notificationHelper.ts',
    '!src/i18n/**',
  ],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 45,
      lines: 50,
      statements: 50,
    },
  },
};

