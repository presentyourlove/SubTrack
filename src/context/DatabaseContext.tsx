import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

type DatabaseContextType = {
    database: Database | null;
    subscriptions: Subscription[];
    settings: UserSettings | null;
    loading: boolean;
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

        const id = await db.addSubscription(database, subscription);
        await refreshData();

        // 如果已登入，同步到雲端
        if (isAuthenticated && user) {
            const newSub = subscriptions.find(s => s.id === id);
            if (newSub) {
                await syncSubscriptionToFirestore(user.uid, newSub);
            }
        }
    }

    // 更新訂閱
    async function updateSubscription(
        id: number,
        updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>
    ) {
        if (!database) throw new Error('Database not initialized');

        await db.updateSubscription(database, id, updates);
        await refreshData();

        // 如果已登入，同步到雲端
        if (isAuthenticated && user) {
            const updatedSub = subscriptions.find(s => s.id === id);
            if (updatedSub) {
                await syncSubscriptionToFirestore(user.uid, updatedSub);
            }
        }
    }

    // 刪除訂閱
    async function deleteSubscription(id: number) {
        if (!database) throw new Error('Database not initialized');

        await db.deleteSubscription(database, id);
        await refreshData();

        // 如果已登入，從雲端刪除
        if (isAuthenticated && user) {
            await deleteSubscriptionFromFirestore(user.uid, id);
        }
    }

    // 更新設定
    async function updateSettings(
        updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>
    ) {
        if (!database) throw new Error('Database not initialized');

        await db.updateUserSettings(database, updates);
        await refreshData();

        // 如果已登入，同步到雲端
        if (isAuthenticated && user && settings) {
            await syncUserSettingsToFirestore(user.uid, settings);
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
