import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import {
  requestCalendarPermissions,
  addSubscriptionToCalendar,
  addRecurringSubscriptionToCalendar,
  deleteCalendarEvent,
} from '../calendarHelper';
import { Subscription } from '../../types';

// Mock dependencies
jest.mock('expo-calendar');
jest.mock('../../i18n', () => ({
  t: (key: string) => key,
}));

// Mock Enum for Frequency
const Frequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

// Update Mock
jest.mock('expo-calendar', () => {
  return {
    requestCalendarPermissionsAsync: jest.fn(),
    getCalendarsAsync: jest.fn(),
    createEventAsync: jest.fn(),
    deleteEventAsync: jest.fn(),
    Frequency: {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      YEARLY: 'yearly',
    },
    EntityTypes: {
      EVENT: 'event',
    },
  };
});

describe('calendarHelper', () => {
  const mockSubscription: Subscription = {
    id: 1 as any,
    name: 'Netflix',
    price: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2023-01-01',
    icon: 'netflix',
    category: 'entertainment',
    startDate: '2023-01-01',
    reminderEnabled: true,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios'; // Default to mobile for most tests
  });

  describe('requestCalendarPermissions', () => {
    it('should return false on web', async () => {
      Platform.OS = 'web';
      const result = await requestCalendarPermissions();
      expect(result).toBe(false);
    });

    it('should return true when permission is granted', async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      const result = await requestCalendarPermissions();
      expect(result).toBe(true);
    });

    it('should return false when permission is denied', async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      const result = await requestCalendarPermissions();
      expect(result).toBe(false);
    });
  });

  describe('addSubscriptionToCalendar', () => {
    it('should return null on web', async () => {
      Platform.OS = 'web';
      const result = await addSubscriptionToCalendar(mockSubscription);
      expect(result).toBeNull();
    });

    it('should add event when permissions granted', async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([
        { id: 'cal1', isPrimary: true },
      ]);
      (Calendar.createEventAsync as jest.Mock).mockResolvedValue('event123');

      const result = await addSubscriptionToCalendar(mockSubscription);

      expect(result).toBe('event123');
      expect(Calendar.createEventAsync).toHaveBeenCalledWith(
        'cal1',
        expect.objectContaining({
          title: expect.stringContaining('calendar.eventTitle'),
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          alarms: expect.any(Array),
        }),
      );
    });

    it('should throw error if permission denied', async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      await expect(addSubscriptionToCalendar(mockSubscription)).rejects.toThrow(
        'calendar.addFailed',
      );
    });
  });

  describe('addRecurringSubscriptionToCalendar', () => {
    it('should return null on web', async () => {
      Platform.OS = 'web';
      const result = await addRecurringSubscriptionToCalendar(mockSubscription);
      expect(result).toBeNull();
    });

    it('should add recurring event successfully', async () => {
      (Calendar.requestCalendarPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Calendar.getCalendarsAsync as jest.Mock).mockResolvedValue([
        { id: 'cal1', isPrimary: true },
      ]);
      (Calendar.createEventAsync as jest.Mock).mockResolvedValue('event123');

      const result = await addRecurringSubscriptionToCalendar(mockSubscription);

      expect(result).toBe('event123');
      expect(Calendar.createEventAsync).toHaveBeenCalledWith(
        'cal1',
        expect.objectContaining({
          recurrenceRule: expect.objectContaining({
            frequency: Calendar.Frequency.MONTHLY,
          }),
        }),
      );
    });
  });

  describe('deleteCalendarEvent', () => {
    it('should do nothing on web', async () => {
      Platform.OS = 'web';
      await deleteCalendarEvent('123');
      expect(Calendar.deleteEventAsync).not.toHaveBeenCalled();
    });

    it('should call deleteEventAsync on mobile', async () => {
      await deleteCalendarEvent('123');
      expect(Calendar.deleteEventAsync).toHaveBeenCalledWith('123');
    });
  });
});
