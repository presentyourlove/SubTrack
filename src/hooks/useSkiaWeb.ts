import { Platform } from 'react-native';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState } from 'react';

export const useSkiaWeb = () => {
  const [ready, setReady] = useState(Platform.OS !== 'web');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Initializing Skia Web...');
      // Use explicit path for GitHub Pages subdirectory deployment
      LoadSkiaWeb({
        locateFile: (file) => {
          // The file is copied to 'dist/canvaskit.wasm' by deploy.js
          // GitHub Pages serves 'dist' at '/SubTrack/'
          const path = `/SubTrack/${file}`;
          console.log(`Loading Skia Web with file: ${file} from ${path}`);
          return path;
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
