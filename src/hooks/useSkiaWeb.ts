import { Platform } from 'react-native';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState } from 'react';

export const useSkiaWeb = () => {
  const [ready, setReady] = useState(Platform.OS !== 'web');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Initializing Skia Web...');
      // Explicitly load from CDN to avoid 404s on GitHub Pages subpaths
      // We found version 0.40.0 installed in node_modules
      LoadSkiaWeb({
        locateFile: (file) => {
          const url = `https://unpkg.com/canvaskit-wasm@0.40.0/bin/${file}`;
          console.log(`Loading Skia Web with file: ${file} from ${url}`);
          return url;
        },
      })
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
