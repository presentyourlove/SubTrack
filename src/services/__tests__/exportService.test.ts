import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { exportData } from '../exportService';
import { getAllSubscriptions } from '../database';

jest.mock('expo-file-system');
jest.mock('expo-sharing');
jest.mock('../database');

describe('exportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.documentDirectory as any) = 'file://docs/';
  });

  describe('exportData', () => {
    it('should export data to file and share it', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      (getAllSubscriptions as jest.Mock).mockResolvedValue(mockData);
      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

      await exportData({} as any); // Pass dummy db

      expect(getAllSubscriptions).toHaveBeenCalled();
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        expect.stringContaining('subtrack_backup_'),
        expect.any(String),
        expect.any(Object),
      );
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('should throw error if sharing not available', async () => {
      (getAllSubscriptions as jest.Mock).mockResolvedValue([]);
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      await expect(exportData({} as any)).rejects.toThrow();
    });
  });
});
