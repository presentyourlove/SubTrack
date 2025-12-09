import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { initializeDatabase, Database } from '../services';
import { Subscription, UserSettings } from '../types';
import * as db from '../services';
import { useAuth } from './AuthContext';
import {
    uploadLocalDataToFirestore,
    downloadFirestoreDataToLocal,
    syncSubscriptionToFirestore,
    syncUserSettingsToFirestore,
    deleteSubscriptionFromFirestore,
} from '../services/syncService';
import { calculateNextBillingDate } from '../utils/dateHelper';

type DatabaseContextType = {
    database: Database | null;
    subscriptions: Subscription[];
    settings: UserSettings | null;
    loading: boolean;
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncTime: Date | null;
    refreshData: () => Promise<void>;
    addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateSubscription: (id: number, updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
    deleteSubscription: (id: number) => Promise<void>;
    updateSettings: (updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
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
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [needsSync, setNeedsSync] = useState(false);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dailySyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

    // 網路狀態監聽
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            const online = state.isConnected === true;
            setIsOnline(online);

            // 當網路恢復且有待同步資料時,觸發自動同步
            if (online && needsSync && isAuthenticated && user) {
                scheduleAutoSync();
            }
        });

        return () => unsubscribe();
    }, [needsSync, isAuthenticated, user]);

    // 每日定時同步 (每天 00:00)
    useEffect(() => {
        if (!isAuthenticated || !user) return;

        const scheduleDailySync = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const msUntilMidnight = tomorrow.getTime() - now.getTime();

            // 設定在午夜執行同步
            dailySyncIntervalRef.current = setTimeout(() => {
                if (isOnline && isAuthenticated && user) {
                    autoSync();
                }
                // 設定下一次同步
                scheduleDailySync();
            }, msUntilMidnight);
        };

        scheduleDailySync();

        return () => {
            if (dailySyncIntervalRef.current) {
                clearTimeout(dailySyncIntervalRef.current);
            }
        };
    }, [isAuthenticated, user, isOnline]);

    // 自動同步函式 (防抖 2 秒)
    const scheduleAutoSync = () => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            autoSync();
        }, 2000);
    };

    // 執行自動同步
    const autoSync = async () => {
        if (!isAuthenticated || !user || !database || isSyncing) return;

        try {
            setIsSyncing(true);
            await uploadLocalDataToFirestore(user.uid, subscriptions, settings!);
            setNeedsSync(false);
            setLastSyncTime(new Date());
            console.log('自動同步成功');
        } catch (error) {
            console.error('自動同步失敗:', error);
            // 保持 needsSync 狀態,稍後重試
        } finally {
            setIsSyncing(false);
        }
    };

    // 當使用者登入時，同步雲端資料
    useEffect(() => {
        if (isAuthenticated && user && database) {
            syncFromCloud();
        }
    }, [isAuthenticated, user, database]);

    // 載入本地資料
    async function loadLocalData(dbInstance: Database) {
        try {
            const [subs, sets] = await Promise.all([
                db.getAllSubscriptions(dbInstance),
                db.getUserSettings(dbInstance),
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

    // 新增訂閱
    async function addSubscription(
        subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
    ) {
        if (!database) throw new Error('Database not initialized');

        // Ensure nextBillingDate is present and correctly calculated
        const calculatedNextBillingDate = calculateNextBillingDate(
            subscription.startDate,
            subscription.billingCycle
        );

        const subData = {
            ...subscription,
            nextBillingDate: subscription.nextBillingDate || calculatedNextBillingDate
        };

        const id = await db.addSubscription(database, subData);

        // 如果已登入，同步到雲端
        if (isAuthenticated && user) {
            // 重新讀取以確保取得最新的完整資料 (包含 DB 產生的欄位)
            const allSubs = await db.getAllSubscriptions(database);
            const newSub = allSubs.find(s => s.id === id);
            if (newSub) {
                await syncSubscriptionToFirestore(user.uid, newSub);
            }
        }

        await refreshData();
        setNeedsSync(true); // 標記需要同步

        // 如果在線,觸發自動同步
        if (isOnline && isAuthenticated && user) {
            scheduleAutoSync();
        }
    }

    // 更新訂閱
    async function updateSubscription(
        id: number,
        updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>
    ) {
        if (!database) throw new Error('Database not initialized');

        // Check if we need to recalculate nextBillingDate
        let finalUpdates = { ...updates };
        if (updates.startDate || updates.billingCycle) {
            const currentSub = subscriptions.find(s => s.id === id);
            if (currentSub) {
                const startDate = updates.startDate || currentSub.startDate;
                const cycle = updates.billingCycle || currentSub.billingCycle;
                finalUpdates.nextBillingDate = calculateNextBillingDate(startDate, cycle);
            }
        }

        await db.updateSubscription(database, id, finalUpdates);

        // 如果已登入，同步到雲端
        if (isAuthenticated && user) {
            // 取得最新資料以同步
            const allSubs = await db.getAllSubscriptions(database);
            const updatedSub = allSubs.find(s => s.id === id);
            if (updatedSub) {
                await syncSubscriptionToFirestore(user.uid, updatedSub);
            }
        }

        await refreshData();
        setNeedsSync(true); // 標記需要同步

        // 如果在線,觸發自動同步
        if (isOnline && isAuthenticated && user) {
            scheduleAutoSync();
        }
    }

    // 刪除訂閱
    async function deleteSubscription(id: number) {
        if (!database) throw new Error('Database not initialized');

        await db.deleteSubscription(database, id);

        // 如果已登入，從雲端刪除
        if (isAuthenticated && user) {
            await deleteSubscriptionFromFirestore(user.uid, id);
        }

        await refreshData();
        setNeedsSync(true); // 標記需要同步

        // 如果在線,觸發自動同步
        if (isOnline && isAuthenticated && user) {
            scheduleAutoSync();
        }
    }

    // 更新設定
    async function updateSettings(
        updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>
    ) {
        if (!database) throw new Error('Database not initialized');

        await db.updateUserSettings(database, updates);

        // 如果已登入，同步到雲端
        if (isAuthenticated && user) {
            const newSettings = await db.getUserSettings(database);
            if (newSettings) {
                await syncUserSettingsToFirestore(user.uid, newSettings);
            }
        }

        await refreshData();
        setNeedsSync(true); // 標記需要同步

        // 如果在線,觸發自動同步
        if (isOnline && isAuthenticated && user) {
            scheduleAutoSync();
        }
    }

    // 同步到雲端
    async function syncToCloud() {
        if (!isAuthenticated || !user || !database) {
            throw new Error('User not authenticated');
        }

        try {
            await uploadLocalDataToFirestore(user.uid, subscriptions, settings!);
        } catch (error) {
            console.error('Failed to sync to cloud:', error);
            throw error;
        }
    }

    // 從雲端同步
    async function syncFromCloud() {
        if (!isAuthenticated || !user || !database) {
            throw new Error('User not authenticated');
        }

        try {
            const cloudData = await downloadFirestoreDataToLocal(user.uid);

            // 更新本地資料庫
            // 這裡可以實作更複雜的合併邏輯
            setSubscriptions(cloudData.subscriptions);
            if (cloudData.settings) {
                setSettings(cloudData.settings);
            }
        } catch (error) {
            console.error('Failed to sync from cloud:', error);
            throw error;
        }
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

    return (
        <DatabaseContext.Provider value={value}>
            {children}
        </DatabaseContext.Provider>
    );
}

export function useDatabase() {
    const context = useContext(DatabaseContext);
    if (context === undefined) {
        throw new Error('useDatabase must be used within a DatabaseProvider');
    }
    return context;
}
