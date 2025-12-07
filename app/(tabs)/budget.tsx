import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useDatabase } from '../../src/context/DatabaseContext';
import { BudgetChart, CategoryBreakdown, CategoryTabs } from '../../src/components';
import { SubscriptionCategory } from '../../src/types';

export default function BudgetScreen() {
    const { colors } = useTheme();
    const { subscriptions, settings } = useDatabase();
    const [chartType, setChartType] = useState<'category' | 'timeline'>('timeline');
    const [selectedCategory, setSelectedCategory] = useState<'all' | SubscriptionCategory>('all');

    const mainCurrency = settings?.mainCurrency || 'TWD';
    const exchangeRates = settings?.exchangeRates
        ? JSON.parse(settings.exchangeRates)
        : {};

    // 篩選訂閱資料
    const filteredSubscriptions = selectedCategory === 'all'
        ? subscriptions
        : subscriptions.filter(sub => sub.category === selectedCategory);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>預算追蹤</Text>
            </View>

            <ScrollView style={styles.content}>

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
                            趨勢統計
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

                {/* 分類篩選 (僅在統計圖模式且非圓餅圖時顯示，或是都顯示？使用者需求是「可以選不同分類的統計表」，所以應該都要顯示) */}
                {/* 實際上圓餅圖本身就是分類占比，篩選後圓餅圖只會剩下一個顏色，有點怪，但邏輯上正確 */}
                {/* 為了使用者體驗，我們可以讓圓餅圖模式隱藏篩選器，或者讓篩選器只作用於長條圖 */}
                {/* 根據需求：「訂閱明細會按照選擇的表顯示不同分類」，這意味著篩選器應該是全域的 */}
                <CategoryTabs
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {/* 圖表 */}
                <BudgetChart
                    subscriptions={filteredSubscriptions}
                    chartType={chartType}
                    selectedCategory={selectedCategory}
                    currency={mainCurrency}
                    exchangeRates={exchangeRates}
                />

                {/* 分類明細 */}
                <CategoryBreakdown
                    subscriptions={filteredSubscriptions}
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
