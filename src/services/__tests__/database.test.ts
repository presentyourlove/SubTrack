/**
 * Database Service Tests
 * 測試 database.ts 的 CRUD 與統計查詢邏輯
 */

import { Subscription } from '../../types';
import * as ExpoSQLite from 'expo-sqlite';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

describe('Database Service', () => {
  // Mock 資料庫物件
  const mockDb = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  };

  let dbModule: any;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    (ExpoSQLite.openDatabaseAsync as jest.Mock).mockResolvedValue(mockDb);

    // 使用 require 重新載入模組以確保使用新的 mock
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    dbModule = require('../database');
  });

  describe('initDatabase', () => {
    it('should initialize database successfully', async () => {
      const db = await dbModule.initDatabase();
      expect(db).toBe(mockDb);
    });
  });

  describe('getAllSubscriptions', () => {
    it('should return all subscriptions', async () => {
      const mockSubscriptions: Subscription[] = [
        {
          id: 1,
          name: 'Netflix',
          icon: 'N',
          category: 'entertainment',
          price: 390,
          currency: 'TWD',
          billingCycle: 'monthly',
          startDate: '2024-01-01',
          nextBillingDate: '2024-02-01',
          reminderEnabled: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          isFamilyPlan: false,
          memberCount: 1,
          workspaceId: 1,
          tags: [],
        } as unknown as Subscription,
      ];

      mockDb.getAllAsync.mockResolvedValueOnce(mockSubscriptions);

      const result = await dbModule.getAllSubscriptions(mockDb);

      expect(result).toEqual(mockSubscriptions);
      expect(mockDb.getAllAsync).toHaveBeenCalled();
    });
  });

  describe('addSubscription', () => {
    it('should add subscription successfully', async () => {
      const newSubscription = {
        name: 'Spotify',
        icon: 'S',
        category: 'entertainment' as const,
        price: 149,
        currency: 'TWD',
        billingCycle: 'monthly' as const,
        startDate: '2024-01-15',
        nextBillingDate: '2024-02-15',
        reminderEnabled: false,
        isFamilyPlan: true,
        memberCount: 4,
        workspaceId: 1,
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

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE'),
        expect.arrayContaining([1]),
      );
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
  });
});
