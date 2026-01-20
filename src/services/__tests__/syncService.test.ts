import {
    syncSubscriptionToFirestore,
    getSubscriptionsFromFirestore,
    deleteSubscriptionFromFirestore,
    syncUserSettingsToFirestore,
    getUserSettingsFromFirestore,
    uploadLocalDataToFirestore,
    downloadFirestoreDataToLocal,
} from '../syncService';

// Defining mocks at the top level with 'mock' prefix so they can be used in jest.mock
const mockSetDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockDeleteDoc = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockOrderBy = jest.fn();
const mockTimestamp = { now: jest.fn(() => ({ toDate: () => new Date() })) };

jest.mock('firebase/firestore', () => {
    return {
        doc: (...args: any[]) => mockDoc(...args),
        setDoc: (...args: any[]) => mockSetDoc(...args),
        getDoc: (...args: any[]) => mockGetDoc(...args),
        getDocs: (...args: any[]) => mockGetDocs(...args),
        deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
        collection: (...args: any[]) => mockCollection(...args),
        query: (...args: any[]) => mockQuery(...args),
        orderBy: (...args: any[]) => mockOrderBy(...args),
        Timestamp: {
            now: () => ({ toDate: () => new Date() })
        }
    };
});

jest.mock('../firebaseConfig', () => ({
    db: { type: 'mock-db' },
}));

describe('syncService', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default implementations to avoid "is not a function" if not specifically set in a test
        mockDoc.mockReturnValue({ id: 'mock-doc-id' });
        mockCollection.mockReturnValue({ id: 'mock-collection-id' });
        mockQuery.mockReturnValue({ id: 'mock-query-id' });
        mockGetDocs.mockResolvedValue({ docs: [] });
        mockGetDoc.mockResolvedValue({ exists: () => false });
    });

    describe('syncSubscriptionToFirestore', () => {
        it('syncs subscription to Firestore', async () => {
            const subscription = {
                id: 1,
                name: 'Netflix',
                price: 15.99,
            } as any;

            await syncSubscriptionToFirestore('user123', subscription);

            expect(mockDoc).toHaveBeenCalled();
            expect(mockSetDoc).toHaveBeenCalled();
        });
    });

    describe('getSubscriptionsFromFirestore', () => {
        it('returns mapped subscriptions from Firestore', async () => {
            mockGetDocs.mockResolvedValue({
                docs: [
                    {
                        id: '1',
                        data: () => ({
                            name: 'Netflix',
                            price: 15.99,
                            createdAt: { toDate: () => new Date('2026-01-01') },
                            updatedAt: { toDate: () => new Date('2026-01-01') },
                        }),
                    },
                ],
            });

            const result = await getSubscriptionsFromFirestore('user123');

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
            expect(result[0].name).toBe('Netflix');
        });
    });

    describe('deleteSubscriptionFromFirestore', () => {
        it('deletes subscription from Firestore', async () => {
            await deleteSubscriptionFromFirestore('user123', 1);

            expect(mockDoc).toHaveBeenCalled();
            expect(mockDeleteDoc).toHaveBeenCalled();
        });
    });

    describe('syncUserSettingsToFirestore', () => {
        it('syncs user settings to Firestore', async () => {
            const settings = {
                id: 1,
                mainCurrency: 'TWD',
                theme: 'dark',
            } as any;

            await syncUserSettingsToFirestore('user123', settings);

            expect(mockSetDoc).toHaveBeenCalled();
        });
    });

    describe('getUserSettingsFromFirestore', () => {
        it('returns settings when exists', async () => {
            mockGetDoc.mockResolvedValue({
                exists: () => true,
                data: () => ({
                    mainCurrency: 'USD',
                    theme: 'light',
                    createdAt: { toDate: () => new Date('2026-01-01') },
                    updatedAt: { toDate: () => new Date('2026-01-01') },
                }),
            });

            const result = await getUserSettingsFromFirestore('user123');

            expect(result).toBeDefined();
            expect(result?.mainCurrency).toBe('USD');
        });

        it('creates default settings when not exists', async () => {
            mockGetDoc.mockResolvedValue({
                exists: () => false,
            });

            const result = await getUserSettingsFromFirestore('user123');

            expect(result).toBeDefined();
            expect(result?.mainCurrency).toBe('TWD');
            expect(mockSetDoc).toHaveBeenCalled();
        });
    });

    describe('uploadLocalDataToFirestore', () => {
        it('uploads all data', async () => {
            const subscriptions = [{ id: 1, name: 'Netflix' }] as any[];
            const settings = { id: 1, mainCurrency: 'TWD' } as any;

            await uploadLocalDataToFirestore('user123', subscriptions, settings);

            expect(mockSetDoc).toHaveBeenCalledTimes(2);
        });
    });

    describe('downloadFirestoreDataToLocal', () => {
        it('downloads all data', async () => {
            mockGetDocs.mockResolvedValue({ docs: [] });
            mockGetDoc.mockResolvedValue({ exists: () => false });

            const result = await downloadFirestoreDataToLocal('user123');

            expect(result.subscriptions).toEqual([]);
            expect(result.settings).toBeDefined();
        });
    });
});
