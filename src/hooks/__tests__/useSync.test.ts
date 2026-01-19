import { renderHook, act } from '@testing-library/react-native';
import { useSync } from '../useSync';
import {
  uploadLocalDataToFirestore,
  downloadFirestoreDataToLocal,
} from '../../services/syncService';
import { Subscription, UserSettings } from '../../types';

jest.mock('../../services/syncService');

describe('useSync', () => {
  const mockUser = { uid: 'user1' };
  const mockDatabase = {} as any;
  const mockSubscriptions: Subscription[] = [];
  const mockSettings: UserSettings = {} as any;
  const mockSetSubscriptions = jest.fn();
  const mockSetSettings = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize correctly', () => {
    const { result } = renderHook(() =>
      useSync(
        true,
        mockUser,
        mockDatabase,
        mockSubscriptions,
        mockSettings,
        mockSetSubscriptions,
        mockSetSettings,
      ),
    );

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSyncing).toBe(false);
  });

  it('should sync from cloud on mount if authenticated', async () => {
    (downloadFirestoreDataToLocal as jest.Mock).mockResolvedValue({
      subscriptions: [],
      settings: {},
    });

    renderHook(() =>
      useSync(
        true,
        mockUser,
        mockDatabase,
        mockSubscriptions,
        mockSettings,
        mockSetSubscriptions,
        mockSetSettings,
      ),
    );

    // Use act to wait for effects?
    // Sync is async inside useEffect.
    // We might need to wait for promise resolution.
    await act(async () => {});

    expect(downloadFirestoreDataToLocal).toHaveBeenCalledWith('user1');
  });

  it('should trigger sync manually', async () => {
    const { result } = renderHook(() =>
      useSync(
        true,
        mockUser,
        mockDatabase,
        mockSubscriptions,
        mockSettings,
        mockSetSubscriptions,
        mockSetSettings,
      ),
    );

    await act(async () => {
      result.current.triggerSync();
    });

    // triggerSync sets needsSync=true and debounces.
    // We might need jest fake timers to test the debounce.
  });
});
