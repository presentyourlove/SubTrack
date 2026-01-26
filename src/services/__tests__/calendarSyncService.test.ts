import * as Calendar from 'expo-calendar';
import { calendarSyncService } from '../calendarSyncService';

// Mock expo-calendar
jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(),
  getCalendarsAsync: jest.fn(),
  getEventsAsync: jest.fn(),
  createEventAsync: jest.fn(),
  updateEventAsync: jest.fn(),
  EntityTypes: { EVENT: 'event' },
}));

const mockCalendar = Calendar as jest.Mocked<typeof Calendar>;

describe('calendarSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSubTrackEvents', () => {
    it('returns empty array when permission is denied', async () => {
      mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        expires: 'never',
        granted: false,
        canAskAgain: true,
      });

      const result = await calendarSyncService.fetchSubTrackEvents();

      expect(result).toEqual([]);
    });

    it('returns empty array when no calendars found', async () => {
      mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });
      mockCalendar.getCalendarsAsync.mockResolvedValue([]);

      const result = await calendarSyncService.fetchSubTrackEvents();

      expect(result).toEqual([]);
    });

    it('filters events with SubTrack tag', async () => {
      mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });
      mockCalendar.getCalendarsAsync.mockResolvedValue([
        { id: '1', allowsModifications: true } as any,
      ]);
      mockCalendar.getEventsAsync.mockResolvedValue([
        { id: 'e1', notes: '[SubTrack-ID:123]' } as any,
        { id: 'e2', notes: 'Some other note' } as any,
        { id: 'e3', notes: '[SubTrack-ID:456]' } as any,
      ]);

      const result = await calendarSyncService.fetchSubTrackEvents();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('e1');
      expect(result[1].id).toBe('e3');
    });
  });

  describe('extractSubscriptionId', () => {
    it('extracts ID from notes', () => {
      const result = calendarSyncService.extractSubscriptionId('[SubTrack-ID:123]');
      expect(result).toBe(123);
    });

    it('returns null for undefined notes', () => {
      const result = calendarSyncService.extractSubscriptionId(undefined);
      expect(result).toBeNull();
    });

    it('returns null for notes without SubTrack tag', () => {
      const result = calendarSyncService.extractSubscriptionId('Some random notes');
      expect(result).toBeNull();
    });

    it('extracts ID from notes with other text', () => {
      const result = calendarSyncService.extractSubscriptionId('Price: $10\n\n[SubTrack-ID:789]');
      expect(result).toBe(789);
    });
  });

  describe('upsertEvent', () => {
    const mockSubscription = {
      id: '1',
      name: 'Netflix',
      icon: '📺',
      price: 15.99,
      currency: 'USD',
      nextBillingDate: '2026-02-01',
      calendarEventId: undefined,
    } as any;

    beforeEach(() => {
      mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });
      mockCalendar.getCalendarsAsync.mockResolvedValue([
        { id: 'cal1', allowsModifications: true } as any,
      ]);
    });

    it('creates new event when no existing event', async () => {
      mockCalendar.createEventAsync.mockResolvedValue('new-event-id');

      const result = await calendarSyncService.upsertEvent(mockSubscription);

      expect(result).toBe('new-event-id');
      expect(mockCalendar.createEventAsync).toHaveBeenCalled();
    });

    it('updates existing event when calendarEventId exists', async () => {
      const subscriptionWithEvent = { ...mockSubscription, calendarEventId: 'existing-id' };
      mockCalendar.updateEventAsync.mockResolvedValue(undefined as any);

      const result = await calendarSyncService.upsertEvent(subscriptionWithEvent);

      expect(result).toBe('existing-id');
      expect(mockCalendar.updateEventAsync).toHaveBeenCalledWith('existing-id', expect.any(Object));
    });

    it('creates new event when update fails', async () => {
      const subscriptionWithEvent = { ...mockSubscription, calendarEventId: 'stale-id' };
      mockCalendar.updateEventAsync.mockRejectedValue(new Error('Event not found'));
      mockCalendar.createEventAsync.mockResolvedValue('new-event-id');

      const result = await calendarSyncService.upsertEvent(subscriptionWithEvent);

      expect(result).toBe('new-event-id');
    });

    it('returns null when permission denied', async () => {
      mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
        status: 'denied' as any,
        expires: 'never',
        granted: false,
        canAskAgain: true,
      });

      const result = await calendarSyncService.upsertEvent(mockSubscription);

      expect(result).toBeNull();
    });

    it('returns null when no calendar available', async () => {
      mockCalendar.requestCalendarPermissionsAsync.mockResolvedValue({
        status: 'granted' as any,
        expires: 'never',
        granted: true,
        canAskAgain: true,
      });
      mockCalendar.getCalendarsAsync.mockResolvedValue([]);

      const result = await calendarSyncService.upsertEvent(mockSubscription);

      expect(result).toBeNull();
    });

    it('returns null and logs error on exception', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockCalendar.createEventAsync.mockRejectedValue(new Error('API error'));

      const result = await calendarSyncService.upsertEvent(mockSubscription);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to upsert calendar event:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });
});
