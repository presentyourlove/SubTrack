import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { Subscription } from '../types';
import { formatCurrency } from '../utils/currencyHelper';
import { formatDateLocale, getDaysUntil, getUrgencyLevel } from '../utils/dateHelper';

type SubscriptionCardProps = {
    subscription: Subscription;
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function SubscriptionCard({
    subscription,
    onEdit,
    onDelete,
}: SubscriptionCardProps) {
    const { colors } = useTheme();

    const daysUntil = getDaysUntil(subscription.nextBillingDate);
    const urgency = getUrgencyLevel(subscription.nextBillingDate);

    // 緊急程度顏色
    const urgencyColors = {
        urgent: '#ef4444',   // 紅色
        warning: '#f59e0b',  // 橘色
        safe: '#10b981',     // 綠色
    };

    const urgencyLabels = {
        urgent: `剩餘 ${daysUntil} 天`,
        warning: `剩餘 ${daysUntil} 天`,
        safe: `剩餘 ${daysUntil} 天`,
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderColor }]}>
            {/* 頂部資訊 */}
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{subscription.icon}</Text>
                </View>

                <View style={styles.info}>
                    <Text style={[styles.name, { color: colors.text }]}>
                        {subscription.name}
                    </Text>
                    <Text style={[styles.category, { color: colors.subtleText }]}>
                        {getCategoryName(subscription.category)}
                    </Text>
                </View>

                <View style={[styles.urgencyBadge, { backgroundColor: urgencyColors[urgency] }]}>
                    <Text style={styles.urgencyText}>{urgencyLabels[urgency]}</Text>
                </View>
            </View>

            {/* 價格和日期 */}
            <View style={styles.details}>
                <Text style={[styles.price, { color: colors.text }]}>
                    {formatCurrency(subscription.price, subscription.currency)} / {subscription.billingCycle === 'monthly' ? '月' : '年'}
                </Text>
                <Text style={[styles.date, { color: colors.subtleText }]}>
                    下次扣款: {formatDateLocale(subscription.nextBillingDate)}
                </Text>
            </View>

            {/* 操作按鈕 */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.borderColor }]}
                    onPress={onEdit}
                >
                    <Ionicons name="pencil" size={18} color={colors.text} />
                    <Text style={[styles.actionText, { color: colors.text }]}>編輯</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { borderColor: colors.borderColor }]}
                    onPress={onDelete}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.expense} />
                    <Text style={[styles.actionText, { color: colors.expense }]}>刪除</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

function getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
        entertainment: '娛樂',
        productivity: '生產力',
        lifestyle: '生活/其他',
    };
    return names[category] || category;
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 24,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    category: {
        fontSize: 12,
    },
    urgencyBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgencyText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
    },
    details: {
        marginBottom: 12,
    },
    price: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    date: {
        fontSize: 13,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
