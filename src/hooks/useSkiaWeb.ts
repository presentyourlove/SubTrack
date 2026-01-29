import { Platform } from 'react-native';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState } from 'react';

export const useSkiaWeb = () => {
  const [ready, setReady] = useState(Platform.OS !== 'web');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Initializing Skia Web...');
      // 嘗試使用預設載入方式，不強制指定版本，讓套件自行處理
      LoadSkiaWeb()
        .then(() => {
          console.log('Skia Web loaded successfully');
          setReady(true);
        })
        .catch((e) => {
          console.error('Failed to load Skia Web:', e);
          setError(e instanceof Error ? e : new Error(JSON.stringify(e)));
          // 即使失敗也設為 ready，讓 App 可以繼續嘗試渲染 (雖然 Skia 相關功能會壞掉)
          // 但我們會透過回傳 error 讓上層決定如何處理
          setReady(true);
        });
    }
  }, []);

  return { ready, error };
};
