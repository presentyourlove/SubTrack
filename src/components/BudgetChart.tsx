import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Subscription, SubscriptionCategory } from '../types';
import { getStatsByCategory, getExpenseStatistics, CATEGORY_COLORS } from '../utils/chartHelper';
import i18n from '../i18n';

type BudgetChartProps = {
  subscriptions: Subscription[];
  chartType: 'category' | 'timeline';
  selectedCategory?: 'all' | SubscriptionCategory;
  currency: string;
  exchangeRates: { [key: string]: number };
};

// const { width } = Dimensions.get('window'); // width unused
const CHART_HEIGHT = 200;
const CHART_LABEL_HEIGHT = 30;
const MIN_CHART_VALUE = 1;

// 移除未使用的介面與常數
export default function BudgetChart({
  subscriptions,
  chartType,
  selectedCategory = 'all',
  currency,
  exchangeRates,
}: BudgetChartProps) {
  const { colors } = useTheme();

  // 取得圖表資料
  const data =
    chartType === 'category'
      ? getStatsByCategory(subscriptions, currency, exchangeRates)
      : getExpenseStatistics(subscriptions, currency, exchangeRates);

  // 計算最大值用於縮放
  const maxValue = Math.max(...data.map((d) => d.value), MIN_CHART_VALUE);

  // 圓餅圖
  if (chartType === 'category') {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{i18n.t('chart.categoryTitle')}</Text>

        <View style={styles.pieContainer}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <View key={index} style={styles.pieItem}>
                <View style={styles.pieRow}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.pieLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.pieValue, { color: colors.text }]}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.pieBar}>
                  <View
                    style={[
                      styles.pieBarFill,
                      { backgroundColor: item.color, width: `${percentage}%` },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // 長條圖 (費用統計)
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t('chart.expenseTitle')}</Text>

      <View style={styles.barContainer}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * CHART_HEIGHT : 0;

          // 決定是否顯示堆疊圖
          const isStacked =
            selectedCategory === 'all' && item.breakdown && item.breakdown.length > 0;

          // 若非堆疊圖，決定單一顏色
          const barColor =
            selectedCategory !== 'all'
              ? CATEGORY_COLORS[selectedCategory] || colors.accent
              : item.color || colors.accent;

          return (
            <View key={index} style={styles.barItem}>
              <View style={styles.barWrapper}>
                {isStacked ? (
                  // 堆疊長條圖
                  <View style={[styles.stackedBarContainer, { height: barHeight }]}>
                    {item.breakdown!.map((segment, i) => {
                      const segmentHeight = item.value > 0 ? (segment.value / item.value) * 100 : 0;

                      // 頂部圓角處理: 在堆疊容器中，資料由上層開始繪製 (Flex預設是 top-down)。
                      // 若 FlexDirection 是 column (預設)，第一個子元素在最上面。
                      // 我們的 barWrapper 是 justify-end，所以堆疊 bar (container) 貼底。
                      // Container 內部是 column (預設)，所以第一個 segment 在最上面。
                      const isTop = i === 0;

                      return (
                        <View
                          key={i}
                          style={{
                            backgroundColor: segment.color,
                            height: `${segmentHeight}%`,
                            width: '100%',
                            borderTopLeftRadius: isTop ? 4 : 0,
                            borderTopRightRadius: isTop ? 4 : 0,
                          }}
                        />
                      );
                    })}
                  </View>
                ) : (
                  // 一般長條圖
                  <View
                    style={[
                      styles.bar,
                      {
                        backgroundColor: barColor,
                        height: barHeight,
                      },
                    ]}
                  />
                )}
              </View>
              <Text style={[styles.barLabel, { color: colors.subtleText }]}>{item.label}</Text>
              <Text style={[styles.barValue, { color: colors.text }]}>
                {Math.round(item.value)}
              </Text>
            </View>
          );
        })}
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
  // 圓餅圖樣式
  pieContainer: {
    gap: 12,
  },
  pieItem: {
    gap: 4,
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pieLabel: {
    flex: 1,
    fontSize: 14,
  },
  pieValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  pieBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  pieBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // 長條圖樣式
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + CHART_LABEL_HEIGHT,
  },

  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barWrapper: {
    width: '80%',
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  stackedBarContainer: {
    width: '100%',
    justifyContent: 'flex-start', // 確保從頂部開始堆疊
    // overflow: 'hidden',
  },
  barLabel: {
    fontSize: 12,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
});
