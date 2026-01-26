import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  requestNotificationPermissions,
  scheduleSubscriptionNotification,
  cancelNotification,
  cancelAllNotifications,
  scheduleAllSubscriptionNotifications,
  sendTestNotification,
} from '../notificationHelper';
import { getDaysUntil } from '../dateHelper';
import { Subscription } from '../../types';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('../dateHelper', () => ({
  getDaysUntil: jest.fn(),
}));

const mockGetDaysUntil = getDaysUntil as jest.Mock;

describe('notificationHelper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: non-web platform
    (Platform as any).OS = 'ios';
  });

  describe('requestNotificationPermissions', () => {
    it('returns true when permission is already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permission when not granted and returns result', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('returns false when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });

    it('returns false on web platform', async () => {
      (Platform as any).OS = 'web';

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleSubscriptionNotification', () => {
    const mockSubscription: Subscription = {
      id: 1 as any,
      name: 'Netflix',
      price: 15.99,
      currency: 'USD',
      billingCycle: 'monthly',
      nextBillingDate: '2026-02-01',
      category: 'entertainment',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    } as any;

    it('schedules notification and returns ID', async () => {
      mockGetDaysUntil.mockReturnValue(10);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-123');

      const result = await scheduleSubscriptionNotification(mockSubscription, 3);

      expect(result).toBe('notification-123');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            data: { subscriptionId: 'sub-1' },
          }),
        }),
      );
    });

    it('returns null when subscription is already past due', async () => {
      mockGetDaysUntil.mockReturnValue(0);

      const result = await scheduleSubscriptionNotification(mockSubscription, 1);

      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('returns null when trigger days would be negative', async () => {
      mockGetDaysUntil.mockReturnValue(2);

      const result = await scheduleSubscriptionNotification(mockSubscription, 5);

      expect(result).toBeNull();
    });

    it('returns null on web platform', async () => {
      (Platform as any).OS = 'web';
      mockGetDaysUntil.mockReturnValue(10);

      const result = await scheduleSubscriptionNotification(mockSubscription);

      expect(result).toBeNull();
    });

    it('returns null and logs error on failure', async () => {
      mockGetDaysUntil.mockReturnValue(10);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Schedule failed'),
      );

      const result = await scheduleSubscriptionNotification(mockSubscription);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to schedule notification:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('cancelNotification', () => {
    it('cancels notification by ID', async () => {
      await cancelNotification('notif-123');

      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notif-123');
    });

    it('does nothing on web platform', async () => {
      (Platform as any).OS = 'web';

      await cancelNotification('notif-123');

      expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    });

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Cancel failed'),
      );

      await cancelNotification('notif-123');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to cancel notification:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('cancelAllNotifications', () => {
    it('cancels all scheduled notifications', async () => {
      await cancelAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('does nothing on web platform', async () => {
      (Platform as any).OS = 'web';

      await cancelAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    });

    it('logs error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(
        new Error('Cancel all failed'),
      );

      await cancelAllNotifications();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to cancel all notifications:',
        expect.any(Error),
      );
      consoleSpy.mockRestore();
    });
  });

  describe('scheduleAllSubscriptionNotifications', () => {
    const mockSubscriptions: Subscription[] = [
      {
        id: 1 as any,
        name: 'Netflix',
        price: 15.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: '2026-02-01',
        category: 'entertainment',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 2 as any,
        name: 'Spotify',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        nextBillingDate: '2026-02-15',
        category: 'entertainment',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];

    it('schedules notifications for all subscriptions', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      mockGetDaysUntil.mockReturnValue(10);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notif-id');

      await scheduleAllSubscriptionNotifications(mockSubscriptions, 3);

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    });

    it('throws error when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      await expect(scheduleAllSubscriptionNotifications(mockSubscriptions)).rejects.toThrow();
    });

    it('does nothing on web platform', async () => {
      (Platform as any).OS = 'web';

      await scheduleAllSubscriptionNotifications(mockSubscriptions);

      expect(Notifications.getPermissionsAsync).not.toHaveBeenCalled();
    });
  });

  describe('sendTestNotification', () => {
    it('sends a test notification', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      await sendTestNotification();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            seconds: 1,
          }),
        }),
      );
    });

    it('throws error when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      await expect(sendTestNotification()).rejects.toThrow();
    });

    it('does nothing on web platform', async () => {
      (Platform as any).OS = 'web';

      await sendTestNotification();

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });
});
