import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';
import { getDaysUntil } from '../utils/dateHelper';

export default function AlertCard() {
    const { colors } = useTheme();
    const { subscriptions } = useDatabase();
    const [upcomingCount, setUpcomingCount] = useState(0);

    // 計算3天內即將到期的訂閱數量
    useEffect(() => {
        const upcoming = subscriptions.filter(sub => {
            const days = getDaysUntil(sub.nextBillingDate);
            return days >= 0 && days <= 3;
        });
        setUpcomingCount(upcoming.length);
    }, [subscriptions]);

    // 根據數量決定樣式
    const hasUpcoming = upcomingCount > 0;
    const backgroundColor = hasUpcoming ? '#fef3c7' : '#e0f2fe';
    const iconColor = hasUpcoming ? '#f59e0b' : '#0ea5e9';
    const titleColor = hasUpcoming ? '#92400e' : '#075985';
    const messageColor = hasUpcoming ? '#78350f' : '#0c4a6e';
    const hintColor = hasUpcoming ? '#a16207' : '#0369a1';

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={styles.iconContainer}>
                <Ionicons
                    name={hasUpcoming ? "warning" : "checkmark-circle"}
                    size={24}
                    color={iconColor}
                />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: titleColor }]}>
                    {hasUpcoming ? '即將扣款提醒' : '扣款狀態'}
                </Text>
                <Text style={[styles.message, { color: messageColor }]}>
                    有 {upcomingCount} 筆款項將在 3 天內到期
                </Text>
                {hasUpcoming && (
                    <Text style={[styles.hint, { color: hintColor }]}>
                        請確認您的戶頭餘額是否足夠
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        marginBottom: 2,
    },
    hint: {
        fontSize: 12,
        opacity: 0.8,
    },
});
