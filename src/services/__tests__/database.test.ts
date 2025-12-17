/**
 * Database Service Tests
 *
 * 測試 database.ts 的所有 CRUD 操作和統計查詢功能
 * 使用簡化的 mock 策略以避免 Expo 54 測試環境問題
 */

import type { Subscription } from '../../types';

describe('Database Service', () => {
  // Mock 資料庫物件
  let mockDb: MockDatabase;
  let dbModule: typeof import('../database');

  beforeAll(() => {
    // 設置 expo-sqlite mock
    jest.doMock('expo-sqlite', () => ({
      openDatabaseAsync: jest.fn(),
    }));
  });

  beforeEach(async () => {
    // 重置 mock
    jest.clearAllMocks();

    // 建立 mock 資料庫物件
    mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
      getAllAsync: jest.fn().mockResolvedValue([]),
      getFirstAsync: jest.fn().mockResolvedValue(null),
    };

    // Mock openDatabaseAsync
    const expoSqlite = await import('expo-sqlite');
    expoSqlite.openDatabaseAsync = jest.fn().mockResolvedValue(mockDb);

    // 動態載入 database 模組
    jest.resetModules();
    dbModule = await import('../database');
  });

  describe('initDatabase', () => {
    it('should initialize database successfully', async () => {
      const db = await dbModule.initDatabase();

      expect(db).toBeDefined();
      expect(mockDb.execAsync).toHaveBeenCalled();
    });

    it('should create subscriptions table', async () => {
      await dbModule.initDatabase();

      const calls = mockDb.execAsync.mock.calls;
      const createTableCall = calls.find((call: unknown[]) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS subscriptions'),
      );

      expect(createTableCall).toBeDefined();
    });

    it('should create user_settings table', async () => {
      await dbModule.initDatabase();

      const calls = mockDb.execAsync.mock.calls;
      const createTableCall = calls.find((call: unknown[]) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS user_settings'),
      );

      expect(createTableCall).toBeDefined();
    });
  });

  describe('getAllSubscriptions', () => {
    it('should return all subscriptions', async () => {
      const mockSubscriptions: Subscription[] = [
        {
          id: 1,
          name: 'Netflix',
          icon: '📺',
          category: 'entertainment',
          price: 390,
          currency: 'TWD',
          billingCycle: 'monthly',
          startDate: '2024-01-01',
          nextBillingDate: '2024-02-01',
          reminderEnabled: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      mockDb.getAllAsync.mockResolvedValueOnce(mockSubscriptions);

      const result = await dbModule.getAllSubscriptions(mockDb);

      expect(result).toEqual(mockSubscriptions);
      expect(mockDb.getAllAsync).toHaveBeenCalled();
    });

    it('should return empty array when no subscriptions', async () => {
      mockDb.getAllAsync.mockResolvedValueOnce([]);

      const result = await dbModule.getAllSubscriptions(mockDb);

      expect(result).toEqual([]);
    });
  });

  describe('addSubscription', () => {
    it('should add subscription successfully', async () => {
      const newSubscription = {
        name: 'Spotify',
        icon: '🎵',
        category: 'entertainment' as const,
        price: 149,
        currency: 'TWD',
        billingCycle: 'monthly' as const,
        startDate: '2024-01-15',
        nextBillingDate: '2024-02-15',
        reminderEnabled: false,
      };

      mockDb.runAsync.mockResolvedValueOnce({ lastInsertRowId: 2 });

      const id = await dbModule.addSubscription(mockDb, newSubscription);

      expect(id).toBe(2);
      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('updateSubscription', () => {
    it('should update subscription successfully', async () => {
      const updates = {
        price: 199,
      };

      await dbModule.updateSubscription(mockDb, 1, updates);

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('deleteSubscription', () => {
    it('should delete subscription by id', async () => {
      await dbModule.deleteSubscription(mockDb, 1);

      expect(mockDb.runAsync).toHaveBeenCalledWith('DELETE FROM subscriptions WHERE id = ?', [1]);
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings', async () => {
      const mockSettings = {
        id: 1,
        mainCurrency: 'TWD',
        exchangeRates: '{}',
        theme: 'auto',
        notificationsEnabled: true,
        defaultReminderTime: '09:00',
        defaultReminderDays: 1,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockDb.getFirstAsync.mockResolvedValueOnce(mockSettings);

      const result = await dbModule.getUserSettings(mockDb);

      expect(result).toEqual(mockSettings);
    });

    it('should return null when no settings exist', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce(null);

      const result = await dbModule.getUserSettings(mockDb);

      expect(result).toBeNull();
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      const updates = {
        mainCurrency: 'USD',
        theme: 'dark',
      };

      await dbModule.updateUserSettings(mockDb, updates);

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe('getMonthlyTotal', () => {
    it('should calculate monthly total correctly', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ total: 1500 });

      const result = await dbModule.getMonthlyTotal(mockDb, 'TWD');

      expect(result).toBe(1500);
    });

    it('should return 0 when no subscriptions', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ total: null });

      const result = await dbModule.getMonthlyTotal(mockDb);

      expect(result).toBe(0);
    });
  });

  describe('getYearlyTotal', () => {
    it('should calculate yearly total correctly', async () => {
      mockDb.getFirstAsync.mockResolvedValueOnce({ total: 18000 });

      const result = await dbModule.getYearlyTotal(mockDb, 'TWD');

      expect(result).toBe(18000);
    });
  });

  describe('getUpcomingSubscriptions', () => {
    it('should return subscriptions due within N days', async () => {
      const mockUpcoming: Subscription[] = [
        {
          id: 1,
          name: 'Netflix',
          icon: '📺',
          category: 'entertainment',
          price: 390,
          currency: 'TWD',
          billingCycle: 'monthly',
          startDate: '2024-01-01',
          nextBillingDate: '2024-12-20',
          reminderEnabled: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      mockDb.getAllAsync.mockResolvedValueOnce(mockUpcoming);

      const result = await dbModule.getUpcomingSubscriptions(mockDb, 7);

      expect(result).toEqual(mockUpcoming);
    });
  });
});
