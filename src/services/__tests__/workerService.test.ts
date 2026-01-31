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
      const items = Array.from({ length: 250 }, (_, i) => i);
      const processItem = (i: number) => i * 2;

      const promise = processInChunks(items, processItem);

      // Need to advance timers multiple times for chunks
      // Since it's recursive/loop based with await, we might need a loop or runAllTimersAsync if available,
      // but runAllTimers usually works if the chain is simple.
      // However, processInChunks awaits runOnWorker in a loop.

      // We'll advance timers enough times to cover all chunks
      // 250 items / 100 chunk size = 3 chunks.
      for (let i = 0; i < 3; i++) {
        await Promise.resolve(); // Let the microtask queue drain
        jest.runAllTimers(); // Trigger the setTimeout in runOnWorker
      }

      const results = await promise;

      expect(results).toHaveLength(250);
      expect(results[0]).toBe(0);
      expect(results[249]).toBe(498);
    });
  });
});
