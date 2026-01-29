import { Platform } from 'react-native';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState } from 'react';

export const useSkiaWeb = () => {
  const [ready, setReady] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Initializing Skia Web...');
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
          // Log more details if available
          if (e instanceof Error) {
            console.error('Error details:', e.message, e.stack);
          } else {
            console.error('Error object:', JSON.stringify(e));
          }
        });
    }
  }, []);

  return ready;
};
