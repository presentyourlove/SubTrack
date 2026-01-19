import { Member } from '../../../types';
import { SQLiteDatabase } from '../../database';
import * as memberService from '../members';

// Mock DB
const mockDb = {
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
};

describe('Member Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should add a member', async () => {
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1 });
    const id = await memberService.addMember(mockDb as unknown as SQLiteDatabase, 1, 'Test Member');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO subscription_members'),
      expect.arrayContaining([1, 'Test Member']),
    );
    expect(id).toBe(1);
  });

  it('should get members', async () => {
    const mockMembers: Member[] = [
      {
        id: 1,
        subscriptionId: 1,
        name: 'Member 1',
        status: 'unpaid',
        createdAt: '',
        updatedAt: '',
      },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockMembers);
    const members = await memberService.getMembers(mockDb as unknown as SQLiteDatabase, 1);
    expect(mockDb.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('SELECT * FROM subscription_members'),
      [1],
    );
    expect(members).toEqual(mockMembers);
  });

  it('should update member status', async () => {
    await memberService.updateMemberStatus(mockDb as unknown as SQLiteDatabase, 1, 'paid');
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE subscription_members'),
      expect.arrayContaining(['paid']),
    );
  });

  it('should delete member', async () => {
    await memberService.deleteMember(mockDb as unknown as SQLiteDatabase, 1);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM subscription_members'),
      [1],
    );
  });

  it('should sync member count (add missing)', async () => {
    // Mock existing members (0)
    mockDb.getAllAsync.mockResolvedValue([]);
    await memberService.syncMemberCount(mockDb as unknown as SQLiteDatabase, 1, 2);

    // Should call addMember 2 times
    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
  });

  it('should sync member count (remove extra)', async () => {
    // Mock existing members (3)
    const mockMembers: Member[] = [
      { id: 1, subscriptionId: 1, name: 'M1', status: 'unpaid', createdAt: '', updatedAt: '' },
      { id: 2, subscriptionId: 1, name: 'M2', status: 'unpaid', createdAt: '', updatedAt: '' },
      { id: 3, subscriptionId: 1, name: 'M3', status: 'unpaid', createdAt: '', updatedAt: '' },
    ];
    mockDb.getAllAsync.mockResolvedValue(mockMembers);

    await memberService.syncMemberCount(mockDb as unknown as SQLiteDatabase, 1, 1);

    // Should delete 2 members (id 2 and 3)
    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM subscription_members'),
      [2],
    );
  });
});
