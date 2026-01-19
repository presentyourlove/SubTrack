import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// @ts-expect-error: documentDirectory might be undefined in some environments
const baseDir = FileSystem.documentDirectory || '';

/**
 * 圖片處理服務
 * 提供 WebP 壓縮與尺寸調整功能
 */

export interface ProcessedImage {
    uri: string;
    width: number;
    height: number;
    fileSize?: number;
}

const MAX_IMAGE_SIZE = 512;

/**
 * 壓縮並轉換圖片為 WebP
 * @param uri 原始圖片路徑
 * @returns 處理後的圖片資訊
 */
export async function compressAndConvertImage(uri: string): Promise<ProcessedImage> {
    try {
        const result = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: MAX_IMAGE_SIZE } }],
            {
                compress: 0.8,
                format: ImageManipulator.SaveFormat.WEBP,
            },
        );

        const fileName = `custom_icon_${Date.now()}.webp`;
        const destPath = `${baseDir}${fileName}`;

        await FileSystem.copyAsync({
            from: result.uri,
            to: destPath,
        });

        const fileInfo = await FileSystem.getInfoAsync(destPath);

        return {
            uri: destPath,
            width: result.width,
            height: result.height,
            fileSize: fileInfo.exists ? fileInfo.size : undefined,
        };
    } catch (error) {
        console.error('Image compression failed:', error);
        throw error;
    }
}

/**
 * 刪除自定義圖示檔案
 * @param uri 檔案路徑
 */
export async function deleteCustomIcon(uri: string): Promise<void> {
    try {
        if (uri.startsWith(baseDir) && baseDir !== '') {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(uri);
            }
        }
    } catch (error) {
        console.error('Failed to delete custom icon:', error);
    }
}
