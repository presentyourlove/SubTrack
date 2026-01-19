/**
 * @jest-environment node
 */
import { CustomReport, Subscription, Tag } from '../../../types';
import * as reportService from '../reports';

// Mock DB
const mockDb = {
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

describe('Report Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- CRUD Tests ---

  it('should create a report', async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });
    const reportData: Omit<CustomReport, 'id' | 'createdAt' | 'updatedAt'> = {
      title: 'Test Report',
      chartType: 'pie',
      dimension: 'category',
      metric: 'cost_monthly',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = await reportService.createReport(mockDb as any, reportData);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO custom_reports'),
      expect.arrayContaining(['Test Report', 'pie', 'category', 'cost_monthly']),
    );
    expect(id).toBe(1);
  });

  it('should get all reports', async () => {
    const mockReports: CustomReport[] = [
      {
        id: 1,
        title: 'R1',
        chartType: 'pie',
        dimension: 'category',
        metric: 'count',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 2,
        title: 'R2',
        chartType: 'bar',
        dimension: 'tag',
        metric: 'cost_monthly',
        createdAt: '',
        updatedAt: '',
      },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockReports);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reports = await reportService.getReports(mockDb as any);

    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM custom_reports'),
    );
    expect(reports).toEqual(mockReports);
  });

  it('should delete a report', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await reportService.deleteReport(mockDb as any, 1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM custom_reports'),
      [1],
    );
  });

  // --- Execution Logic Tests ---

  describe('executeReport', () => {
    const mockSubscriptions: Subscription[] = [
      {
        id: 1,
        name: 'Netflix',
        price: 390,
        currency: 'TWD',
        billingCycle: 'monthly',
        category: 'entertainment',
        startDate: '2023-01-01',
        createdAt: '',
        updatedAt: '',
        description: '',
        workspaceId: 1,
        isFamilyPlan: false,
        icon: 'N',
        reminderEnabled: true,
        nextBillingDate: '2024-02-01',
        tags: [{ id: 1, name: 'Fun', color: 'red' } as Tag],
      },
      {
        id: 2,
        name: 'Spotify',
        price: 10,
        currency: 'USD',
        billingCycle: 'monthly',
        category: 'entertainment',
        startDate: '2023-01-01',
        createdAt: '',
        updatedAt: '',
        description: '',
        workspaceId: 1,
        isFamilyPlan: false,
        icon: 'S',
        reminderEnabled: true,
        nextBillingDate: '2024-02-01',
        tags: [{ id: 1, name: 'Fun', color: 'red' } as Tag],
      },
      {
        id: 3,
        name: 'AWS',
        price: 1000,
        currency: 'TWD',
        billingCycle: 'yearly',
        category: 'other',
        startDate: '2023-01-01',
        createdAt: '',
        updatedAt: '',
        description: '',
        workspaceId: 1,
        isFamilyPlan: false,
        icon: 'A',
        reminderEnabled: true,
        nextBillingDate: '2024-02-01',
        tags: [{ id: 2, name: 'Work', color: 'blue' } as Tag],
      },
    ];

    const currency = 'TWD';
    const rates = { USD: 30, TWD: 1 };

    it('should calculate stats by Category (Metric: cost_monthly)', () => {
      const report: CustomReport = {
        id: 1,
        title: 'Test',
        chartType: 'pie',
        dimension: 'category',
        metric: 'cost_monthly',
        createdAt: '',
        updatedAt: '',
      };

      const result = reportService.executeReport(report, mockSubscriptions, currency, rates);

      // With rates = {USD: 30, TWD: 1}, getMonthlyValue calculates:
      // Netflix: 390 TWD (same currency, no conversion)
      // Spotify: (10 USD / 30) * 1 = 0.33 TWD (rates are inverse: 1 base = 30 USD)
      // AWS: 1000 TWD / 12 = 83.33 TWD
      // Entertainment: 390 + 0.33 = ~390
      // Other: 83.33

      // The result should be sorted by value desc
      expect(result.length).toBe(2);
      expect(result[0].label).toBe('entertainment');
      expect(Math.round(result[0].value)).toBe(390);
      expect(result[1].label).toBe('other');
      expect(Math.round(result[1].value)).toBe(83);
    });

    it('should calculate stats by Tag (Metric: count)', () => {
      const report: CustomReport = {
        id: 1,
        title: 'Test',
        chartType: 'bar',
        dimension: 'tag',
        metric: 'count',
        createdAt: '',
        updatedAt: '',
      };
      const result = reportService.executeReport(report, mockSubscriptions, currency, rates);

      // Fun: 2 (Netflix, Spotify)
      // Work: 1 (AWS)

      expect(result.length).toBe(2);
      // Sorted by value desc
      expect(result[0].label).toBe('Fun');
      expect(result[0].value).toBe(2);
      expect(result[1].label).toBe('Work');
      expect(result[1].value).toBe(1);
    });

    it('should calculate stats by Billing Cycle (Metric: count)', () => {
      const report: CustomReport = {
        id: 1,
        title: 'Test',
        chartType: 'bar',
        dimension: 'cycle',
        metric: 'count',
        createdAt: '',
        updatedAt: '',
      };
      const result = reportService.executeReport(report, mockSubscriptions, currency, rates);

      // monthly: 2
      // yearly: 1

      expect(result[0].label).toBe('monthly');
      expect(result[0].value).toBe(2);
      expect(result[1].label).toBe('yearly');
      expect(result[1].value).toBe(1);
    });

    it('should calculate stats by Cycle (Metric: cost_yearly)', () => {
      const report: CustomReport = {
        id: 1,
        title: 'Test',
        chartType: 'pie',
        dimension: 'cycle',
        metric: 'cost_yearly',
        createdAt: '',
        updatedAt: '',
      };
      const result = reportService.executeReport(report, mockSubscriptions, currency, rates);

      // With rates = {USD: 30, TWD: 1}:
      // Netflix: 390 * 12 = 4680 TWD
      // Spotify: 0.33 * 12 = 4 TWD
      // Total Monthly Cycle: 4684
      // AWS: 1000 (Yearly)

      expect(result[0].label).toBe('monthly');
      expect(result[0].value).toBe(4684);
      expect(result[1].label).toBe('yearly');
      expect(result[1].value).toBe(1000);
    });
  });
});
