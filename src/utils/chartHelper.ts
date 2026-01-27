/**
 * 圖表資料處理工具
 */

import { Subscription, SubscriptionCategory } from '../types';
import { convertCurrency } from './currencyHelper';
import { getDateRange } from './dateHelper';
import i18n from '../i18n';
import { t } from '../i18n/utils';

// 圖表資料點
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  breakdown?: { color: string; value: number }[];
}

// 分類顏色對應
export const CATEGORY_COLORS: { [key in SubscriptionCategory]: string } = {
  entertainment: '#ef4444', // 紅色
  productivity: '#3b82f6', // 藍色
  lifestyle: '#10b981', // 綠色
  other: '#eab308', // 黃色
};

// 取得分類名稱
export function getCategoryName(category: SubscriptionCategory): string {
  const names: { [key in SubscriptionCategory]: string } = {
    entertainment: t('categories.entertainment'),
    productivity: t('categories.productivity'),
    lifestyle: t('categories.lifestyle'),
    other: t('categories.other'),
  };
  return names[category] || t('categories.other');
}

// 計算訂閱的月費用
export function getMonthlyAmount(subscription: Subscription): number {
  if (subscription.billingCycle === 'monthly') {
    return subscription.price;
  } else {
    return subscription.price / 12;
  }
}

// 計算訂閱的年費用
export function getYearlyAmount(subscription: Subscription): number {
  if (subscription.billingCycle === 'yearly') {
    return subscription.price;
  } else {
    return subscription.price * 12;
  }
}

// 按分類統計 (圓餅圖資料)
export function getStatsByCategory(
  subscriptions: Subscription[],
  targetCurrency: string = 'TWD',
  exchangeRates: { [key: string]: number },
): ChartDataPoint[] {
  const categoryTotals: { [key in SubscriptionCategory]?: number } = {};

  subscriptions.forEach((sub) => {
    const monthlyAmount = getMonthlyAmount(sub);
    const converted = convertCurrency(monthlyAmount, sub.currency, targetCurrency, exchangeRates);

    if (!categoryTotals[sub.category]) {
      categoryTotals[sub.category] = 0;
    }
    categoryTotals[sub.category]! += converted;
  });

  return Object.entries(categoryTotals).map(([category, value]) => ({
    label: getCategoryName(category as SubscriptionCategory),
    value: value || 0,
    color: CATEGORY_COLORS[category as SubscriptionCategory],
  }));
}

// 按應用程式統計 (列表資料)
export function getStatsByApp(
  subscriptions: Subscription[],
  targetCurrency: string = 'TWD',
  exchangeRates: { [key: string]: number },
): Array<{
  name: string;
  icon: string;
  category: string;
  monthlyAmount: number;
  yearlyAmount: number;
  percentage: number;
}> {
  // 計算總月支出
  const totalMonthly = subscriptions.reduce((sum, sub) => {
    const monthlyAmount = getMonthlyAmount(sub);
    const converted = convertCurrency(monthlyAmount, sub.currency, targetCurrency, exchangeRates);
    return sum + converted;
  }, 0);

  return subscriptions
    .map((sub) => {
      const monthlyAmount = getMonthlyAmount(sub);
      const converted = convertCurrency(monthlyAmount, sub.currency, targetCurrency, exchangeRates);

      return {
        name: sub.name,
        icon: sub.icon,
        category: getCategoryName(sub.category),
        monthlyAmount: converted,
        yearlyAmount: converted * 12,
        percentage: totalMonthly > 0 ? (converted / totalMonthly) * 100 : 0,
      };
    })
    .sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

// 按時間範圍統計 (長條圖資料 - 僅供測試或舊有功能參考，已由 getExpenseStatistics 取代顯示)
export function getStatsByTimeRange(
  subscriptions: Subscription[],
  rangeType: 'week' | 'month' | 'year',
  targetCurrency: string = 'TWD',
  exchangeRates: { [key: string]: number },
): ChartDataPoint[] {
  const range = getDateRange(rangeType);

  if (rangeType === 'week') {
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(range.start);
      date.setDate(date.getDate() + index);

      // 計算當天到期的訂閱
      const dayTotal = subscriptions
        .filter((sub) => {
          const billingDate = new Date(sub.nextBillingDate);
          return billingDate.toDateString() === date.toDateString();
        })
        .reduce((sum, sub) => {
          const converted = convertCurrency(sub.price, sub.currency, targetCurrency, exchangeRates);
          return sum + converted;
        }, 0);

      const dayLabel = date.toLocaleDateString(i18n.locale, { weekday: 'short' });

      return {
        label: dayLabel,
        value: dayTotal,
      };
    });
  } else if (rangeType === 'month') {
    const weeks = Array.from({ length: 4 }).map((_, i) => t('chart.weekPattern', { week: i + 1 }));
    return weeks.map((week, index) => {
      const weekStart = new Date(range.start);
      weekStart.setDate(weekStart.getDate() + index * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekTotal = subscriptions
        .filter((sub) => {
          const billingDate = new Date(sub.nextBillingDate);
          return billingDate >= weekStart && billingDate <= weekEnd;
        })
        .reduce((sum, sub) => {
          const converted = convertCurrency(sub.price, sub.currency, targetCurrency, exchangeRates);
          return sum + converted;
        }, 0);

      return {
        label: week,
        value: weekTotal,
      };
    });
  } else {
    // Month range
    return Array.from({ length: 12 }).map((_, index) => {
      const monthStart = new Date(range.start.getFullYear(), index, 1);
      const monthEnd = new Date(range.start.getFullYear(), index + 1, 0);

      const monthTotal = subscriptions
        .filter((sub) => {
          const billingDate = new Date(sub.nextBillingDate);
          return billingDate >= monthStart && billingDate <= monthEnd;
        })
        .reduce((sum, sub) => {
          const converted = convertCurrency(sub.price, sub.currency, targetCurrency, exchangeRates);
          return sum + converted;
        }, 0);

      const monthLabel = monthStart.toLocaleDateString(i18n.locale, { month: 'short' });

      return {
        label: monthLabel,
        value: monthTotal,
      };
    });
  }
}

