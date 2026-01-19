// @ts-expect-error: react-native-multithreading might not have type definitions
import { spawnThread } from 'react-native-multithreading';
import { Platform } from 'react-native';

/**
 * 多執行緒運算服務 (Worker Service)
 * 提供統一的運算分分流介面
 */

/**
 * 在背景執行緒執行任務
 * @param task 欲執行的運算密集型函式
 * @returns 任務執行結果
 */
export async function runOnWorker<T>(task: () => T): Promise<T> {
  if (Platform.OS === 'web') {
    // Web 端回退至 Promise 或 Web Workers (若有必要)
    // 目前先簡單使用非同步執行，後續可擴充為專用的 Web Worker
    return new Promise((resolve, reject) => {
      try {
        resolve(task());
      } catch (error) {
        reject(error);
      }
    });
  }

  // Native 端使用 JSI Multithreading
  try {
    return await spawnThread(() => {
      'worklet';
      return task();
    });
  } catch (error) {
    console.error('Worker thread error:', error);
    // 降級處理：若執行緒失敗，回退至主執行緒執行
    return task();
  }
}

/**
 * 分批處理資料 (Chunking) 以維持 UI 順暢
 * @param items 待處理清單
 * @param processItem 處理單個項目的函式
 * @param onProgress 進度回報回呼
 * @returns 處理後的結果清單
 */
export async function processInChunks<T, R>(
  items: T[],
  processItem: (item: T) => R,
  onProgress?: (progress: number) => void,
): Promise<R[]> {
  const CHUNK_SIZE = 100;
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);

    // 將每個 chunk 的運算移至背景
    const chunkResults = await runOnWorker(() => {
      return chunk.map(processItem);
    });

    results.push(...chunkResults);

    if (onProgress) {
      onProgress(Math.min(((i + CHUNK_SIZE) / total) * 100, 100));
    }
  }

  return results;
}
