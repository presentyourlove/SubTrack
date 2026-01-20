import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSync } from '../useSync';
import * as syncService from '../../services/syncService';

// Mock syncService
jest.mock('../../services/syncService', () => ({
    uploadLocalDataToFirestore: jest.fn(),
    downloadFirestoreDataToLocal: jest.fn(),
}));

// Mock Database
jest.mock('../../services', () => ({
    Database: jest.fn(),
}));

const mockUpload = syncService.uploadLocalDataToFirestore as jest.Mock;
const mockDownload = syncService.downloadFirestoreDataToLocal as jest.Mock;

describe('useSync', () => {
    const mockUser = { uid: 'test-uid', email: 'test@test.com' };
    const mockDatabase = {} as any;
    const mockSubscriptions = [
        { id: '1', name: 'Netflix', price: 15.99 },
    ] as any[];
    const mockSettings = { currency: 'USD' } as any;
    const mockSetSubscriptions = jest.fn();
    const mockSetSettings = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockDownload.mockResolvedValue({
            subscriptions: [],
            settings: null,
        });
    });

    it('returns initial state correctly', () => {
        const { result } = renderHook(() =>
            useSync(
                false,
                null,
                null,
                [],
                null,
                mockSetSubscriptions,
                mockSetSettings,
            ),
        );

        expect(result.current.isOnline).toBe(true);
        expect(result.current.isSyncing).toBe(false);
        expect(result.current.lastSyncTime).toBeNull();
    });

    it('syncToCloud uploads data when authenticated', async () => {
        mockUpload.mockResolvedValue(undefined);

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
            await result.current.syncToCloud();
        });

        expect(mockUpload).toHaveBeenCalledWith(
            'test-uid',
            mockSubscriptions,
            mockSettings,
        );
        expect(result.current.lastSyncTime).not.toBeNull();
    });

    it('syncToCloud does nothing when not authenticated', async () => {
        const { result } = renderHook(() =>
            useSync(
                false,
                null,
                mockDatabase,
                mockSubscriptions,
                mockSettings,
                mockSetSubscriptions,
                mockSetSettings,
            ),
        );

        await act(async () => {
            await result.current.syncToCloud();
        });

        expect(mockUpload).not.toHaveBeenCalled();
    });

    it('syncFromCloud downloads and sets data', async () => {
        const cloudData = {
            subscriptions: [{ id: '2', name: 'Spotify' }],
            settings: { currency: 'EUR' },
        };
        mockDownload.mockResolvedValue(cloudData);

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
            await result.current.syncFromCloud();
        });

        expect(mockDownload).toHaveBeenCalledWith('test-uid');
        expect(mockSetSubscriptions).toHaveBeenCalledWith(cloudData.subscriptions);
        expect(mockSetSettings).toHaveBeenCalledWith(cloudData.settings);
    });

    it('syncFromCloud does nothing when not authenticated', async () => {
        const { result } = renderHook(() =>
            useSync(
                false,
                null,
                mockDatabase,
                mockSubscriptions,
                mockSettings,
                mockSetSubscriptions,
                mockSetSettings,
            ),
        );

        // Clear initial call from useEffect
        mockDownload.mockClear();

        await act(async () => {
            await result.current.syncFromCloud();
        });

        expect(mockDownload).not.toHaveBeenCalled();
    });

    it('triggerSync sets needsSync and schedules sync', async () => {
        jest.useFakeTimers();

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

        act(() => {
            result.current.triggerSync();
        });

        // Fast-forward past debounce time
        await act(async () => {
            jest.advanceTimersByTime(6000);
        });

        jest.useRealTimers();
    });

    it('handles syncToCloud error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockUpload.mockRejectedValue(new Error('Upload failed'));

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
            await result.current.syncToCloud();
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to sync to cloud:',
            expect.any(Error),
        );
        consoleSpy.mockRestore();
    });

    it('handles syncFromCloud error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        mockDownload.mockRejectedValue(new Error('Download failed'));

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
            await result.current.syncFromCloud();
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            'Failed to sync from cloud:',
            expect.any(Error),
        );
        consoleSpy.mockRestore();
    });
});
