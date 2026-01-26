import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Subscription, UserSettings } from '../types';
import { Database } from '../services';
import { uploadLocalDataToFirestore, downloadFirestoreDataToLocal } from '../services/syncService';

export function useSync(
  isAuthenticated: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any,
  database: Database | null,
  subscriptions: Subscription[],
  settings: UserSettings | null,
  setSubscriptions: (subs: Subscription[]) => void,
  setSettings: (settings: UserSettings) => void,
) {
  const [isOnline] = useState(true); // TODO: 使用 NetInfo
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [needsSync, setNeedsSync] = useState(false);

  const dailySyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 定義這兩個函式的 ref，避免循環依賴
  const autoSyncRef = useRef<() => Promise<void>>(undefined);

  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated || !user || !database) return;
    setIsSyncing(true);
    try {
      if (settings) {
        await uploadLocalDataToFirestore(user.uid, subscriptions, settings);
      }
      setLastSyncTime(new Date());
      setNeedsSync(false);
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user, database, subscriptions, settings]);

  const autoSync = useCallback(async () => {
    if (isOnline && isAuthenticated && user && needsSync) {
      await syncToCloud();
    }
  }, [isOnline, isAuthenticated, user, needsSync, syncToCloud]);

  // 更新 ref
  useEffect(() => {
    autoSyncRef.current = autoSync;
  }, [autoSync]);

  const scheduleAutoSync = useCallback(() => {
    if (dailySyncIntervalRef.current) {
      clearTimeout(dailySyncIntervalRef.current);
    }
    // Debounce sync for 5 seconds
    dailySyncIntervalRef.current = setTimeout(() => {
      if (autoSyncRef.current) autoSyncRef.current();
    }, 5000);
  }, []);

  const syncFromCloud = useCallback(async () => {
    if (!isAuthenticated || !user || !database) return;
    setIsSyncing(true);
    try {
      const cloudData = await downloadFirestoreDataToLocal(user.uid);
      setSubscriptions(cloudData.subscriptions);
      if (cloudData.settings) {
        setSettings(cloudData.settings);
      }
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Failed to sync from cloud:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user, database, setSubscriptions, setSettings]);

  // Trigger sync (used by add/update/delete)
  const triggerSync = useCallback(() => {
    setNeedsSync(true);
    if (isOnline && isAuthenticated && user) {
      scheduleAutoSync();
    }
  }, [isOnline, isAuthenticated, user, scheduleAutoSync]);

  // Initial download on login
  useEffect(() => {
    if (isAuthenticated && user && database) {
      syncFromCloud();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, database]);

  return useMemo(
    () => ({
      isOnline,
      isSyncing,
      lastSyncTime,
      syncToCloud,
      syncFromCloud,
      triggerSync,
    }),
    [isOnline, isSyncing, lastSyncTime, syncToCloud, syncFromCloud, triggerSync],
  );
}
