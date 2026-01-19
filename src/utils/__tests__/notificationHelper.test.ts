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
import { Subscription } from '../../types';
import * as dateHelper from '../dateHelper';

// Mock dependencies
jest.mock('expo-notifications');
jest.mock('../../i18n', () => ({
  t: (key: string) => key,
}));
jest.mock('../dateHelper');

describe('notificationHelper', () => {
  const mockSubscription: Subscription = {
    id: '1',
    name: 'Netflix',
    price: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    nextBillingDate: '2023-01-10',
    icon: 'netflix',
    category: 'Entertainment',
    startDate: '2023-01-01',
    reminderEnabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  describe('requestNotificationPermissions', () => {
    it('should return false on web', async () => {
      Platform.OS = 'web';
      const result = await requestNotificationPermissions();
      expect(result).toBe(false);
    });

    it('should return true if already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      const result = await requestNotificationPermissions();
      expect(result).toBe(true);
    });

    it('should request permissions if not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      const result = await requestNotificationPermissions();
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('scheduleSubscriptionNotification', () => {
    it('should return null on web', async () => {
      Platform.OS = 'web';
      const result = await scheduleSubscriptionNotification(mockSubscription);
      expect(result).toBeNull();
    });

    it('should return null if daysUntil <= 0 (expired)', async () => {
      (dateHelper.getDaysUntil as jest.Mock).mockReturnValue(0);
      const result = await scheduleSubscriptionNotification(mockSubscription);
      expect(result).toBeNull();
    });

    it('should schedule notification successfully', async () => {
      (dateHelper.getDaysUntil as jest.Mock).mockReturnValue(5); // 5 days until due
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notif123');

      // Scheduling 1 day before: trigger should be 5 - 1 = 4 days
      const result = await scheduleSubscriptionNotification(mockSubscription, 1);

      expect(result).toBe('notif123');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({
            seconds: 4 * 24 * 60 * 60,
          }),
        }),
      );
    });
  });

  describe('cancelNotification', () => {
    it('should call cancelScheduledNotificationAsync', async () => {
      await cancelNotification('123');
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('123');
    });
  });

  describe('cancelAllNotifications', () => {
    it('should call cancelAllScheduledNotificationsAsync', async () => {
      await cancelAllNotifications();
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('scheduleAllSubscriptionNotifications', () => {
    it('should verify permissions and schedule all', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      (dateHelper.getDaysUntil as jest.Mock).mockReturnValue(5);

      await scheduleAllSubscriptionNotifications([mockSubscription]);

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should throw error if permission denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

      await expect(scheduleAllSubscriptionNotifications([mockSubscription])).rejects.toThrow(
        'error.permissionRequired',
      );
    });
  });

  describe('sendTestNotification', () => {
    it('should schedule immediate notification', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      await sendTestNotification();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          trigger: expect.objectContaining({ seconds: 1 }),
        }),
      );
    });
  });
});
