// Mock for react-native-multithreading
module.exports = {
    spawnThread: jest.fn((fn) => Promise.resolve(fn())),
};
