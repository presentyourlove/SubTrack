import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';
import { getUpcomingSubscriptions } from '../services';

export default function AlertCard() {
    const { colors } = useTheme();
    const { database } = useDatabase();

    // 取得3天內即將到期的訂閱
    const upcomingCount = database ? getUpcomingSubscriptions(database, 3).length : 0;

    // 如果沒有即將到期的訂閱，不顯示卡片
    if (upcomingCount === 0) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: '#fef3c7' }]}>
            <View style={styles.iconContainer}>
                <Ionicons name="warning" size={24} color="#f59e0b" />
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: '#92400e' }]}>
                    即將扣款提醒
                </Text>
                <Text style={[styles.message, { color: '#78350f' }]}>
                    有 {upcomingCount} 筆款項將在 3 天內到期
                </Text>
                <Text style={[styles.hint, { color: '#a16207' }]}>
                    請確認您的戶頭餘額是否足夠
                </Text>
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
