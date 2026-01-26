import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { DatabaseProvider, useDatabase } from '../DatabaseContext';
import * as dbServices from '../../services';
import * as tagDb from '../../services/db/tags';
import * as workspaceDb from '../../services/db/workspaces';
import * as reportDb from '../../services/db/reports';
import * as syncService from '../../services/syncService';
import { useAuth } from '../AuthContext';

// Mock Dependencies
jest.mock('../AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../services', () => ({
  initializeDatabase: jest.fn(),
  getAllSubscriptions: jest.fn(),
  getUserSettings: jest.fn(),
  addSubscription: jest.fn(),
  updateSubscription: jest.fn(),
  deleteSubscription: jest.fn(),
  updateUserSettings: jest.fn(),
}));

jest.mock('../../services/db/tags', () => ({
  getAllTags: jest.fn(),
  createTag: jest.fn(),
  deleteTag: jest.fn(),
  getTagsForSubscription: jest.fn(),
  setTagsForSubscription: jest.fn(),
}));

jest.mock('../../services/db/workspaces', () => ({
  getWorkspaces: jest.fn(),
  createWorkspace: jest.fn(),
  updateWorkspace: jest.fn(),
  deleteWorkspace: jest.fn(),
  switchWorkspace: jest.fn(),
}));

jest.mock('../../services/db/reports', () => ({
  createReport: jest.fn(),
  getReports: jest.fn(),
  deleteReport: jest.fn(),
}));

jest.mock('../../services/syncService', () => ({
  syncSubscriptionToFirestore: jest.fn(),
  syncUserSettingsToFirestore: jest.fn(),
  deleteSubscriptionFromFirestore: jest.fn(),
}));

jest.mock('../../hooks/useSync', () => ({
  useSync: () => ({
    isOnline: true,
    isSyncing: false,
    lastSyncTime: null,
    syncToCloud: jest.fn(),
    syncFromCloud: jest.fn(),
    triggerSync: jest.fn(),
  }),
}));

const mockDb = { transaction: jest.fn() };
const mockSubscriptions = [
  {
    id: 1,
    name: 'Netflix',
    price: 100,
    billingCycle: 'monthly',
    currency: 'TWD',
    startDate: '2023-01-01',
  },
];
const mockSettings = { mainCurrency: 'TWD', currentWorkspaceId: 1, language: 'en' };
const mockWorkspaces = [{ id: 1, name: 'Personal', icon: 'person' }];
const mockTags = [{ id: 1, name: 'Entertainment', color: '#ff0000' }];

describe('DatabaseContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default Mock Implementations
    (useAuth as jest.Mock).mockReturnValue({ user: null, isAuthenticated: false });
    (dbServices.initializeDatabase as jest.Mock).mockResolvedValue(mockDb);
    (dbServices.getAllSubscriptions as jest.Mock).mockResolvedValue(mockSubscriptions);
    (dbServices.getUserSettings as jest.Mock).mockResolvedValue(mockSettings);
    (tagDb.getAllTags as jest.Mock).mockResolvedValue(mockTags);
    (workspaceDb.getWorkspaces as jest.Mock).mockResolvedValue(mockWorkspaces);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DatabaseProvider>{children}</DatabaseProvider>
  );

  it('initializes and loads data correctly', async () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.database).toBe(mockDb);
    expect(result.current.subscriptions).toEqual(mockSubscriptions);
    expect(result.current.settings).toEqual(mockSettings);
    expect(result.current.tags).toEqual(mockTags);
  });

  it('adds a subscription and syncs if authenticated', async () => {
    const mockUser = { uid: 'test-user' };
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser, isAuthenticated: true });

    // Mock addSubscription returning new ID
    (dbServices.addSubscription as jest.Mock).mockResolvedValue(2);
    // Mock getAllSubscriptions after add to return new list
    const newSubs = [...mockSubscriptions, { id: 2, name: 'Spotify', price: 150 }];
    (dbServices.getAllSubscriptions as jest.Mock).mockResolvedValue(newSubs);

    const { result } = renderHook(() => useDatabase(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addSubscription({
        name: 'Spotify',
        price: 150,
        currency: 'TWD',
        billingCycle: 'monthly',
        startDate: '2023-01-01',
        description: '',
        category: 'entertainment',
      } as any);
    });

    expect(dbServices.addSubscription).toHaveBeenCalled();
    expect(syncService.syncSubscriptionToFirestore).toHaveBeenCalled();
    expect(result.current.subscriptions).toHaveLength(2);
  });

  it('updates a subscription', async () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateSubscription(1, { price: 120 });
    });

    expect(dbServices.updateSubscription).toHaveBeenCalledWith(
      mockDb,
      1,
      expect.objectContaining({ price: 120 }),
    );
  });

  it('deletes a subscription', async () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteSubscription(1);
    });

    expect(dbServices.deleteSubscription).toHaveBeenCalledWith(mockDb, 1);
  });

  it('creates a workspace', async () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createWorkspace('New Workspace', 'briefcase');
    });

    expect(workspaceDb.createWorkspace).toHaveBeenCalledWith(mockDb, 'New Workspace', 'briefcase');
  });

  it('creates a tag', async () => {
    const { result } = renderHook(() => useDatabase(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    (tagDb.createTag as jest.Mock).mockResolvedValue(3);

    await act(async () => {
      const id = await result.current.createTag('New Tag', '#000');
      expect(id).toBe(3);
    });

    expect(tagDb.createTag).toHaveBeenCalledWith(mockDb, 'New Tag', '#000');
  });
});
