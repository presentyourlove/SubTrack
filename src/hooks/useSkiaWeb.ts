import { Platform } from 'react-native';
// @ts-ignore - Skia web module might not be fully typed in all versions
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState } from 'react';

export const useSkiaWeb = () => {
    const [ready, setReady] = useState(Platform.OS !== 'web');

    useEffect(() => {
        if (Platform.OS === 'web') {
            LoadSkiaWeb({
                locateFile: (file) => `https://cdnjs.cloudflare.com/ajax/libs/canvaskit-wasm/0.39.1/${file}`,
            })
                .then(() => setReady(true))
                .catch((e) => console.error('Failed to load Skia Web:', e));
        }
    }, []);

    return ready;
};