// 計算總支出摘要
export function getTotalSummary(
  subscriptions: Subscription[],
  targetCurrency: string = 'TWD',
  exchangeRates: { [key: string]: number },
): {
  monthly: number;
  yearly: number;
  count: number;
  avgMonthly: number;
} {
  const monthly = subscriptions.reduce((sum, sub) => {
    const monthlyAmount = getMonthlyAmount(sub);
    const converted = convertCurrency(monthlyAmount, sub.currency, targetCurrency, exchangeRates);
    return sum + converted;
  }, 0);

  return {
    monthly,
    yearly: monthly * 12,
    count: subscriptions.length,
    avgMonthly: subscriptions.length > 0 ? monthly / subscriptions.length : 0,
  };
}

// 取得費用統計 (每週/每月/每年)，包含分類佔比 breakdown
export function getExpenseStatistics(
  subscriptions: Subscription[],
  targetCurrency: string = 'TWD',
  exchangeRates: { [key: string]: number },
): ChartDataPoint[] {
  // 計算各分類的月費
  const categoryMonthlyTotals: { [key: string]: number } = {};
  let totalMonthly = 0;

  subscriptions.forEach((sub) => {
    const monthlyAmount = getMonthlyAmount(sub);
    const converted = convertCurrency(monthlyAmount, sub.currency, targetCurrency, exchangeRates);

    if (!categoryMonthlyTotals[sub.category]) {
      categoryMonthlyTotals[sub.category] = 0;
    }
    categoryMonthlyTotals[sub.category] += converted;
    totalMonthly += converted;
  });

  const totalYearly = totalMonthly * 12;
  const totalWeekly = totalYearly / 52;

  // 建構 breakdown 資料
  const getBreakdown = (multiplier: number) => {
    return (
      Object.entries(categoryMonthlyTotals)
        .map(([category, value]) => ({
          color: CATEGORY_COLORS[category as SubscriptionCategory] || '#eab308',
          value: value * multiplier,
        }))
        // 排序: 值大的在下(堆疊圖通常由下往上)，或值大的在前(由左往右/由上往下)?
        // 為了視覺一致性，通常排序一下比較好看
        .sort((a, b) => b.value - a.value)
    );
  };

  return [
    {
      label: t('cycles.weekly'),
      value: totalWeekly,
      color: '#3b82f6',
      breakdown: getBreakdown(12 / 52),
    },
    {
      label: t('cycles.monthly'),
      value: totalMonthly,
      color: '#10b981',
      breakdown: getBreakdown(1),
    },
    {
      label: t('cycles.yearly'),
      value: totalYearly,
      color: '#f59e0b',
      breakdown: getBreakdown(12),
    },
  ];
}
