import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';
import { formatCurrency } from '../utils/currencyHelper';
import { convertCurrency } from '../utils/currencyHelper';

export default function SummaryCard() {
    const { colors } = useTheme();
    const { subscriptions, settings } = useDatabase();
    const [monthlyTotal, setMonthlyTotal] = useState(0);
    const [yearlyTotal, setYearlyTotal] = useState(0);

    const mainCurrency = settings?.mainCurrency || 'TWD';
    const exchangeRates = settings?.exchangeRates
        ? JSON.parse(settings.exchangeRates)
        : {};

    // 計算總金額
    useEffect(() => {
        let monthly = 0;

        subscriptions.forEach(sub => {
            // 轉換為主要幣別
            const convertedPrice = convertCurrency(
                sub.price,
                sub.currency,
                mainCurrency,
                exchangeRates
            );

            // 計算月費用
            if (sub.billingCycle === 'monthly') {
                monthly += convertedPrice;
            } else if (sub.billingCycle === 'yearly') {
                monthly += convertedPrice / 12;
            }
        });

        setMonthlyTotal(monthly);
        setYearlyTotal(monthly * 12);
    }, [subscriptions, mainCurrency, exchangeRates]);

    const activeCount = subscriptions.length;

    return (
        <View style={[styles.container, { backgroundColor: colors.accent }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: '#ffffff' }]}>每月總支出</Text>
                <Text style={[styles.amount, { color: '#ffffff' }]}>
                    {formatCurrency(monthlyTotal, mainCurrency)}
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                        活躍訂閱
                    </Text>
                    <Text style={[styles.statValue, { color: '#ffffff' }]}>
                        {activeCount}
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.stat}>
                    <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>
                        預估年支出
                    </Text>
                    <Text style={[styles.statValue, { color: '#ffffff' }]}>
                        {formatCurrency(yearlyTotal, mainCurrency)}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        opacity: 0.9,
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stat: {
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255,255,255,0.3)',
        marginHorizontal: 16,
    },
});
