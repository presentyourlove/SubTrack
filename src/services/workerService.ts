// import { spawnThread } from 'react-native-multithreading';
// import { Platform } from 'react-native';

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
  // 暫時移除 react-native-multithreading，因为它在 RN 0.74+ / Expo 51+ 兼容性不佳
  // 改為使用非同步 Promise，讓 UI Loop 有機會喘息
  return new Promise((resolve, reject) => {
    try {
      // 使用 setTimeout (MacroTask) 將任務排程到下一個 Event Loop tick
      // 這不能真正的平行運算，但能避免長任務完全卡死 UI
      setTimeout(() => {
        try {
          resolve(task());
        } catch (e) {
          reject(e);
        }
      }, 0);
    } catch (error) {
      reject(error);
    }
  });

  // TODO: 未來可考慮遷移至 react-native-worklets-core 或 react-native-reanimated worklets
  /*
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      try {
        resolve(task());
      } catch (error) {
        reject(error);
      }
    });
  }

  try {
    return await spawnThread(() => {
      'worklet';
      return task();
    });
  } catch (error) {
    console.error('Worker thread error:', error);
    return task();
  }
  */
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
