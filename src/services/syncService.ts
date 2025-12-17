import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  // updateDoc, // unused
  // where, // unused
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Subscription, UserSettings } from '../types';
import { DEFAULT_EXCHANGE_RATES } from '../constants/AppConfig';

// ==================== 訂閱同步 ====================

// 同步訂閱到 Firestore
export async function syncSubscriptionToFirestore(
  userId: string,
  subscription: Subscription,
): Promise<void> {
  const subscriptionRef = doc(db, 'users', userId, 'subscriptions', subscription.id.toString());

  await setDoc(subscriptionRef, {
    ...subscription,
    updatedAt: Timestamp.now(),
  });
}

// 從 Firestore 取得所有訂閱
export async function getSubscriptionsFromFirestore(userId: string): Promise<Subscription[]> {
  const subscriptionsRef = collection(db, 'users', userId, 'subscriptions');
  const q = query(subscriptionsRef, orderBy('nextBillingDate', 'asc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      id: parseInt(doc.id),
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as Subscription;
  });
}

// 刪除 Firestore 中的訂閱
export async function deleteSubscriptionFromFirestore(
  userId: string,
  subscriptionId: number,
): Promise<void> {
  const subscriptionRef = doc(db, 'users', userId, 'subscriptions', subscriptionId.toString());
  await deleteDoc(subscriptionRef);
}

// ==================== 使用者設定同步 ====================

// 同步使用者設定到 Firestore
export async function syncUserSettingsToFirestore(
  userId: string,
  settings: UserSettings,
): Promise<void> {
  const settingsRef = doc(db, 'users', userId, 'settings', 'default');

  await setDoc(settingsRef, {
    ...settings,
    updatedAt: Timestamp.now(),
  });
}

// 從 Firestore 取得使用者設定
export async function getUserSettingsFromFirestore(userId: string): Promise<UserSettings | null> {
  const settingsRef = doc(db, 'users', userId, 'settings', 'default');
  const settingsDoc = await getDoc(settingsRef);

  if (!settingsDoc.exists()) {
    // 建立預設設定
    const now = new Date().toISOString();
    const defaultSettings: UserSettings = {
      id: 1,
      mainCurrency: 'TWD',
      exchangeRates: JSON.stringify(DEFAULT_EXCHANGE_RATES),
      theme: 'dark',
      createdAt: now,
      updatedAt: now,
    };

    await syncUserSettingsToFirestore(userId, defaultSettings);
    return defaultSettings;
  }

  const data = settingsDoc.data();
  return {
    ...data,
    id: 1,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
  } as UserSettings;
}

// ==================== 完整同步 ====================

// 上傳本地資料到 Firestore
export async function uploadLocalDataToFirestore(
  userId: string,
  subscriptions: Subscription[],
  settings: UserSettings,
): Promise<void> {
  // 上傳所有訂閱
  const uploadPromises = subscriptions.map((sub) => syncSubscriptionToFirestore(userId, sub));

  // 上傳設定
  uploadPromises.push(syncUserSettingsToFirestore(userId, settings));

  await Promise.all(uploadPromises);
}

// 下載 Firestore 資料到本地
export async function downloadFirestoreDataToLocal(userId: string): Promise<{
  subscriptions: Subscription[];
  settings: UserSettings | null;
}> {
  const [subscriptions, settings] = await Promise.all([
    getSubscriptionsFromFirestore(userId),
    getUserSettingsFromFirestore(userId),
  ]);

  return { subscriptions, settings };
}

// ==================== 即時同步監聽 ====================

// 監聽訂閱變化（未來可用於即時同步）
export function subscribeToSubscriptions(
  _userId: string,
  _callback: (subscriptions: Subscription[]) => void,
) {
  // 這裡可以使用 onSnapshot 實作即時監聽
  // 目前先使用定期同步的方式
}
