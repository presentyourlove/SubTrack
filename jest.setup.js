// Mock standard libraries
global.ReanimatedDataMock = {
  now: () => 0,
};

// Mock Skia
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const View = require('react-native').View;
  return {
    Canvas: (props) => React.createElement(View, props, props.children),
    Path: () => null,
    Rect: () => null,
    Group: ({ children }) => children,
    Skia: {
      Path: {
        Make: () => ({
          addArc: jest.fn(),
          reset: jest.fn(),
          moveTo: jest.fn(),
          arcToOval: jest.fn(),
          close: jest.fn(),
          addCircle: jest.fn(),
        }),
      },
      Color: jest.fn(),
    },
    useFont: () => ({}),
    vec: jest.fn(),
  };
});

// @op-engineering/op-sqlite is mocked via __mocks__/@op-engineering/op-sqlite.js

// Mock react-native-worklets (must be before reanimated)
jest.mock('react-native-worklets', () => ({
  Worklets: {
    createRunInContextFn: jest.fn(),
    createRunAsync: jest.fn(),
    createContext: jest.fn(),
  },
}));

// Mock react-native-reanimated (comprehensive manual mock)
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = require('react-native').View;

  return {
    default: {
      View,
      Text: View,
      Image: View,
      ScrollView: View,
      FlatList: View,
      call: () => { },
      createAnimatedComponent: (component) => component,
    },
    useSharedValue: (init) => ({ value: init }),
    useDerivedValue: (fn) => ({ value: fn() }),
    useAnimatedStyle: () => ({}),
    useAnimatedProps: () => ({}),
    withTiming: (val) => val,
    withSpring: (val) => val,
    withDelay: (_, val) => val,
    withSequence: (...vals) => vals[vals.length - 1],
    withRepeat: (val) => val,
    Easing: {
      linear: (x) => x,
      ease: (x) => x,
      in: () => (x) => x,
      out: () => (x) => x,
      inOut: () => (x) => x,
      bezier: () => (x) => x,
      cubic: (x) => x,
      exp: (x) => x,
    },
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    interpolate: (val) => val,
    Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    cancelAnimation: jest.fn(),
    createAnimatedComponent: (component) => component,
    View,
    Text: View,
    Image: View,
    ScrollView: View,
    FlatList: View,
  };
});

jest.mock('expo-font', () => ({
  isLoaded: jest.fn().mockReturnValue(true),
  loadAsync: jest.fn(),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn().mockResolvedValue({ uri: 'file:///mock-image.jpg' }),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
  FlipType: { Horizontal: 'horizontal', Vertical: 'vertical' },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  MediaTypeOptions: { Images: 'images', All: 'all' },
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
    }),
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
// Load the actual english translations for testing
const enTranslations = require('./src/i18n/en').default;

jest.mock('./src/i18n', () => ({
  t: jest.fn((key, options) => {
    if (options && options.defaultValue) return options.defaultValue;

    // Simple property access for nested keys like 'common.save'
    const keys = key.split('.');
    let value = enTranslations;
    for (const k of keys) {
      value = value?.[k];
    }

    if (typeof value === 'string') {
      // Simple interpolation for {{value}}
      if (options) {
        return value.replace(/\{\{(\w+)\}\}/g, (_, k) => options[k] || `{{${k}}}`);
      }
      return value;
    }

    return key; // Fallback to key if not found
  }),
  locale: 'en-US', // Use EN for tests as we check English strings
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

// Mock firebaseConfig to prevent env var errors
jest.mock('./src/services/firebaseConfig', () => ({
  auth: {},
  db: {},
}));

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

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { MAX: 5, HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1 },
  SchedulableTriggerInputTypes: {
    TIME_INTERVAL: 'timeInterval',
    DATE: 'date',
    DAILY: 'daily',
    WEEKLY: 'weekly',
    CALENDAR: 'calendar',
  },
}));

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
  supportedAuthenticationTypesAsync: jest.fn(() => Promise.resolve([1, 2])),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
}));

// Mock react-native-multithreading
jest.mock('react-native-multithreading', () => ({
  spawnThread: jest.fn((fn) => Promise.resolve(fn())),
}));
