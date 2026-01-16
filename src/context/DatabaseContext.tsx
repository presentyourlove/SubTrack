import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeDatabase, Database } from '../services';
import { Subscription, UserSettings } from '../types';
import * as db from '../services';
import { useAuth } from './AuthContext';
import { calculateNextBillingDate } from '../utils/dateHelper';
import { useSync } from '../hooks/useSync';
import {
  syncSubscriptionToFirestore,
  syncUserSettingsToFirestore,
  deleteSubscriptionFromFirestore,
} from '../services/syncService';

type DatabaseContextType = {
  database: Database | null;
  subscriptions: Subscription[];
  settings: UserSettings | null;
  loading: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  refreshData: () => Promise<void>;
  addSubscription: (
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<void>;
  updateSubscription: (
    id: number,
    updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => Promise<void>;
  deleteSubscription: (id: number) => Promise<void>;
  updateSettings: (
    updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => Promise<void>;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [database, setDatabase] = useState<Database | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化資料庫
  useEffect(() => {
    async function init() {
      try {
        const dbInstance = await initializeDatabase();
        setDatabase(dbInstance);
        await loadLocalData(dbInstance);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 載入本地資料
  async function loadLocalData(dbInstance: Database) {
    try {
      const [subs, sets] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.getAllSubscriptions(dbInstance as any),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.getUserSettings(dbInstance as any),
      ]);
      setSubscriptions(subs);
      setSettings(sets);
    } catch (error) {
      console.error('Failed to load local data:', error);
    }
  }

  // 重新整理資料
  async function refreshData() {
    if (!database) return;
    await loadLocalData(database);
  }

  // 使用 Sync Hook
  const { isOnline, isSyncing, lastSyncTime, syncToCloud, syncFromCloud, triggerSync } = useSync(
    isAuthenticated,
    user,
    database,
    subscriptions,
    settings,
    setSubscriptions,
    setSettings,
  );

  // 新增訂閱
  async function addSubscription(
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    if (!database) throw new Error('Database not initialized');

    const calculatedNextBillingDate = calculateNextBillingDate(
      subscription.startDate,
      subscription.billingCycle,
    );

    const subData = {
      ...subscription,
      nextBillingDate: subscription.nextBillingDate || calculatedNextBillingDate,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = await db.addSubscription(database as any, subData);

    // 如果已登入，同步到雲端
    if (isAuthenticated && user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allSubs = await db.getAllSubscriptions(database as any);
      const newSub = allSubs.find((s) => s.id === id);
      if (newSub) {
        await syncSubscriptionToFirestore(user.uid, newSub);
      }
    }

    await refreshData();
    triggerSync();
  }

  // 更新訂閱
  async function updateSubscription(
    id: number,
    updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    if (!database) throw new Error('Database not initialized');

    const finalUpdates = { ...updates };
    if (updates.startDate || updates.billingCycle) {
      const currentSub = subscriptions.find((s) => s.id === id);
      if (currentSub) {
        const startDate = updates.startDate || currentSub.startDate;
        const cycle = updates.billingCycle || currentSub.billingCycle;
        finalUpdates.nextBillingDate = calculateNextBillingDate(startDate, cycle);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.updateSubscription(database as any, id, finalUpdates);

    // 如果已登入，同步到雲端
    if (isAuthenticated && user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allSubs = await db.getAllSubscriptions(database as any);
      const updatedSub = allSubs.find((s) => s.id === id);
      if (updatedSub) {
        await syncSubscriptionToFirestore(user.uid, updatedSub);
      }
    }

    await refreshData();
    triggerSync();
  }

  // 刪除訂閱
  async function deleteSubscription(id: number) {
    if (!database) throw new Error('Database not initialized');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.deleteSubscription(database as any, id);

    // 如果已登入，從雲端刪除
    if (isAuthenticated && user) {
      await deleteSubscriptionFromFirestore(user.uid, id);
    }

    await refreshData();
    triggerSync();
  }

  // 更新設定
  async function updateSettings(
    updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>,
  ) {
    if (!database) throw new Error('Database not initialized');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.updateUserSettings(database as any, updates);

    // 如果已登入，同步到雲端
    if (isAuthenticated && user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newSettings = await db.getUserSettings(database as any);
      if (newSettings) {
        await syncUserSettingsToFirestore(user.uid, newSettings);
      }
    }

    await refreshData();
    triggerSync();
  }

  const value = {
    database,
    subscriptions,
    settings,
    loading,
    isOnline,
    isSyncing,
    lastSyncTime,
    refreshData,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    updateSettings,
    syncToCloud,
    syncFromCloud,
  };

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
