import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import Papa from 'papaparse';
import { exportSubscriptionsToCSV, exportSubscriptionsToPDF } from '../exportService';

// Mock expo modules
jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((pathOrUri, name) => ({
    uri: name ? `/cache/${name}` : pathOrUri,
    write: jest.fn().mockResolvedValue(undefined),
    move: jest.fn().mockResolvedValue(undefined),
  })),
  Paths: {
    cache: '/cache',
  },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

jest.mock('papaparse', () => ({
  unparse: jest.fn(),
}));

const mockSharing = Sharing as jest.Mocked<typeof Sharing>;
const mockPrint = Print as jest.Mocked<typeof Print>;
const mockPapa = Papa as jest.Mocked<typeof Papa>;

describe('exportService', () => {
  const mockSubscriptions = [
    {
      id: '1',
      name: 'Netflix',
      category: 'entertainment',
      price: 15.99,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2025-01-01',
      nextBillingDate: '2026-02-01',
      icon: '📺',
    },
    {
      id: '2',
      name: 'Spotify',
      category: 'entertainment',
      price: 9.99,
      currency: 'USD',
      billingCycle: 'monthly',
      startDate: '2025-03-01',
      nextBillingDate: '2026-02-01',
      icon: '🎵',
    },
  ] as any[];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSharing.isAvailableAsync.mockResolvedValue(true);
    mockSharing.shareAsync.mockResolvedValue(undefined);
    mockPrint.printToFileAsync.mockResolvedValue({ uri: '/tmp/print.pdf', numberOfPages: 1 });
    mockPapa.unparse.mockReturnValue('csv,data');
  });

  describe('exportSubscriptionsToCSV', () => {
    it('exports subscriptions to CSV and shares', async () => {
      await exportSubscriptionsToCSV(mockSubscriptions);

      expect(mockPapa.unparse).toHaveBeenCalled();
      expect(mockSharing.isAvailableAsync).toHaveBeenCalled();
      expect(mockSharing.shareAsync).toHaveBeenCalledWith(
        expect.stringContaining('.csv'),
        expect.objectContaining({
          mimeType: 'text/csv',
        }),
      );
    });

    it('generates CSV with correct data structure', async () => {
      await exportSubscriptionsToCSV(mockSubscriptions);

      // Verify unparse was called with array data
      const callArgs = mockPapa.unparse.mock.calls[0][0] as any[];
      expect(Array.isArray(callArgs)).toBe(true);
      expect(callArgs[0]).toEqual([
        '名稱',
        '分類',
        '金額',
        '幣種',
        '週期',
        '開始日期',
        '下次扣款日',
        '圖示',
      ]);
    });

    it('throws error when sharing is not available', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(false);

      await expect(exportSubscriptionsToCSV(mockSubscriptions)).rejects.toThrow(
        'Sharing is not available on this device',
      );
    });

    it('handles empty subscriptions array', async () => {
      await exportSubscriptionsToCSV([]);

      expect(mockPapa.unparse).toHaveBeenCalled();
      const callArgs = mockPapa.unparse.mock.calls[0][0] as any[];
      // Should only have header row
      expect(callArgs.length).toBe(1);
    });

    it('translates category labels correctly', async () => {
      await exportSubscriptionsToCSV(mockSubscriptions);

      const callArgs = mockPapa.unparse.mock.calls[0][0] as any[];
      // First data row (index 1) should have translated category
      expect(callArgs[1][1]).toBe('影音娛樂');
    });

    it('translates billing cycle labels correctly', async () => {
      await exportSubscriptionsToCSV(mockSubscriptions);

      const callArgs = mockPapa.unparse.mock.calls[0][0] as any[];
      // First data row should have translated cycle
      expect(callArgs[1][4]).toBe('每月');
    });
  });

  describe('exportSubscriptionsToPDF', () => {
    it('exports subscriptions to PDF and shares', async () => {
      await exportSubscriptionsToPDF(mockSubscriptions, 25.98, 'USD');

      expect(mockPrint.printToFileAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('SubTrack'),
          base64: false,
        }),
      );
      expect(mockSharing.shareAsync).toHaveBeenCalledWith(
        expect.stringContaining('.pdf'),
        expect.objectContaining({
          mimeType: 'application/pdf',
        }),
      );
    });

    it('includes total amount in PDF HTML', async () => {
      await exportSubscriptionsToPDF(mockSubscriptions, 100.5, 'EUR');

      const htmlArg = mockPrint.printToFileAsync.mock.calls[0]?.[0]?.html;
      expect(htmlArg).toContain('EUR 100.50');
    });

    it('includes subscription count in PDF', async () => {
      await exportSubscriptionsToPDF(mockSubscriptions, 25.98, 'USD');

      const htmlArg = mockPrint.printToFileAsync.mock.calls[0]?.[0]?.html;
      expect(htmlArg).toContain('2 項');
    });

    it('throws error when sharing is not available', async () => {
      mockSharing.isAvailableAsync.mockResolvedValue(false);

      await expect(exportSubscriptionsToPDF(mockSubscriptions, 25.98, 'USD')).rejects.toThrow(
        'Sharing is not available on this device',
      );
    });

    it('generates valid HTML structure', async () => {
      await exportSubscriptionsToPDF(mockSubscriptions, 25.98, 'USD');

      const htmlArg = mockPrint.printToFileAsync.mock.calls[0]?.[0]?.html;
      expect(htmlArg).toContain('<!DOCTYPE html>');
      expect(htmlArg).toContain('<table>');
      expect(htmlArg).toContain('</table>');
    });
  });
});
