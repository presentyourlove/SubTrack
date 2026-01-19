import { getMonthlyTotal, getYearlyTotal, getUpcomingSubscriptions } from '../stats';
import { SQLiteDatabase } from '../../database';

const mockDb = {
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
} as unknown as SQLiteDatabase;

describe('stats service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMonthlyTotal', () => {
    it('executes aggregation query', async () => {
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValue({ total: 500 });
      const result = await getMonthlyTotal(mockDb, 'TWD');
      expect(result).toBe(500);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('SUM'), ['TWD']);
    });

    it('returns 0 if null result', async () => {
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValue(null);
      const result = await getMonthlyTotal(mockDb);
      expect(result).toBe(0);
    });

    it('filters by workspaceId', async () => {
      await getMonthlyTotal(mockDb, 'TWD', 5);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('workspaceId = ?'),
        ['TWD', 5],
      );
    });
  });

  describe('getYearlyTotal', () => {
    it('executes aggregation query', async () => {
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValue({ total: 6000 });
      const result = await getYearlyTotal(mockDb);
      expect(result).toBe(6000);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('SUM'), ['TWD']);
    });
  });

  describe('getUpcomingSubscriptions', () => {
    it('queries for future dates', async () => {
      await getUpcomingSubscriptions(mockDb, 7);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('nextBillingDate <= ?'),
        expect.any(Array),
      );
    });

    it('filters by workspaceId', async () => {
      await getUpcomingSubscriptions(mockDb, 7, 2);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('workspaceId = ?'),
        expect.arrayContaining([2]),
      );
    });
  });
});
