import { initializeApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化 Auth 並根據平台使用不同的持久化策略
let auth: Auth;
if (Platform.OS === 'web') {
  // Web 平台使用 browserLocalPersistence
  auth = initializeAuth(app, {
    persistence: browserLocalPersistence,
  });
} else {
  // React Native 平台使用 getReactNativePersistence
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - 動態導入在 React Native 環境中可用
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getReactNativePersistence } = require('firebase/auth');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };

// 初始化 Firestore
export const db = getFirestore(app);

export default app;
