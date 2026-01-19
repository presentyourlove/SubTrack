import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTagsForSubscription,
  setTagsForSubscription,
  addTagToSubscription,
  removeTagFromSubscription,
  getSubscriptionIdsByTag,
  getSubscriptionIdsByTags,
} from '../tags';
import { SQLiteDatabase } from '../../database';
import { Tag } from '../../../types';

const mockDb = {
  getAllAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  runAsync: jest.fn(),
} as unknown as SQLiteDatabase;

describe('tags service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTags', () => {
    it('gets all tags', async () => {
      const tags: Tag[] = [{ id: 1, name: 'Fun', color: 'red' }];
      (mockDb.getAllAsync as jest.Mock).mockResolvedValue(tags);

      const result = await getAllTags(mockDb);
      expect(result).toBe(tags);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM tags'),
      );
    });
  });

  describe('getTagById', () => {
    it('gets tag by id', async () => {
      const tag: Tag = { id: 1, name: 'Fun', color: 'red' };
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValue(tag);

      const result = await getTagById(mockDb, 1);
      expect(result).toBe(tag);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = ?'),
        [1],
      );
    });

    it('returns null if not found', async () => {
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValue(null);
      const result = await getTagById(mockDb, 99);
      expect(result).toBeNull();
    });
  });

  describe('createTag', () => {
    it('creates tag', async () => {
      (mockDb.runAsync as jest.Mock).mockResolvedValue({ lastInsertRowId: 5 });
      const id = await createTag(mockDb, 'New Tag', 'blue');
      expect(id).toBe(5);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO tags'),
        expect.arrayContaining(['New Tag', 'blue']),
      );
    });
  });

  describe('updateTag', () => {
    it('updates name and color', async () => {
      await updateTag(mockDb, 1, { name: 'Updated', color: 'green' });
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE tags SET name = ?, color = ?'),
        expect.arrayContaining(['Updated', 'green', 1]),
      );
    });

    it('does nothing if no updates', async () => {
      await updateTag(mockDb, 1, {});
      expect(mockDb.runAsync).not.toHaveBeenCalled();
    });
  });

  describe('deleteTag', () => {
    it('deletes tag', async () => {
      await deleteTag(mockDb, 1);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM tags'),
        [1],
      );
    });
  });

  describe('Subscription Tags', () => {
    it('getTagsForSubscription', async () => {
      await getTagsForSubscription(mockDb, 10);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(expect.stringContaining('FROM tags t'), [10]);
    });

    it('setTagsForSubscription replaces tags', async () => {
      await setTagsForSubscription(mockDb, 10, [1, 2]);
      // Should delete old tags first
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM subscription_tags'),
        [10],
      );
      // Then insert new ones
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO subscription_tags'),
        [10, 1],
      );
    });

    it('addTagToSubscription ignores existing', async () => {
      await addTagToSubscription(mockDb, 10, 5);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR IGNORE'),
        [10, 5],
      );
    });

    it('removeTagFromSubscription deletes relation', async () => {
      await removeTagFromSubscription(mockDb, 10, 5);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM subscription_tags'),
        [10, 5],
      );
    });

    it('getSubscriptionIdsByTag returns ids', async () => {
      (mockDb.getAllAsync as jest.Mock).mockResolvedValue([
        { subscriptionId: 1 },
        { subscriptionId: 2 },
      ]);
      const result = await getSubscriptionIdsByTag(mockDb, 5);
      expect(result).toEqual([1, 2]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT subscriptionId FROM subscription_tags WHERE tagId = ?'),
        [5],
      );
    });

    it('getSubscriptionIdsByTags returns intersection', async () => {
      (mockDb.getAllAsync as jest.Mock).mockResolvedValue([{ subscriptionId: 1 }]);
      const result = await getSubscriptionIdsByTags(mockDb, [5, 6]);
      expect(result).toEqual([1]);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('HAVING COUNT(DISTINCT tagId) = ?'),
        [5, 6, 2], // tagIds + count
      );
    });

    it('getSubscriptionIdsByTags returns empty for empty input', async () => {
      const result = await getSubscriptionIdsByTags(mockDb, []);
      expect(result).toEqual([]);
      expect(mockDb.getAllAsync).not.toHaveBeenCalled();
    });
  });
});
