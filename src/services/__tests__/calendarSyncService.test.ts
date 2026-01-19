import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';
import { syncSubscriptionsToCalendar } from '../calendarSyncService';
import { Subscription } from '../../types';
import * as calendarHelper from '../../utils/calendarHelper';
import { initDatabase, getAllSubscriptions } from '../database';

// Mock dependencies
jest.mock('expo-calendar');
jest.mock('../../utils/calendarHelper');
jest.mock('../database');

describe('calendarSyncService', () => {
  const mockSubscriptions: Subscription[] = [
    { id: '1', name: 'Netflix', price: 100, currency: 'TWD', nextBillingDate: '2023-01-01' } as any,
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  describe('syncSubscriptionsToCalendar', () => {
    it('should do nothing on web', async () => {
      Platform.OS = 'web';
      await syncSubscriptionsToCalendar(true);
      expect(calendarHelper.requestCalendarPermissions).not.toHaveBeenCalled();
    });

    it('should request permissions first', async () => {
      (calendarHelper.requestCalendarPermissions as jest.Mock).mockResolvedValue(false);
      await syncSubscriptionsToCalendar(true);
      expect(calendarHelper.requestCalendarPermissions).toHaveBeenCalled();
    });

    it('should sync subscriptions if permission granted', async () => {
      (calendarHelper.requestCalendarPermissions as jest.Mock).mockResolvedValue(true);
      (getAllSubscriptions as jest.Mock).mockResolvedValue(mockSubscriptions);
      (calendarHelper.addSubscriptionToCalendar as jest.Mock).mockResolvedValue('event1');

      // Mock db init returning a dummy object
      (initDatabase as jest.Mock).mockResolvedValue({});

      await syncSubscriptionsToCalendar(true);

      expect(getAllSubscriptions).toHaveBeenCalled();
      expect(calendarHelper.addSubscriptionToCalendar).toHaveBeenCalledWith(mockSubscriptions[0]);
    });
  });
});
