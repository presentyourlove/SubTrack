// Mock standard libraries
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper'); // Removed as it caused resolution error

// Mock Expo modules
jest.mock('expo', () => ({
  registerRootComponent: jest.fn(),
}));

jest.mock('expo-font', () => ({
  isLoaded: jest.fn().mockReturnValue(true),
  loadAsync: jest.fn(),
}));



jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock-document-directory/',
  makeDirectoryAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
    })
  ),
  SQLiteDatabase: jest.fn(),
}));

jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCalendarsAsync: jest.fn(() => Promise.resolve([{ id: '1', allowsModifications: true }])),
  createEventAsync: jest.fn(() => Promise.resolve('event-id')),
  deleteEventAsync: jest.fn(() => Promise.resolve()),
  EntityTypes: { EVENT: 'event' },
}));

jest.mock('expo-constants', () => ({
  manifest: { extra: {} },
}));

jest.mock('expo-localization', () => ({
  locale: 'zh-TW',
  locales: ['zh-TW'],
  getLocales: () => [{ languageCode: 'zh', regionCode: 'TW', languageTag: 'zh-TW' }],
}));

// Mock i18n
jest.mock('./src/i18n', () => ({
  t: jest.fn((key, options) => {
    if (options && options.defaultValue) return options.defaultValue;
    return key; // Return key as fallback
  }),
  locale: 'zh-TW',
}));

// Mock Firebase (if necessary, simple mock)
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: {
    now: jest.fn(() => ({ toISOString: () => new Date().toISOString() })),
  },
}));

// Mock Async Storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const RealComponent = jest.requireActual('@react-native-community/datetimepicker');
  return {
    ...RealComponent,
    default: (props) => {
      // Return a View for testing purposes as DateTimePicker is native
      const { View } = require('react-native');
      return React.createElement(View, { testID: 'dateTimePicker', ...props });
    },
  };
});
