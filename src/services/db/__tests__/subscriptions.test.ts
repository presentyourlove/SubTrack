import {
  getAllSubscriptions,
  getSubscriptionsByCategory,
  addSubscription,
  updateSubscription,
  deleteSubscription,
} from '../subscriptions';
import { SQLiteDatabase } from '../../database';
import { Subscription } from '../../../types';

// Mock database
const mockDb = {
  getAllAsync: jest.fn(),
  runAsync: jest.fn(),
} as unknown as SQLiteDatabase;

describe('subscriptions service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockSubscription: Subscription = {
    id: 1,
    name: 'Netflix',
    icon: 'N',
    category: 'entertainment',
    price: 390,
    currency: 'TWD',
    billingCycle: 'monthly',
    startDate: '2023-01-01',
    nextBillingDate: '2024-02-01',
    reminderEnabled: true,
    createdAt: '',
    updatedAt: '',
    workspaceId: 1,
  };

  describe('getAllSubscriptions', () => {
    it('gets all subscriptions ordered by nextBillingDate', async () => {
      (mockDb.getAllAsync as jest.Mock).mockResolvedValue([mockSubscription]);

      const result = await getAllSubscriptions(mockDb);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY nextBillingDate ASC'),
        expect.any(Array),
      );
      expect(result).toEqual([mockSubscription]);
    });

    it('filters by workspaceId if provided', async () => {
      await getAllSubscriptions(mockDb, 2);

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE workspaceId = ?'),
        [2],
      );
    });
  });

  describe('getSubscriptionsByCategory', () => {
    it('filters by category', async () => {
      await getSubscriptionsByCategory(mockDb, 'entertainment');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = ?'),
        ['entertainment'],
      );
    });
  });

  describe('addSubscription', () => {
    it('inserts subscription and returns id', async () => {
      (mockDb.runAsync as jest.Mock).mockResolvedValue({ lastInsertRowId: 10 });
      const newSub = { ...mockSubscription };
      // @ts-ignore
      delete newSub.id;
      // @ts-ignore
      delete newSub.createdAt;
      // @ts-ignore
      delete newSub.updatedAt;

      const id = await addSubscription(mockDb, newSub);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO subscriptions'),
        expect.any(Array),
      );
      expect(id).toBe(10);
    });
  });

  describe('updateSubscription', () => {
    it('updates specified fields', async () => {
      await updateSubscription(mockDb, 1, { price: 400 });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE subscriptions SET price = ?'),
        expect.arrayContaining([400, 1]), // 400, now, id
      );
    });

    it('updates multiple fields', async () => {
      await updateSubscription(mockDb, 1, { price: 400, name: 'Netflix Premium' });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('price = ?, name = ?'),
        expect.arrayContaining([400, 'Netflix Premium']),
      );
    });
  });

  describe('deleteSubscription', () => {
    it('deletes by id', async () => {
      await deleteSubscription(mockDb, 5);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM subscriptions WHERE id = ?'),
        [5],
      );
    });
  });
});
