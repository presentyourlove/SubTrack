import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Subscription } from '../types';
import { getDaysUntil } from './dateHelper';

// 設定通知處理器
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// 請求通知權限
export async function requestNotificationPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
        return false; // Web 不支援
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

// 排程訂閱到期通知
export async function scheduleSubscriptionNotification(
    subscription: Subscription,
    daysBefore: number = 1
): Promise<string | null> {
    if (Platform.OS === 'web') {
        return null;
    }

    try {
        const daysUntil = getDaysUntil(subscription.nextBillingDate);
        const triggerDays = daysUntil - daysBefore;

        if (triggerDays <= 0) {
            return null; // 已經過期或太接近
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '訂閱即將到期 📅',
                body: `${subscription.name} 將在 ${daysBefore} 天後扣款 ${subscription.price} ${subscription.currency}`,
                data: { subscriptionId: subscription.id },
            },
            trigger: {
                seconds: triggerDays * 24 * 60 * 60,
            },
        });

        return notificationId;
    } catch (error) {
        console.error('Failed to schedule notification:', error);
        return null;
    }
}

// 取消通知
export async function cancelNotification(notificationId: string): Promise<void> {
    if (Platform.OS === 'web') {
        return;
    }

    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.error('Failed to cancel notification:', error);
    }
}

// 取消所有通知
export async function cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
        return;
    }

    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Failed to cancel all notifications:', error);
    }
}

// 為所有訂閱排程通知
export async function scheduleAllSubscriptionNotifications(
    subscriptions: Subscription[],
    daysBefore: number = 1
): Promise<void> {
    if (Platform.OS === 'web') {
        return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
        throw new Error('未授予通知權限');
    }

    // 先取消所有現有通知
    await cancelAllNotifications();

    // 為每個訂閱排程通知
    const promises = subscriptions.map(sub =>
        scheduleSubscriptionNotification(sub, daysBefore)
    );

    await Promise.all(promises);
}

// 立即發送測試通知
export async function sendTestNotification(): Promise<void> {
    if (Platform.OS === 'web') {
        return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
        throw new Error('未授予通知權限');
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: '測試通知 ✅',
            body: '通知功能運作正常！',
        },
        trigger: {
            seconds: 1,
        },
    });
}
