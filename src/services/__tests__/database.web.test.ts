import {
  initDatabase,
  addSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
  clearAllData,
  getUserSettings,
  updateUserSettings,
  getMonthlyTotal,
  getUpcomingSubscriptions,
  WebDatabase,
} from '../database.web';
import { Subscription } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    // For test inspection
    _getStore: () => store,
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Web Database Service', () => {
  let db: WebDatabase;

  beforeEach(async () => {
    localStorageMock.clear();
    db = await initDatabase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default settings and empty subscriptions', async () => {
      const settings = await getUserSettings(db);
      const subscriptions = await getAllSubscriptions(db);

      expect(settings).not.toBeNull();
      expect(settings?.mainCurrency).toBe('TWD');
      expect(subscriptions).toEqual([]);
    });

    it('should not overwrite existing data on re-init', async () => {
      const sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Sub',
        price: 100,
        currency: 'TWD',
        billingCycle: 'monthly',
        category: 'entertainment',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as Subscription; // Cast for missing optional props in test

      await addSubscription(db, sub);

      // Re-init
      await initDatabase();
      const subscriptions = await getAllSubscriptions(db);

      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0].name).toBe('Test Sub');
    });
  });

  describe('Subscription CRUD', () => {
    it('should add a subscription correctly', async () => {
      const sub: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'entertainment',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as Subscription;

      const id = await addSubscription(db, sub);
      expect(id).toBe(1);

      const subscriptions = await getAllSubscriptions(db);
      expect(subscriptions.length).toBe(1);
      expect(subscriptions[0].name).toBe('Netflix');
      expect(subscriptions[0].id).toBe(1);
    });

    it('should update a subscription', async () => {
      const sub = {
        name: 'Spotify',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly' as const,
        category: 'music',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as unknown as Subscription;
      const id = await addSubscription(db, sub);

      await updateSubscription(db, id, { price: 12.99 });

      const subscriptions = await getAllSubscriptions(db);
      expect(subscriptions[0].price).toBe(12.99);
      expect(subscriptions[0].name).toBe('Spotify');
    });

    it('should throw error when updating non-existent subscription', async () => {
      await expect(updateSubscription(db, 999, { price: 10 })).rejects.toThrow();
    });

    it('should delete a subscription', async () => {
      const sub = {
        name: 'Gym',
        price: 50,
        currency: 'USD',
        billingCycle: 'monthly' as const,
        category: 'health',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as unknown as Subscription;
      const id = await addSubscription(db, sub);

      await deleteSubscription(db, id);

      const subscriptions = await getAllSubscriptions(db);
      expect(subscriptions.length).toBe(0);
    });

    it('should throw error when deleting non-existent subscription', async () => {
      await expect(deleteSubscription(db, 999)).rejects.toThrow();
    });
  });

  describe('User Settings', () => {
    it('should update user settings', async () => {
      await updateUserSettings(db, { theme: 'light', mainCurrency: 'USD' });

      const settings = await getUserSettings(db);
      expect(settings?.theme).toBe('light');
      expect(settings?.mainCurrency).toBe('USD');
    });

    it('should handle object exchangeRates correctly by stringifying', async () => {
      const rates = { USD: 1, TWD: 30 };
      // @ts-expect-error - testing runtime behavior for object input
      await updateUserSettings(db, { exchangeRates: rates });

      const settings = await getUserSettings(db);
      expect(JSON.parse(settings?.exchangeRates || '{}')).toEqual(rates);
    });
  });

  describe('Statistics', () => {
    it('should calculate monthly total correctly', async () => {
      await addSubscription(db, {
        name: 'Sub 1',
        price: 100,
        currency: 'TWD',
        billingCycle: 'monthly',
        category: 'test',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as unknown as Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>);

      await addSubscription(db, {
        name: 'Sub 2',
        price: 1200,
        currency: 'TWD',
        billingCycle: 'yearly',
        category: 'test',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as unknown as Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>);

      // 100 (monthly) + 1200/12 (yearly to monthly) = 200
      const total = await getMonthlyTotal(db, 'TWD');
      expect(total).toBe(200);
    });

    it('should filter upcoming subscriptions', async () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 5);

      const nextMonth = new Date();
      nextMonth.setDate(today.getDate() + 30);

      await addSubscription(db, {
        name: 'Upcoming',
        price: 100,
        currency: 'TWD',
        billingCycle: 'monthly',
        category: 'test',
        startDate: new Date().toISOString(),
        nextBillingDate: nextWeek.toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as unknown as Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>);

      await addSubscription(db, {
        name: 'Later',
        price: 100,
        currency: 'TWD',
        billingCycle: 'monthly',
        category: 'test',
        startDate: new Date().toISOString(),
        nextBillingDate: nextMonth.toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as unknown as Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>);

      const upcoming = await getUpcomingSubscriptions(db, 7);
      expect(upcoming.length).toBe(1);
      expect(upcoming[0].name).toBe('Upcoming');
    });
  });

  describe('Data Management', () => {
    it('should clear all data', async () => {
      await addSubscription(db, {
        name: 'Sub',
        price: 10,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'test',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date().toISOString(),
        reminderEnabled: false,
        isFamilyPlan: false,
      } as unknown as Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>);

      clearAllData();

      // Manually check store because initDatabase would re-create default settings
      const store = localStorageMock._getStore();
      expect(store).toEqual({});
    });
  });
});
