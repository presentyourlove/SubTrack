import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Subscription, SubscriptionCategory } from '../../types';
import { getStatsByCategory, getExpenseStatistics } from '../../utils/chartHelper';
import i18n from '../../i18n';
import { SkiaPieChart, SkiaChartData } from './charts/SkiaPieChart';
import { SkiaBarChart, SkiaBarDataPoint } from './charts/SkiaBarChart';
import { useSkiaWeb } from '../../hooks/useSkiaWeb';

type BudgetChartProps = {
  subscriptions: Subscription[];
  chartType: 'category' | 'timeline';
  selectedCategory?: 'all' | SubscriptionCategory;
  currency: string;
  exchangeRates: { [key: string]: number };
};

export default function BudgetChart({
  subscriptions,
  chartType,
  selectedCategory: _selectedCategory = 'all',
  currency,
  exchangeRates,
}: BudgetChartProps) {
  const { colors } = useTheme();
  // Ensure Skia is loaded before rendering charts to prevent crash on Web
  const { ready: skiaReady, error: skiaError } = useSkiaWeb();

  if (!skiaReady) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
          },
        ]}
      >
        <Text style={{ color: colors.text }}>
          {skiaError ? 'Failed to load chart engine.' : 'Loading charts...'}
        </Text>
      </View>
    );
  }

  // 取得圖表資料
  const rawData =
    chartType === 'category'
      ? getStatsByCategory(subscriptions, currency, exchangeRates)
      : getExpenseStatistics(subscriptions, currency, exchangeRates);

  if (chartType === 'category') {
    // Transform to SkiaPieChart format
    const pieData: SkiaChartData[] = rawData.map((d) => ({
      label: d.label,
      value: d.value,
      color: d.color || colors.accent,
    }));

    // Calculate details for legend
    const total = pieData.reduce((sum, d) => sum + d.value, 0);

    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{i18n.t('chart.categoryTitle')}</Text>

        <View style={styles.contentRow}>
          <SkiaPieChart data={pieData} size={160} innerRadius={60} />

          {/* Custom Legend */}
          <View style={styles.legendContainer}>
            {pieData.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              return (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <View>
                    <Text style={[styles.legendLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.legendValue, { color: colors.subtleText }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  // Bar Chart
  const barData: SkiaBarDataPoint[] = rawData.map((d) => ({
    label: d.label,
    value: d.value,
    color: d.color,
    breakdown: d.breakdown,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t('chart.expenseTitle')}</Text>
      <View style={{ height: 240, width: '100%' }}>
        <SkiaBarChart data={barData} height={240} showLabels={true} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 20,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 12,
  },
});
