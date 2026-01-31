/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { Platform } from 'react-native';
import { runOnWorker, processInChunks } from '../workerService';

describe('workerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Platform as any).OS = 'ios';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('runOnWorker', () => {
    it('should run asynchronously using setTimeout', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Platform as any).OS = 'web';
      const task = jest.fn().mockReturnValue('result');

      const promise = runOnWorker(task);

      // Fast-forward time to trigger setTimeout
      jest.runAllTimers();

      const result = await promise;

      expect(result).toBe('result');
      expect(task).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
      const error = new Error('Task failed');
      const task = jest.fn().mockImplementation(() => {
        throw error;
      });

      const promise = runOnWorker(task);

      jest.runAllTimers();

      await expect(promise).rejects.toThrow('Task failed');
    });
  });

  describe('processInChunks', () => {
    it('should process items in chunks', async () => {
      jest.useRealTimers();
      const items = Array.from({ length: 250 }, (_, i) => i);
      const processItem = (i: number) => i * 2;

      const results = await processInChunks(items, processItem);

      expect(results).toHaveLength(250);
      expect(results[0]).toBe(0);
      expect(results[249]).toBe(498);
    });
  });
});
