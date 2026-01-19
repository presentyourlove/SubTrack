import * as Calendar from 'expo-calendar';
import { Subscription } from '../types';
import i18n from '../i18n';

const SUBTRACK_TAG = '[SubTrack-ID:';

export interface SyncResult {
  updated: number;
  added: number;
  conflicts: number;
}

export const calendarSyncService = {
  /**
   * 從日曆中獲取與 SubTrack 相關的事件
   */
  async fetchSubTrackEvents(): Promise<Calendar.Event[]> {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    if (status !== 'granted') return [];

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const calendarIds = calendars.filter((cal) => cal.allowsModifications).map((cal) => cal.id);

    if (calendarIds.length === 0) return [];

    // 設定搜尋範圍：前後 1 年
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);

    const events = await Calendar.getEventsAsync(calendarIds, start, end);
    return events.filter((event) => event.notes?.includes(SUBTRACK_TAG));
  },

  /**
   * 解析事件中的 Subscription ID
   */
  extractSubscriptionId(notes: string | undefined): number | null {
    if (!notes) return null;
    const match = notes.match(/\[SubTrack-ID:(\d+)\]/);
    return match ? parseInt(match[1], 10) : null;
  },

  /**
   * 建立或更新日曆事件
   */
  async upsertEvent(subscription: Subscription): Promise<string | null> {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') return null;

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      const defaultCalendar = calendars.find((cal) => cal.allowsModifications) || calendars[0];
      if (!defaultCalendar) return null;

      const eventDate = new Date(subscription.nextBillingDate);
      const endDate = new Date(eventDate);
      endDate.setHours(endDate.getHours() + 1);

      const eventData: Partial<Calendar.Event> = {
        title: i18n.t('calendar.eventTitle', {
          icon: subscription.icon,
          name: subscription.name,
        }),
        startDate: eventDate,
        endDate: endDate,
        notes: `${i18n.t('calendar.eventNotesPrice', {
          price: `${subscription.currency} ${subscription.price}`,
        })}\n\n${SUBTRACK_TAG}${subscription.id}]`,
        alarms: [{ relativeOffset: -24 * 60 }],
      };

      if (subscription.calendarEventId) {
        try {
          await Calendar.updateEventAsync(subscription.calendarEventId, eventData);
          return subscription.calendarEventId;
        } catch (e) {
          // 如果事件不存在，則建立新的
          return await Calendar.createEventAsync(defaultCalendar.id, eventData);
        }
      } else {
        return await Calendar.createEventAsync(defaultCalendar.id, eventData);
      }
    } catch (error) {
      console.error('Failed to upsert calendar event:', error);
      return null;
    }
  },
};
