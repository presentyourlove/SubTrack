import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import { useTheme } from '../context/ThemeContext';
import { Subscription } from '../types';
import { formatCurrency } from '../utils/currencyHelper';
import { formatDateLocale, getDaysUntil, getUrgencyLevel } from '../utils/dateHelper';

type SubscriptionCardProps = {
    subscription: Subscription;
    onEdit?: () => void;
    onDelete?: () => void;
    onSyncToCalendar?: () => void;
    onUpdateCalendarId?: (eventId: string | null) => void;
};

export default function SubscriptionCard({
    subscription,
    onEdit,
    onDelete,
    onSyncToCalendar,
    onUpdateCalendarId,
}: SubscriptionCardProps) {
    const { colors } = useTheme();

    const daysUntil = getDaysUntil(subscription.nextBillingDate);
    const urgency = getUrgencyLevel(subscription.nextBillingDate);

    // 同步到日曆
    const handleSyncToCalendar = async () => {
        if (Platform.OS === 'web') {
            alert('日曆功能在 Web 平台不支援');
            return;
        }

        try {
            // 如果已經同步過,則刪除
            if (subscription.calendarEventId) {
                try {
                    await Calendar.deleteEventAsync(subscription.calendarEventId);

                    // 清除資料庫中的 eventId
                    if (onUpdateCalendarId) {
                        onUpdateCalendarId(null);
                    }

                    alert('已從日曆移除');
                    // 通知父組件重新載入資料
                    if (onSyncToCalendar) {
                        onSyncToCalendar();
                    }
                } catch (error) {
                    console.error('刪除日曆事件失敗:', error);
                    alert('從日曆移除失敗');
                }
                return;
            }

            // 請求日曆權限
            const { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                alert('需要日曆權限才能同步');
                return;
            }

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            const defaultCalendar = calendars.find(cal => cal.allowsModifications) || calendars[0];

            if (!defaultCalendar) {
                alert('找不到可用的日曆');
                return;
            }

            const eventDate = new Date(subscription.nextBillingDate);
            const endDate = new Date(eventDate);
            endDate.setHours(endDate.getHours() + 1);

            const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
                title: `${subscription.icon} ${subscription.name} 扣款`,
                startDate: eventDate,
                endDate: endDate,
                notes: `金額: ${formatCurrency(subscription.price, subscription.currency)}`,
                alarms: [{ relativeOffset: -24 * 60 }], // 提前 1 天提醒
            });

            // 儲存 eventId 到資料庫
            if (onUpdateCalendarId) {
                onUpdateCalendarId(eventId);
            }

            alert('已成功同步到日曆！');
            // 通知父組件重新載入資料
            if (onSyncToCalendar) {
                onSyncToCalendar();
            }
        } catch (error) {
            console.error('同步日曆失敗:', error);
            alert('同步日曆失敗，請稍後再試');
        }
    };

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
                    下次扣款: {subscription.nextBillingDate ? formatDateLocale(subscription.nextBillingDate) : '未設定'}
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

            {/* 日曆同步開關 */}
            <View style={[styles.calendarSync, { borderTopColor: colors.borderColor }]}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.calendarLabel, { color: colors.text }]}>同步到日曆</Text>
                    <Text style={[styles.calendarHint, { color: colors.subtleText }]}>
                        自動將扣款日期加入手機日曆
                    </Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.calendarToggle,
                        subscription.calendarEventId
                            ? { backgroundColor: colors.accent }
                            : { backgroundColor: colors.borderColor }
                    ]}
                    onPress={handleSyncToCalendar}
                >
                    <View style={[
                        styles.calendarToggleThumb,
                        subscription.calendarEventId && styles.calendarToggleThumbActive
                    ]} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
        entertainment: '娛樂',
        productivity: '生產力',
        lifestyle: '生活',
        other: '其他',
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
    calendarSync: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        marginTop: 12,
        borderTopWidth: 1,
        gap: 12,
    },
    calendarLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    calendarHint: {
        fontSize: 12,
        marginTop: 2,
    },
    calendarToggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        padding: 2,
        justifyContent: 'center',
    },
    calendarToggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ffffff',
    },
    calendarToggleThumbActive: {
        marginLeft: 22,
    },
});
