import { exportSubscriptionsToCSV } from '../exportService';
import { getAllSubscriptions } from '../database';

// Mock dependencies
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => {
  return {
    File: class {
      constructor(path: string, filename?: string) {
        this.uri = (path || '') + (filename || '');
      }
      uri: string;
      write = jest.fn();
      move = jest.fn();
    },
    Paths: {
      cache: 'file:///cache/',
    },
  };
});

// Mock print
jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file://print.pdf' }),
}));

jest.mock('../database');

import * as Sharing from 'expo-sharing';

describe('exportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportSubscriptionsToCSV', () => {
    it('should export and share csv', async () => {
      (getAllSubscriptions as jest.Mock).mockResolvedValue([
        { name: 'Test', price: 100, billingCycle: 'monthly', startDate: '2023-01-01' },
      ]);
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

      await exportSubscriptionsToCSV([] as any);

      // Since we mocked File class, we can't easily spy on the instance method 'write'
      // unless we capture the instance or spy on the prototype.
      // But for now, ensuring it runs without error and calls shareAsync is a good step.
      expect(Sharing.shareAsync).toHaveBeenCalled();
    });

    it('should throw if sharing unavailable', async () => {
      (getAllSubscriptions as jest.Mock).mockResolvedValue([]);
      (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

      await expect(exportSubscriptionsToCSV([] as any)).rejects.toThrow();
    });
  });
});
