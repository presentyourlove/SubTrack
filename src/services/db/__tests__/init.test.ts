import { initDatabase } from '../init';
import { open } from '@op-engineering/op-sqlite';
import { wrapDatabase } from '../adapter';

// Mock dependencies
jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(),
}));

jest.mock('../adapter', () => ({
  wrapDatabase: jest.fn(),
}));

describe('Database Initialization', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockNativeDb: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockNativeDb = {};
    (open as jest.Mock).mockReturnValue(mockNativeDb);

    mockDb = {
      execAsync: jest.fn().mockResolvedValue(undefined),
      runAsync: jest.fn().mockResolvedValue(undefined),
      getFirstAsync: jest.fn(),
    };
    (wrapDatabase as jest.Mock).mockReturnValue(mockDb);
  });

  it('should initialize database and tables on first run', async () => {
    // Mock getFirstAsync to return null (no existing settings/workspaces)
    mockDb.getFirstAsync.mockResolvedValue(null);

    await initDatabase();

    // Verify WAL mode enable
    expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA journal_mode = WAL;');

    // Verify table creation
    expect(mockDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS subscriptions'),
    );
    expect(mockDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS user_settings'),
    );
    expect(mockDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('CREATE TABLE IF NOT EXISTS tags'),
    );

    // Verify default data insertion
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO workspaces'),
      expect.any(Array),
    );
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_settings'),
      expect.any(Array),
    );
  });

  it('should not insert default data if already exists', async () => {
    // Mock getFirstAsync to return existing data
    mockDb.getFirstAsync.mockImplementation((query: string) => {
      if (query.includes('workspaces')) return Promise.resolve({ id: 1 });
      if (query.includes('user_settings')) return Promise.resolve({ id: 1 });
      return Promise.resolve(null);
    });

    await initDatabase();

    // Should NOT insert
    expect(mockDb.runAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO workspaces'),
      expect.any(Array),
    );
    expect(mockDb.runAsync).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_settings'),
      expect.any(Array),
    );
  });

  it('should run migrations if settings exist', async () => {
    // Mock settings exist
    mockDb.getFirstAsync.mockImplementation((query: string) => {
      if (query.includes('user_settings')) return Promise.resolve({ id: 1 });
      return Promise.resolve({ id: 1 }); // Workspace also exists
    });

    await initDatabase();

    // Should run ALTER TABLE commands
    // We expect multiple calls to execAsync with ALTER TABLE
    // Just check a few key migrations
    expect(mockDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE user_settings ADD COLUMN notificationsEnabled'),
    );
    expect(mockDb.execAsync).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE subscriptions ADD COLUMN calendarEventId'),
    );
  });

  it('should handle migration errors gracefully (idempotency)', async () => {
    // Mock settings exist
    mockDb.getFirstAsync.mockResolvedValue({ id: 1 });

    // Mock execAsync to fail on specific migration (simulating column already exists)
    mockDb.execAsync.mockImplementation((sql: string) => {
      if (sql.includes('ALTER TABLE')) {
        return Promise.reject(new Error('duplicate column name'));
      }
      return Promise.resolve();
    });

    // Should not throw
    await expect(initDatabase()).resolves.not.toThrow();
  });

  it('handles WAL mode failure gracefully', async () => {
    mockDb.getFirstAsync.mockResolvedValue(null);

    // Fail on first execAsync (PRAGMA)
    mockDb.execAsync.mockRejectedValueOnce(new Error('WAL setup failed'));

    // Should verify it caught error and proceeded
    // (Depending on implementation, if it doesn't throw, it's good)
    // The implementation catches and logs error.
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await initDatabase();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to enable WAL mode:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});
