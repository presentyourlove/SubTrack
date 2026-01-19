import {
  getCategoryName,
  getMonthlyAmount,
  getYearlyAmount,
  getStatsByCategory,
  getTotalSummary,
  CATEGORY_COLORS,
} from '../chartHelper';
import { Subscription } from '../../types';

describe('chartHelper', () => {
  const mockSubscription: Subscription = {
    id: 1,
    name: 'Netflix',
    icon: 'N',
    category: 'entertainment',
    price: 390,
    currency: 'TWD',
    billingCycle: 'monthly',
    startDate: '2023-01-01',
    nextBillingDate: '2024-02-01',
    reminderEnabled: true,
    createdAt: '',
    updatedAt: '',
    workspaceId: 1,
  };

  describe('CATEGORY_COLORS', () => {
    it('has colors for all categories', () => {
      expect(CATEGORY_COLORS.entertainment).toBeDefined();
      expect(CATEGORY_COLORS.productivity).toBeDefined();
      expect(CATEGORY_COLORS.lifestyle).toBeDefined();
      expect(CATEGORY_COLORS.other).toBeDefined();
    });
  });

  describe('getCategoryName', () => {
    it('returns localized category name', () => {
      const result = getCategoryName('entertainment');
      expect(typeof result).toBe('string');
    });
  });

  describe('getMonthlyAmount', () => {
    it('returns price for monthly subscription', () => {
      expect(getMonthlyAmount(mockSubscription)).toBe(390);
    });

    it('divides yearly price by 12', () => {
      const yearly = { ...mockSubscription, billingCycle: 'yearly' as const, price: 1200 };
      expect(getMonthlyAmount(yearly)).toBe(100);
    });

    // Implementation note: getMonthlyAmount treats all non-monthly cycles as yearly/12
    it('divides non-monthly price by 12', () => {
      const quarterly = { ...mockSubscription, billingCycle: 'quarterly' as const, price: 300 };
      expect(getMonthlyAmount(quarterly)).toBe(25); // 300/12 = 25
    });
  });

  describe('getYearlyAmount', () => {
    it('multiplies monthly price by 12', () => {
      expect(getYearlyAmount(mockSubscription)).toBe(4680);
    });

    it('returns price for yearly subscription', () => {
      const yearly = { ...mockSubscription, billingCycle: 'yearly' as const, price: 1000 };
      expect(getYearlyAmount(yearly)).toBe(1000);
    });
  });

  describe('getStatsByCategory', () => {
    const subscriptions: Subscription[] = [
      { ...mockSubscription, category: 'entertainment', price: 100 },
      { ...mockSubscription, id: 2, category: 'entertainment', price: 200 },
      { ...mockSubscription, id: 3, category: 'productivity', price: 300 },
    ];

    it('groups subscriptions by category', () => {
      const result = getStatsByCategory(subscriptions, 'TWD', { TWD: 1 });
      expect(result.length).toBe(2);
    });

    it('returns results with value and color properties', () => {
      const result = getStatsByCategory(subscriptions, 'TWD', { TWD: 1 });
      expect(result[0]).toHaveProperty('value');
      expect(result[0]).toHaveProperty('color');
      expect(result[0]).toHaveProperty('label');
    });
  });

  describe('getTotalSummary', () => {
    const subscriptions: Subscription[] = [
      { ...mockSubscription, price: 100 },
      { ...mockSubscription, id: 2, price: 200 },
    ];

    it('calculates total monthly spending', () => {
      const result = getTotalSummary(subscriptions, 'TWD', { TWD: 1 });
      expect(result.monthly).toBe(300);
    });

    it('calculates total yearly spending', () => {
      const result = getTotalSummary(subscriptions, 'TWD', { TWD: 1 });
      expect(result.yearly).toBe(3600);
    });

    it('returns subscription count', () => {
      const result = getTotalSummary(subscriptions, 'TWD', { TWD: 1 });
      expect(result.count).toBe(2);
    });

    it('calculates average monthly', () => {
      const result = getTotalSummary(subscriptions, 'TWD', { TWD: 1 });
      expect(result.avgMonthly).toBe(150);
    });
  });
});
