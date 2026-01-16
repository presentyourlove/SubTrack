import { useState, useEffect, useRef, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Database } from '../services';
import { Subscription, UserSettings } from '../types';
import { uploadLocalDataToFirestore, downloadFirestoreDataToLocal } from '../services/syncService';
import { User } from 'firebase/auth'; // Ensure correct type import if needed, or just use any/User type context provides

export function useSync(
  isAuthenticated: boolean,
  user: User | null,
  database: Database | null,
  subscriptions: Subscription[],
  settings: UserSettings | null,
  setSubscriptions: (subs: Subscription[]) => void,
  setSettings: (settings: UserSettings | null) => void,
) {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [needsSync, setNeedsSync] = useState(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailySyncIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ?·è??ªå??Œæ­¥
  const autoSync = useCallback(async () => {
    if (!isAuthenticated || !user || !database || isSyncing) return;

    try {
      setIsSyncing(true);
      await uploadLocalDataToFirestore(user.uid, subscriptions, settings!);
      setNeedsSync(false);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('?ªå??Œæ­¥å¤±æ?:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user, database, isSyncing, subscriptions, settings]);

  // è¨­å??ªå??Œæ­¥?’ç? (?²æ?)
  const scheduleAutoSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      autoSync();
    }, 2000);
  }, [autoSync]);

  // ç¶²è·¯?€?‹ç›£??  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected === true;
      setIsOnline(online);

      // ?¶ç¶²è·¯æ¢å¾©ä??‰å??Œæ­¥è³‡æ???è§¸ç™¼?ªå??Œæ­¥
      if (online && needsSync && isAuthenticated && user) {
        scheduleAutoSync();
      }
    });

    return () => unsubscribe();
  }, [needsSync, isAuthenticated, user, scheduleAutoSync]);

  // æ¯æ—¥å®šæ??Œæ­¥ logic can be simplified or kept here.
  // Keeping it here for now.
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const scheduleDailySync = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Midnight

      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      dailySyncIntervalRef.current = setTimeout(() => {
        if (isOnline && isAuthenticated && user) {
          autoSync();
        }
        scheduleDailySync();
      }, msUntilMidnight);
    };

    scheduleDailySync();

    return () => {
      if (dailySyncIntervalRef.current) {
        clearTimeout(dailySyncIntervalRef.current);
      }
    };
  }, [isAuthenticated, user, isOnline, autoSync]);

  // ?‹å??Œæ­¥ä¸Šå‚³
  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated || !user || !database) {
      throw new Error('User not authenticated');
    }

    try {
      await uploadLocalDataToFirestore(user.uid, subscriptions, settings!);
    } catch (error) {
      console.error('Failed to sync to cloud:', error);
      throw error;
    }
  }, [isAuthenticated, user, database, subscriptions, settings]);

  // ?‹å??Œæ­¥ä¸‹è?
  const syncFromCloud = useCallback(async () => {
    if (!isAuthenticated || !user || !database) {
      throw new Error('User not authenticated');
    }

    try {
      const cloudData = await downloadFirestoreDataToLocal(user.uid);
      setSubscriptions(cloudData.subscriptions);
      if (cloudData.settings) {
        setSettings(cloudData.settings);
      }
    } catch (error) {
      console.error('Failed to sync from cloud:', error);
      throw error;
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
  }, [isAuthenticated, user, database, syncFromCloud]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncToCloud,
    syncFromCloud,
    triggerSync, // Expose this to be called after CRUD
  };
}
