import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeDatabase, Database } from '../services';
import { Subscription, UserSettings, Tag, Workspace, CustomReport } from '../types';
import * as db from '../services';
import * as tagDb from '../services/db/tags';
import * as workspaceDb from '../services/db/workspaces';
import * as reportDb from '../services/db/reports';
import { useAuth } from './AuthContext';
import { calculateNextBillingDate } from '../utils/dateHelper';
import { useSync } from '../hooks/useSync';
import {
  syncSubscriptionToFirestore,
  syncUserSettingsToFirestore,
  deleteSubscriptionFromFirestore,
} from '../services/syncService';
import i18n from '../i18n';

type DatabaseContextType = {
  database: Database | null;
  subscriptions: Subscription[];
  tags: Tag[];
  settings: UserSettings | null;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  refreshData: () => Promise<void>;
  addSubscription: (
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
    tagIds?: number[],
  ) => Promise<void>;
  updateSubscription: (
    id: number,
    updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>,
    tagIds?: number[],
  ) => Promise<void>;
  deleteSubscription: (id: number) => Promise<void>;
  updateSettings: (
    updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>,
  ) => Promise<void>;
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  // 標籤相關方法
  createTag: (name: string, color: string) => Promise<number | null>;
  deleteTag: (id: number) => Promise<void>;
  getTagsForSubscription: (subscriptionId: number) => Promise<Tag[]>;
  setTagsForSubscription: (subscriptionId: number, tagIds: number[]) => Promise<void>;
  // 工作區方法

  createWorkspace: (name: string, icon: string) => Promise<void>;
  updateWorkspace: (id: number, name: string, icon: string) => Promise<void>;
  deleteWorkspace: (id: number) => Promise<void>;
  switchWorkspace: (id: number) => Promise<void>;
  // 報表方法
  createReport: (
    report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<number | null>;
  getReports: () => Promise<CustomReport[]>;
  deleteReport: (id: number) => Promise<void>;
};

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [database, setDatabase] = useState<Database | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
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
      const [subs, sets, allTags, allWorkspaces] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.getAllSubscriptions(dbInstance as any), // This will likely return empty if filtered by workspace, handled below
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db.getUserSettings(dbInstance as any),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tagDb.getAllTags(dbInstance as any),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        workspaceDb.getWorkspaces(dbInstance as any),
      ]);

      setSettings(sets);
      setTags(allTags);
      setWorkspaces(allWorkspaces);

      // 設定當前工作區
      if (sets?.currentWorkspaceId) {
        const current =
          allWorkspaces.find((w) => w.id === sets.currentWorkspaceId) || allWorkspaces[0];
        setCurrentWorkspace(current);

        // 重新載入該工作區的訂閱
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const workspaceSubs = await db.getAllSubscriptions(dbInstance as any, current.id);
        setSubscriptions(workspaceSubs);
      } else {
        setSubscriptions(subs);
      }
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

  // 監聽語言設定變更
  useEffect(() => {
    if (settings?.language) {
      i18n.locale = settings.language;
    }
  }, [settings?.language]);

  // 新增訂閱

  // 新增訂閱
  async function addSubscription(
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
  ) {
    if (!database) throw new Error('Database not initialized');
    if (!currentWorkspace) throw new Error('No active workspace');

    const calculatedNextBillingDate = calculateNextBillingDate(
      subscription.startDate,
      subscription.billingCycle,
    );

    const subData = {
      ...subscription,
      nextBillingDate: subscription.nextBillingDate || calculatedNextBillingDate,
      workspaceId: currentWorkspace.id,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = await db.addSubscription(database as any, subData);

    // 如果已登入，同步到雲端
    if (isAuthenticated && user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allSubs = await db.getAllSubscriptions(database as any, currentWorkspace.id);
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
      const allSubs = await db.getAllSubscriptions(database as any, currentWorkspace?.id);
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

  // 建立標籤
  async function createTag(name: string, color: string): Promise<number | null> {
    if (!database) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = await tagDb.createTag(database as any, name, color);
      await refreshData();
      return id;
    } catch (error) {
      console.error('Failed to create tag:', error);
      return null;
    }
  }

  // 刪除標籤
  async function deleteTag(id: number): Promise<void> {
    if (!database) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await tagDb.deleteTag(database as any, id);
    await refreshData();
  }

  // 取得訂閱的標籤
  async function getTagsForSubscription(subscriptionId: number): Promise<Tag[]> {
    if (!database) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return tagDb.getTagsForSubscription(database as any, subscriptionId);
  }

  // 設定訂閱的標籤
  async function setTagsForSubscription(subscriptionId: number, tagIds: number[]): Promise<void> {
    if (!database) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await tagDb.setTagsForSubscription(database as any, subscriptionId, tagIds);
  }

  // 工作區操作
  async function createWorkspace(name: string, icon: string) {
    if (!database) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workspaceDb.createWorkspace(database as any, name, icon);
    await refreshData();
  }

  async function updateWorkspace(id: number, name: string, icon: string) {
    if (!database) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workspaceDb.updateWorkspace(database as any, id, name, icon);
    await refreshData();
  }

  async function deleteWorkspace(id: number) {
    if (!database) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workspaceDb.deleteWorkspace(database as any, id);
    // 如果刪除的是當前工作區，切換回預設
    if (currentWorkspace?.id === id) {
      await switchWorkspace(1);
    } else {
      await refreshData();
    }
  }

  async function switchWorkspace(id: number) {
    if (!database) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workspaceDb.switchWorkspace(database as any, id);
    await refreshData();
  }

  const value = {
    database,
    subscriptions,
    tags,
    settings,
    workspaces,
    currentWorkspace,
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
    createTag,
    deleteTag,
    getTagsForSubscription,
    setTagsForSubscription,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    createReport,
    getReports,
    deleteReport,
  };

  // 報表操作
  async function createReport(report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!database) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return reportDb.createReport(database as any, report);
  }

  async function getReports() {
    if (!database) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return reportDb.getReports(database as any);
  }

  async function deleteReport(id: number) {
    if (!database) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await reportDb.deleteReport(database as any, id);
  }

  return <DatabaseContext.Provider value={value}>{children}</DatabaseContext.Provider>;
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
