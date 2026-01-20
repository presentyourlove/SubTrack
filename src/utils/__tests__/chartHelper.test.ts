import {
  getCategoryName,
  getMonthlyAmount,
  getYearlyAmount,
  getStatsByCategory,
  getStatsByApp,
  getStatsByTimeRange,
  getTotalSummary,
  getExpenseStatistics,
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

    it('divides non-monthly price by 12', () => {
      const quarterly = { ...mockSubscription, billingCycle: 'quarterly' as const, price: 300 };
      expect(getMonthlyAmount(quarterly)).toBe(25);
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

  describe('getStatsByApp', () => {
    const subscriptions: Subscription[] = [
      { ...mockSubscription, name: 'Netflix', price: 100 },
      { ...mockSubscription, id: 2, name: 'Spotify', price: 200, category: 'entertainment' },
    ];

    it('returns stats for each subscription', () => {
      const result = getStatsByApp(subscriptions, 'TWD', { TWD: 1 });
      expect(result.length).toBe(2);
    });

    it('includes name, icon, monthlyAmount, yearlyAmount', () => {
      const result = getStatsByApp(subscriptions, 'TWD', { TWD: 1 });
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('icon');
      expect(result[0]).toHaveProperty('monthlyAmount');
      expect(result[0]).toHaveProperty('yearlyAmount');
      expect(result[0]).toHaveProperty('percentage');
    });

    it('calculates correct percentage', () => {
      const result = getStatsByApp(subscriptions, 'TWD', { TWD: 1 });
      const totalPercentage = result.reduce((sum, r) => sum + r.percentage, 0);
      expect(Math.round(totalPercentage)).toBe(100);
    });
  });

  describe('getStatsByTimeRange', () => {
    const subscriptions: Subscription[] = [
      { ...mockSubscription, price: 100 },
      { ...mockSubscription, id: 2, price: 200 },
    ];

    it('returns weekly stats', () => {
      const result = getStatsByTimeRange(subscriptions, 'week', 'TWD', { TWD: 1 });
      expect(result.length).toBe(7); // 7 days
    });

    it('returns monthly stats', () => {
      const result = getStatsByTimeRange(subscriptions, 'month', 'TWD', { TWD: 1 });
      expect(result.length).toBeGreaterThanOrEqual(4); // 4-5 weeks
    });

    it('returns yearly stats', () => {
      const result = getStatsByTimeRange(subscriptions, 'year', 'TWD', { TWD: 1 });
      expect(result.length).toBe(12); // 12 months
    });

    it('returns chart data points', () => {
      const result = getStatsByTimeRange(subscriptions, 'week', 'TWD', { TWD: 1 });
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('value');
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

    it('handles empty subscription array', () => {
      const result = getTotalSummary([], 'TWD', { TWD: 1 });
      expect(result.monthly).toBe(0);
      expect(result.yearly).toBe(0);
      expect(result.count).toBe(0);
      expect(result.avgMonthly).toBe(0);
    });
  });

  describe('getExpenseStatistics', () => {
    const subscriptions: Subscription[] = [
      { ...mockSubscription, price: 100, category: 'entertainment' },
      { ...mockSubscription, id: 2, price: 200, category: 'productivity' },
    ];

    it('returns 3 time range entries (weekly, monthly, yearly)', () => {
      const result = getExpenseStatistics(subscriptions, 'TWD', { TWD: 1 });
      expect(result.length).toBe(3);
    });

    it('includes breakdown for each time range', () => {
      const result = getExpenseStatistics(subscriptions, 'TWD', { TWD: 1 });
      expect(result[0]).toHaveProperty('breakdown');
      expect(Array.isArray(result[0].breakdown)).toBe(true);
    });

    it('calculates correct values for different time ranges', () => {
      const result = getExpenseStatistics(subscriptions, 'TWD', { TWD: 1 });
      const weekly = result[0];
      const monthly = result[1];
      const yearly = result[2];

      // Monthly should be higher than weekly
      expect(monthly.value).toBeGreaterThan(weekly.value);
      // Yearly should be higher than monthly
      expect(yearly.value).toBeGreaterThan(monthly.value);
    });
  });
});
