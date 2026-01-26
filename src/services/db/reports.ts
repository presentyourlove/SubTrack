import { SQLiteDatabase } from '../database';
import { CustomReport, Subscription } from '../../types';
import { getStatsByCategory } from '../../utils/chartHelper';

// CRUD Operations

export async function createReport(
  db: SQLiteDatabase,
  report: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO custom_reports (title, chartType, dimension, metric, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [report.title, report.chartType, report.dimension, report.metric, now, now],
  );
  return result.lastInsertRowId;
}

export async function getReports(db: SQLiteDatabase): Promise<CustomReport[]> {
  const reports = await db.getAllAsync<CustomReport>(
    'SELECT * FROM custom_reports ORDER BY createdAt DESC',
  );
  return reports;
}

export async function deleteReport(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM custom_reports WHERE id = ?', [id]);
}

// Execution Logic

export type ChartData = {
  label: string;
  value: number;
  color: string;
  breakdown?: ChartData[];
};

export function executeReport(
  report: CustomReport,
  subscriptions: Subscription[],
  currency: string,
  exchangeRates: { [key: string]: number },
): ChartData[] {
  // 1. 維度分組 (Dimension Grouping)
  // 目前 chartHelper 主要支援 Category。
  // 我們需要實作一個更通用的聚合函數。

  // 1. 維度分組 (Dimension Grouping)
  // 如果 dimension 是 category，我們可以使用現有的 getChartByCategory 來取得顏色
  // 但為了統一計數邏輯，我們只從 helper 取得顏色映射，聚合邏輯統一在下方處理。

  const categoryColors: { [key: string]: string } = {};
  if (report.dimension === 'category') {
    const stats = getStatsByCategory(subscriptions, currency, exchangeRates);
    stats.forEach((s) => (categoryColors[s.label] = s.color || '#cccccc'));
  }

  // Custom Aggregation
  const groupedData = new Map<string, { value: number; color: string; count: number }>();

  subscriptions.forEach((sub) => {
    let key = '';
    let color = '#cccccc';

    // Dimension: Tag
    if (report.dimension === 'tag') {
      if (sub.tags && sub.tags.length > 0) {
        // Split subscription value among tags? Or verify duplicates?
        // For simplicity, count for primary tag or create an entry for each tag
        sub.tags.forEach((tag) => {
          addToMap(groupedData, tag.name, tag.color, sub, report.metric, currency, exchangeRates);
        });
        return;
      } else {
        key = 'No Tag';
      }
    }
    // Dimension: Cycle
    else if (report.dimension === 'cycle') {
      key = sub.billingCycle;
      color = getCycleColor(sub.billingCycle);
    }
    // Dimension: Category (fallback manual)
    else {
      key = sub.category;
      color = categoryColors[sub.category] || getCategoryColor(sub.category);
    }

    addToMap(groupedData, key, color, sub, report.metric, currency, exchangeRates);
  });

  // Convert Map to ChartData[]
  const results: ChartData[] = [];
  groupedData.forEach((data: { value: number; color: string; count: number }, key: string) => {
    if (data.value > 0) {
      results.push({
        label: key,
        value: data.value,
        color: data.color,
      });
    }
  });

  return results.sort((a, b) => b.value - a.value);
}

function addToMap(
  map: Map<string, { value: number; color: string; count: number }>,
  key: string,
  color: string,
  sub: Subscription,
  metric: string,
  currency: string,
  exchangeRates: { [key: string]: number },
) {
  const current = map.get(key) || { value: 0, color, count: 0 };

  let addedValue = 0;
  if (metric === 'count') {
    addedValue = 1;
  } else if (metric === 'cost_monthly') {
    addedValue = getMonthlyValue(sub, currency, exchangeRates);
  } else {
    // cost_yearly
    addedValue = getMonthlyValue(sub, currency, exchangeRates) * 12;
  }

  map.set(key, {
    value: current.value + addedValue,
    color: color, // Keep first color found
    count: current.count + 1,
  });
}

function getMonthlyValue(
  sub: Subscription,
  currency: string,
  rates: { [key: string]: number },
): number {
  let price = sub.price;
  if (sub.currency !== currency && rates[sub.currency] && rates[currency]) {
    price = (price / rates[sub.currency]) * rates[currency];
  }
  if (sub.billingCycle === 'yearly') return price / 12;
  if (sub.billingCycle === 'quarterly') return price / 3;
  if (sub.billingCycle === 'weekly') return price * 4;
  return price;
}

function getCycleColor(cycle: string): string {
  switch (cycle) {
    case 'monthly':
      return '#3b82f6';
    case 'yearly':
      return '#10b981';
    case 'weekly':
      return '#f59e0b';
    case 'quarterly':
      return '#8b5cf6';
    default:
      return '#9ca3af';
  }
}

function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    entertainment: '#ef4444',
    productivity: '#3b82f6',
    lifestyle: '#10b981',
    other: '#eab308',
  };
  return colors[category] || '#eab308';
}
