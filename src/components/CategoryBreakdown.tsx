import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Subscription } from '../types';
import { getStatsByApp } from '../utils/chartHelper';
import { formatCurrency } from '../utils/currencyHelper';

type CategoryBreakdownProps = {
    subscriptions: Subscription[];
    currency: string;
    exchangeRates: { [key: string]: number };
};

export default function CategoryBreakdown({
    subscriptions,
    currency,
    exchangeRates,
}: CategoryBreakdownProps) {
    const { colors } = useTheme();

    const stats = getStatsByApp(subscriptions, currency, exchangeRates);

    if (stats.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: colors.card }]}>
                <Text style={[styles.title, { color: colors.text }]}>訂閱明細</Text>
                <Text style={[styles.emptyText, { color: colors.subtleText }]}>
                    尚無訂閱資料
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.card }]}>
            <Text style={[styles.title, { color: colors.text }]}>訂閱明細</Text>

            <ScrollView style={styles.list}>
                {stats.map((item, index) => (
                    <View
                        key={index}
                        style={[styles.item, { borderBottomColor: colors.borderColor }]}
                    >
                        <View style={styles.itemHeader}>
                            <Text style={styles.itemIcon}>{item.icon}</Text>
                            <View style={styles.itemInfo}>
                                <Text style={[styles.itemName, { color: colors.text }]}>
                                    {item.name}
                                </Text>
                                <Text style={[styles.itemCategory, { color: colors.subtleText }]}>
                                    {item.category}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.itemStats}>
                            <View style={styles.statRow}>
                                <Text style={[styles.statLabel, { color: colors.subtleText }]}>
                                    月費用
                                </Text>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {formatCurrency(item.monthlyAmount, currency)}
                                </Text>
                            </View>

                            <View style={styles.statRow}>
                                <Text style={[styles.statLabel, { color: colors.subtleText }]}>
                                    年費用
                                </Text>
                                <Text style={[styles.statValue, { color: colors.text }]}>
                                    {formatCurrency(item.yearlyAmount, currency)}
                                </Text>
                            </View>

                            <View style={styles.statRow}>
                                <Text style={[styles.statLabel, { color: colors.subtleText }]}>
                                    占比
                                </Text>
                                <Text style={[styles.statValue, { color: colors.accent }]}>
                                    {item.percentage.toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
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
    emptyText: {
        textAlign: 'center',
        paddingVertical: 32,
        fontSize: 14,
    },
    list: {
        maxHeight: 400,
    },
    item: {
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    itemCategory: {
        fontSize: 12,
    },
    itemStats: {
        gap: 4,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 13,
    },
    statValue: {
        fontSize: 13,
        fontWeight: '500',
    },
});
