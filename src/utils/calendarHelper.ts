import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { Subscription } from '../types';
import i18n from '../i18n';
import { TIME_CONSTANTS } from '../constants/AppConfig';

// 解構時間常數以便計算
const { HOURS_PER_DAY, MINUTES_PER_HOUR } = TIME_CONSTANTS;

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
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // 優先使用主要日曆
  const defaultCalendar = calendars.find((cal) => cal.isPrimary) || calendars[0];

  return defaultCalendar?.id || null;
}

// 新增訂閱到日曆
export async function addSubscriptionToCalendar(
  subscription: Subscription,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      throw new Error(i18n.t('calendar.permissionRequired'));
    }

    const calendarId = await getDefaultCalendarId();
    if (!calendarId) {
      throw new Error(i18n.t('calendar.noCalendar'));
    }

    const startDate = new Date(subscription.nextBillingDate);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    const cycleName =
      subscription.billingCycle === 'monthly' ? i18n.t('cycles.monthly') : i18n.t('cycles.yearly');

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: i18n.t('calendar.eventTitle', {
        icon: subscription.icon,
        name: subscription.name,
      }),
      notes: i18n.t('calendar.eventNotes', {
        price: subscription.price,
        currency: subscription.currency,
        cycle: cycleName,
      }),
      startDate,
      endDate,
      alarms: [
        { relativeOffset: -(HOURS_PER_DAY * MINUTES_PER_HOUR) }, // 1天前提醒（1440分鐘）
        { relativeOffset: -MINUTES_PER_HOUR }, // 1小時前提醒（60分鐘）
      ],
    });

    return eventId;
  } catch (error) {
    console.error('Failed to add to calendar:', error);
    throw new Error(i18n.t('calendar.addFailed'));
  }
}

// 新增重複事件到日曆
export async function addRecurringSubscriptionToCalendar(
  subscription: Subscription,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const hasPermission = await requestCalendarPermissions();
    if (!hasPermission) {
      throw new Error(i18n.t('calendar.permissionRequired'));
    }

    const calendarId = await getDefaultCalendarId();
    if (!calendarId) {
      throw new Error(i18n.t('calendar.noCalendar'));
    }

    const startDate = new Date(subscription.nextBillingDate);
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);

    // 設定重複規則
    const recurrenceRule: Calendar.RecurrenceRule = {
      frequency:
        subscription.billingCycle === 'monthly'
          ? Calendar.Frequency.MONTHLY
          : Calendar.Frequency.YEARLY,
      interval: 1,
    };

    const cycleName =
      subscription.billingCycle === 'monthly' ? i18n.t('cycles.monthly') : i18n.t('cycles.yearly');

    const eventId = await Calendar.createEventAsync(calendarId, {
      title: i18n.t('calendar.eventTitle', {
        icon: subscription.icon,
        name: subscription.name,
      }),
      notes: i18n.t('calendar.eventNotes', {
        price: subscription.price,
        currency: subscription.currency,
        cycle: cycleName,
      }),
      startDate,
      endDate,
      recurrenceRule,
      alarms: [
        { relativeOffset: -(HOURS_PER_DAY * MINUTES_PER_HOUR) }, // 1天前提醒（1440分鐘）
      ],
    });

    return eventId;
  } catch (error) {
    console.error('Failed to add recurring event:', error);
    throw new Error(i18n.t('calendar.recurringFailed'));
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
