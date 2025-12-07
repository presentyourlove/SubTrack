import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Subscription } from '../types';
import { getStatsByCategory, getStatsByTimeRange, ChartDataPoint } from '../utils/chartHelper';

type BudgetChartProps = {
    subscriptions: Subscription[];
    chartType: 'category' | 'timeline';
    timeRange?: 'week' | 'month' | 'year';
    currency: string;
    exchangeRates: { [key: string]: number };
};

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;
const CHART_HEIGHT = 200;

export default function BudgetChart({
    subscriptions,
    chartType,
    timeRange = 'month',
    currency,
    exchangeRates,
}: BudgetChartProps) {
    const { colors } = useTheme();

    // 取得圖表資料
    const data =
        chartType === 'category'
            ? getStatsByCategory(subscriptions, currency, exchangeRates)
            : getStatsByTimeRange(subscriptions, timeRange, currency, exchangeRates);

    // 計算最大值用於縮放
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    // 圓餅圖
    if (chartType === 'category') {
        const total = data.reduce((sum, d) => sum + d.value, 0);

        return (
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <Text style={[styles.title, { color: colors.text }]}>分類占比</Text>

                <View style={styles.pieContainer}>
                    {data.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        return (
                            <View key={index} style={styles.pieItem}>
                                <View style={styles.pieRow}>
                                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                    <Text style={[styles.pieLabel, { color: colors.text }]}>
                                        {item.label}
                                    </Text>
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

    // 長條圖
    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>
                {timeRange === 'week' ? '本週' : timeRange === 'month' ? '本月' : '本年'}趨勢
            </Text>

            <View style={styles.barContainer}>
                {data.map((item, index) => {
                    const barHeight = maxValue > 0 ? (item.value / maxValue) * CHART_HEIGHT : 0;
                    return (
                        <View key={index} style={styles.barItem}>
                            <View style={styles.barWrapper}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            backgroundColor: colors.accent,
                                            height: barHeight,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.barLabel, { color: colors.subtleText }]}>
                                {item.label}
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
        height: CHART_HEIGHT + 30,
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
    barLabel: {
        fontSize: 12,
    },
});
