import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useDatabase } from '../../src/context/DatabaseContext';
import { BudgetChart, CategoryBreakdown } from '../../src/components';

type TimeRange = 'week' | 'month' | 'year';

export default function BudgetScreen() {
    const { colors } = useTheme();
    const { subscriptions, settings } = useDatabase();
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [chartType, setChartType] = useState<'category' | 'timeline'>('timeline');

    const mainCurrency = settings?.mainCurrency || 'TWD';
    const exchangeRates = settings?.exchangeRates
        ? JSON.parse(settings.exchangeRates)
        : {};

    const timeRanges: { value: TimeRange; label: string }[] = [
        { value: 'week', label: '週' },
        { value: 'month', label: '月' },
        { value: 'year', label: '年' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>預算追蹤</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* 時間範圍切換 */}
                <View style={styles.timeRangeContainer}>
                    {timeRanges.map((range) => (
                        <TouchableOpacity
                            key={range.value}
                            style={[
                                styles.timeRangeButton,
                                { backgroundColor: colors.card, borderColor: colors.borderColor },
                                timeRange === range.value && {
                                    backgroundColor: colors.accent,
                                    borderColor: colors.accent,
                                },
                            ]}
                            onPress={() => setTimeRange(range.value)}
                        >
                            <Text
                                style={[
                                    styles.timeRangeText,
                                    { color: colors.text },
                                    timeRange === range.value && { color: '#ffffff' },
                                ]}
                            >
                                {range.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 圖表類型切換 */}
                <View style={styles.chartTypeContainer}>
                    <TouchableOpacity
                        style={[
                            styles.chartTypeButton,
                            { backgroundColor: colors.card, borderColor: colors.borderColor },
                            chartType === 'timeline' && {
                                backgroundColor: colors.accent,
                                borderColor: colors.accent,
                            },
                        ]}
                        onPress={() => setChartType('timeline')}
                    >
                        <Text
                            style={[
                                styles.chartTypeText,
                                { color: colors.text },
                                chartType === 'timeline' && { color: '#ffffff' },
                            ]}
                        >
                            趨勢圖
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.chartTypeButton,
                            { backgroundColor: colors.card, borderColor: colors.borderColor },
                            chartType === 'category' && {
                                backgroundColor: colors.accent,
                                borderColor: colors.accent,
                            },
                        ]}
                        onPress={() => setChartType('category')}
                    >
                        <Text
                            style={[
                                styles.chartTypeText,
                                { color: colors.text },
                                chartType === 'category' && { color: '#ffffff' },
                            ]}
                        >
                            分類占比
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* 圖表 */}
                <BudgetChart
                    subscriptions={subscriptions}
                    chartType={chartType}
                    timeRange={timeRange}
                    currency={mainCurrency}
                    exchangeRates={exchangeRates}
                />

                {/* 分類明細 */}
                <CategoryBreakdown
                    subscriptions={subscriptions}
                    currency={mainCurrency}
                    exchangeRates={exchangeRates}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    timeRangeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    timeRangeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    timeRangeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    chartTypeContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    chartTypeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    chartTypeText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
