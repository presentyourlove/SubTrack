module.exports = {
    open: jest.fn(() => ({
        execute: jest.fn().mockResolvedValue({ rows: [] }),
        executeBatch: jest.fn().mockResolvedValue(undefined),
        close: jest.fn(),
        transaction: jest.fn((fn) =>
            fn({
                execute: jest.fn().mockResolvedValue({ rows: [] }),
                executeBatch: jest.fn().mockResolvedValue(undefined),
            })
        ),
    })),
    OPSQLiteConnection: jest.fn(),
};
