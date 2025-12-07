import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { Subscription } from '../types';

// 請求日曆權限
export async function requestCalendarPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
        return false; // Web 不支援
    }

    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
}

// 取得預設日曆
async function getDefaultCalendarId(): Promise<string | null> {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityType.EVENT);

    // 優先使用主要日曆
    const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

    return defaultCalendar?.id || null;
}

// 新增訂閱到日曆
export async function addSubscriptionToCalendar(
    subscription: Subscription
): Promise<string | null> {
    if (Platform.OS === 'web') {
        return null;
    }

    try {
        const hasPermission = await requestCalendarPermissions();
        if (!hasPermission) {
            throw new Error('未授予日曆權限');
        }

        const calendarId = await getDefaultCalendarId();
        if (!calendarId) {
            throw new Error('找不到可用的日曆');
        }

        const startDate = new Date(subscription.nextBillingDate);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        const eventId = await Calendar.createEventAsync(calendarId, {
            title: `${subscription.name} 訂閱扣款`,
            notes: `金額: ${subscription.price} ${subscription.currency}\n週期: ${subscription.billingCycle === 'monthly' ? '每月' : '每年'}`,
            startDate,
            endDate,
            alarms: [
                { relativeOffset: -24 * 60 }, // 1天前提醒
                { relativeOffset: -60 },      // 1小時前提醒
            ],
        });

        return eventId;
    } catch (error) {
        console.error('Failed to add to calendar:', error);
        throw new Error('新增到日曆失敗');
    }
}

// 新增重複事件到日曆
export async function addRecurringSubscriptionToCalendar(
    subscription: Subscription
): Promise<string | null> {
    if (Platform.OS === 'web') {
        return null;
    }

    try {
        const hasPermission = await requestCalendarPermissions();
        if (!hasPermission) {
            throw new Error('未授予日曆權限');
        }

        const calendarId = await getDefaultCalendarId();
        if (!calendarId) {
            throw new Error('找不到可用的日曆');
        }

        const startDate = new Date(subscription.nextBillingDate);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 1);

        // 設定重複規則
        const recurrenceRule: Calendar.RecurrenceRule = {
            frequency: subscription.billingCycle === 'monthly'
                ? Calendar.Frequency.MONTHLY
                : Calendar.Frequency.YEARLY,
            interval: 1,
        };

        const eventId = await Calendar.createEventAsync(calendarId, {
            title: `${subscription.name} 訂閱扣款`,
            notes: `金額: ${subscription.price} ${subscription.currency}\n週期: ${subscription.billingCycle === 'monthly' ? '每月' : '每年'}`,
            startDate,
            endDate,
            recurrenceRule,
            alarms: [
                { relativeOffset: -24 * 60 }, // 1天前提醒
            ],
        });

        return eventId;
    } catch (error) {
        console.error('Failed to add recurring event:', error);
        throw new Error('新增重複事件失敗');
    }
}

// 刪除日曆事件
export async function deleteCalendarEvent(eventId: string): Promise<void> {
    if (Platform.OS === 'web') {
        return;
    }

    try {
        await Calendar.deleteEventAsync(eventId);
    } catch (error) {
        console.error('Failed to delete calendar event:', error);
    }
}
