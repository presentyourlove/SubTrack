import { MMKV } from 'react-native-mmkv';
import { Persistence } from 'firebase/auth';

export const storage = new MMKV();

/**
 * MMKV adapter for Firebase Auth Persistence.
 * Maps AsyncStorage-like API to MMKV (which is synchronous).
 */
export const mmkvPersistence: Persistence = {
    type: 'LOCAL',
    _isAvailable: async () => true,
    _setPersistence: async () => { },
    _shouldAllowMigration: async () => true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addListener: (eventName: string, callback: any) => {
        // MMKV doesn't support listeners for specific keys in the same way,
        // but Firebase Auth likely uses this for state changes.
        // For simple persistence, this might not be critical or needs a mock.
        // However, the official interface expects it.
        // We can leave it empty or implement a basic event emitter if needed.
        return { remove: () => { } }; // Mock listener
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener: (eventName: string, callback: any) => { },
};

// Helper object to match React Native AsyncStorage interface for Firebase
export const mmkvStorageAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        const value = storage.getString(key);
        return value ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
        storage.set(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        storage.delete(key);
    },
};
