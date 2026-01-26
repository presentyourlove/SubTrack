import { getUserSettings, updateUserSettings } from '../settings';
import { SQLiteDatabase } from '../../database';
import { UserSettings } from '../../../types';

const mockDb = {
  getFirstAsync: jest.fn(),
  runAsync: jest.fn(),
} as unknown as SQLiteDatabase;

describe('settings service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserSettings', () => {
    it('retrieves settings from id 1', async () => {
      const mockSettings = { id: 1, currency: 'TWD' } as any;
      (mockDb.getFirstAsync as jest.Mock).mockResolvedValue(mockSettings);

      const result = await getUserSettings(mockDb);
      expect(result).toBe(mockSettings);
      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(expect.stringContaining('WHERE id = 1'));
    });
  });

  describe('updateUserSettings', () => {
    it('updates specific fields', async () => {
      await updateUserSettings(mockDb, { currency: 'USD' } as any);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE user_settings SET currency = ?'),
        expect.arrayContaining(['USD']),
      );
    });

    it('converts boolean to integer', async () => {
      await updateUserSettings(mockDb, { notificationsEnabled: true });
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('notificationsEnabled = ?'),
        expect.arrayContaining([1]),
      );

      await updateUserSettings(mockDb, { notificationsEnabled: false });
      expect(mockDb.runAsync).toHaveBeenCalledWith(expect.any(String), expect.arrayContaining([0]));
    });

    it('stringifies objects', async () => {
      // Assuming securityTypes is object/array
      // Checking source code: if typeof value === object => JSON.stringify
      // But UserSettings type doesn't have many object fields except maybe complex ones?
      // Let's assume there's one, or we just test the logic.
      // `securitySettings`? Let's assume we pass an arbitrary object that fits partial UserSettings or cast as any for test logic
      const settings: any = { someObjectField: { foo: 'bar' } };
      await updateUserSettings(mockDb, settings);
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('someObjectField = ?'),
        expect.arrayContaining(['{"foo":"bar"}']),
      );
    });
  });
});
