import { Platform } from 'react-native';
import { runOnWorker, processInChunks } from '../workerService';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { spawnThread } from 'react-native-multithreading';

jest.mock('react-native-multithreading', () => ({
  spawnThread: jest.fn(),
}));

describe('workerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  describe('runOnWorker', () => {
    it('should run synchronously on web', async () => {
      Platform.OS = 'web';
      const task = jest.fn().mockReturnValue('result');
      const result = await runOnWorker(task);
      expect(result).toBe('result');
      expect(task).toHaveBeenCalled();
    });

    it('should run via spawnThread on native', async () => {
      (spawnThread as jest.Mock).mockImplementation((fn) => fn());
      const task = jest.fn().mockReturnValue('result');
      const result = await runOnWorker(task);
      expect(result).toBe('result');
      expect(spawnThread).toHaveBeenCalled();
    });

    it('should fallback to main thread on error', async () => {
      (spawnThread as jest.Mock).mockRejectedValue(new Error('Thread error'));
      const task = jest.fn().mockReturnValue('fallback result');
      const result = await runOnWorker(task);
      expect(result).toBe('fallback result');
    });
  });

  describe('processInChunks', () => {
    it('should process items in chunks', async () => {
      const items = Array.from({ length: 250 }, (_, i) => i);
      const processItem = (i: number) => i * 2;

      // Mock runOnWorker to verify chunking
      (spawnThread as jest.Mock).mockImplementation((fn) => fn());

      const results = await processInChunks(items, processItem);

      expect(results).toHaveLength(250);
      expect(results[0]).toBe(0);
      expect(results[249]).toBe(498);
      // 250 items, chunk size 100 -> 3 calls (100, 100, 50)
      expect(spawnThread).toHaveBeenCalledTimes(3);
    });
  });
});
