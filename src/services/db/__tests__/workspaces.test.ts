import { Workspace } from '../../../types';
import * as workspaceService from '../workspaces';

// Mock DB
const mockDb = {
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

describe('Workspace Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get all workspaces', async () => {
    const mockWorkspaces: Workspace[] = [
      { id: 1, name: 'Personal', icon: '🏠', isDefault: true, createdAt: '', updatedAt: '' },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockWorkspaces);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await workspaceService.getWorkspaces(mockDb as any);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM workspaces'),
    );
    expect(result).toEqual(mockWorkspaces);
  });

  it('should create a workspace', async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 2 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = await workspaceService.createWorkspace(mockDb as any, 'Work', '💼');

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO workspaces'),
      expect.arrayContaining(['Work', '💼']),
    );
    expect(id).toBe(2);
  });

  it('should update a workspace', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workspaceService.updateWorkspace(mockDb as any, 2, 'Office', '🏢');

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE workspaces SET name = ?, icon = ?'),
      expect.arrayContaining(['Office', '🏢', 2]),
    );
  });

  it('should delete a workspace', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workspaceService.deleteWorkspace(mockDb as any, 2);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM workspaces'),
      [2],
    );
  });

  it('should NOT delete default workspace', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await expect(workspaceService.deleteWorkspace(mockDb as any, 1)).rejects.toThrow(
      'Cannot delete default workspace',
    );
  });

  it('should switch workspace', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workspaceService.switchWorkspace(mockDb as any, 2);

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE user_settings SET currentWorkspaceId = ?'),
      expect.arrayContaining([2]),
    );
  });
});
