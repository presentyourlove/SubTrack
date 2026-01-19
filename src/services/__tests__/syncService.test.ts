import { syncData } from '../syncService';
import { getAllSubscriptions } from '../database';
import { NetworkState } from 'react-native';
import * as NetInfo from '@react-native-community/netinfo';
import * as authService from '../authService';

jest.mock('../database');
jest.mock('@react-native-community/netinfo');
jest.mock('../authService');

describe('syncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncData', () => {
    it('should sync when online and user logged in', async () => {
      const mockUser = { uid: 'user1' };
      (authService.getCurrentUser as jest.Mock).mockReturnValue(mockUser);
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (getAllSubscriptions as jest.Mock).mockResolvedValue([]);

      // Assume syncData implementation calls cloud sync logic
      // Since we can't easily mock firestore here without deep mocks,
      // we focus on ensuring it attempts to get data if conditions met.

      await syncData({} as any);

      expect(getAllSubscriptions).toHaveBeenCalled();
    });

    it('should skip sync if offline', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

      await syncData({} as any);

      expect(getAllSubscriptions).not.toHaveBeenCalled();
    });

    it('should skip sync if no user', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
      (authService.getCurrentUser as jest.Mock).mockReturnValue(null);

      await syncData({} as any);

      expect(getAllSubscriptions).not.toHaveBeenCalled();
    });
  });
});
