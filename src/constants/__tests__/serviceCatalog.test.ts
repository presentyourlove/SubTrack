import {
    SERVICE_CATALOG,
    getServicesByCategory,
    searchServices,
    getServiceById,
} from '../serviceCatalog';

describe('serviceCatalog', () => {
    describe('SERVICE_CATALOG', () => {
        it('contains service templates', () => {
            expect(Array.isArray(SERVICE_CATALOG)).toBe(true);
            expect(SERVICE_CATALOG.length).toBeGreaterThan(0);
        });

        it('all services have required fields', () => {
            SERVICE_CATALOG.forEach((service) => {
                expect(service.id).toBeDefined();
                expect(service.name).toBeDefined();
                expect(service.icon).toBeDefined();
                expect(service.category).toBeDefined();
                expect(service.defaultCurrency).toBeDefined();
                expect(service.defaultBillingCycle).toBeDefined();
            });
        });

        it('has entertainment category services', () => {
            const entertainment = SERVICE_CATALOG.filter((s) => s.category === 'entertainment');
            expect(entertainment.length).toBeGreaterThan(0);
        });

        it('has productivity category services', () => {
            const productivity = SERVICE_CATALOG.filter((s) => s.category === 'productivity');
            expect(productivity.length).toBeGreaterThan(0);
        });

        it('has lifestyle category services', () => {
            const lifestyle = SERVICE_CATALOG.filter((s) => s.category === 'lifestyle');
            expect(lifestyle.length).toBeGreaterThan(0);
        });
    });

    describe('getServicesByCategory', () => {
        it('returns all services when category is "all"', () => {
            const all = getServicesByCategory('all');
            expect(all.length).toBe(SERVICE_CATALOG.length);
        });

        it('returns only entertainment services', () => {
            const entertainment = getServicesByCategory('entertainment');
            entertainment.forEach((s) => {
                expect(s.category).toBe('entertainment');
            });
        });

        it('returns only productivity services', () => {
            const productivity = getServicesByCategory('productivity');
            productivity.forEach((s) => {
                expect(s.category).toBe('productivity');
            });
        });

        it('returns only lifestyle services', () => {
            const lifestyle = getServicesByCategory('lifestyle');
            lifestyle.forEach((s) => {
                expect(s.category).toBe('lifestyle');
            });
        });

        it('returns only other services', () => {
            const other = getServicesByCategory('other');
            other.forEach((s) => {
                expect(s.category).toBe('other');
            });
        });
    });

    describe('searchServices', () => {
        it('finds Netflix by name', () => {
            const results = searchServices('Netflix');
            expect(results.length).toBeGreaterThanOrEqual(1);
            expect(results[0].name).toBe('Netflix');
        });

        it('finds services case insensitively', () => {
            const results = searchServices('netflix');
            expect(results.length).toBeGreaterThanOrEqual(1);
        });

        it('returns empty array for no match', () => {
            const results = searchServices('xxxxxxxxxx');
            expect(results.length).toBe(0);
        });

        it('finds by partial name', () => {
            const results = searchServices('Spot');
            expect(results.some((s) => s.name.includes('Spot'))).toBe(true);
        });

        it('returns all services for empty query', () => {
            const results = searchServices('');
            expect(results.length).toBe(SERVICE_CATALOG.length);
        });
    });

    describe('getServiceById', () => {
        it('finds Netflix by id', () => {
            const netflix = getServiceById('netflix');
            expect(netflix).toBeDefined();
            expect(netflix?.name).toBe('Netflix');
        });

        it('finds Spotify by id', () => {
            const spotify = getServiceById('spotify');
            expect(spotify).toBeDefined();
            expect(spotify?.name).toBe('Spotify');
        });

        it('returns undefined for non-existent id', () => {
            const result = getServiceById('nonexistent');
            expect(result).toBeUndefined();
        });
    });
});
