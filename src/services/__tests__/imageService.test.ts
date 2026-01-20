import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { compressAndConvertImage, deleteCustomIcon } from '../imageService';

// Mock expo modules
jest.mock('expo-image-manipulator');
jest.mock('expo-file-system', () => ({
    documentDirectory: '/mock/document/directory/',
    copyAsync: jest.fn(),
    getInfoAsync: jest.fn(),
    deleteAsync: jest.fn(),
}));

const mockImageManipulator = ImageManipulator as jest.Mocked<typeof ImageManipulator>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('imageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('compressAndConvertImage', () => {
        it('compresses and converts image successfully', async () => {
            mockImageManipulator.manipulateAsync.mockResolvedValue({
                uri: 'file://manipulated.webp',
                width: 512,
                height: 384,
                base64: undefined,
            });
            mockFileSystem.copyAsync.mockResolvedValue(undefined);
            mockFileSystem.getInfoAsync.mockResolvedValue({
                exists: true,
                uri: '/mock/document/directory/custom_icon_1234.webp',
                size: 50000,
                isDirectory: false,
                modificationTime: Date.now(),
            });

            const result = await compressAndConvertImage('file://original.jpg');

            expect(result).toEqual({
                uri: expect.stringContaining('/mock/document/directory/custom_icon_'),
                width: 512,
                height: 384,
                fileSize: 50000,
            });
            expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
                'file://original.jpg',
                [{ resize: { width: 512 } }],
                {
                    compress: 0.8,
                    format: ImageManipulator.SaveFormat.WEBP,
                },
            );
        });

        it('handles file that does not exist after copy', async () => {
            mockImageManipulator.manipulateAsync.mockResolvedValue({
                uri: 'file://manipulated.webp',
                width: 256,
                height: 256,
                base64: undefined,
            });
            mockFileSystem.copyAsync.mockResolvedValue(undefined);
            mockFileSystem.getInfoAsync.mockResolvedValue({
                exists: false,
                uri: '/mock/document/directory/custom_icon_1234.webp',
                isDirectory: false,
            });

            const result = await compressAndConvertImage('file://original.jpg');

            expect(result.fileSize).toBeUndefined();
        });

        it('throws error on manipulation failure', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockImageManipulator.manipulateAsync.mockRejectedValue(
                new Error('Manipulation failed'),
            );

            await expect(compressAndConvertImage('file://invalid.jpg')).rejects.toThrow(
                'Manipulation failed',
            );

            expect(consoleSpy).toHaveBeenCalledWith(
                'Image compression failed:',
                expect.any(Error),
            );
            consoleSpy.mockRestore();
        });
    });

    describe('deleteCustomIcon', () => {
        it('deletes existing file in document directory', async () => {
            mockFileSystem.getInfoAsync.mockResolvedValue({
                exists: true,
                uri: '/mock/document/directory/custom_icon.webp',
                isDirectory: false,
                size: 1000,
                modificationTime: Date.now(),
            });
            mockFileSystem.deleteAsync.mockResolvedValue(undefined);

            await deleteCustomIcon('/mock/document/directory/custom_icon.webp');

            expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith(
                '/mock/document/directory/custom_icon.webp',
            );
            expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith(
                '/mock/document/directory/custom_icon.webp',
            );
        });

        it('does not delete file if outside document directory', async () => {
            await deleteCustomIcon('/other/directory/icon.webp');

            expect(mockFileSystem.getInfoAsync).not.toHaveBeenCalled();
            expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
        });

        it('does not delete file if it does not exist', async () => {
            mockFileSystem.getInfoAsync.mockResolvedValue({
                exists: false,
                uri: '/mock/document/directory/custom_icon.webp',
                isDirectory: false,
            });

            await deleteCustomIcon('/mock/document/directory/custom_icon.webp');

            expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
        });

        it('logs error on delete failure', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            mockFileSystem.getInfoAsync.mockResolvedValue({
                exists: true,
                uri: '/mock/document/directory/custom_icon.webp',
                isDirectory: false,
                size: 1000,
                modificationTime: Date.now(),
            });
            mockFileSystem.deleteAsync.mockRejectedValue(new Error('Delete failed'));

            await deleteCustomIcon('/mock/document/directory/custom_icon.webp');

            expect(consoleSpy).toHaveBeenCalledWith(
                'Failed to delete custom icon:',
                expect.any(Error),
            );
            consoleSpy.mockRestore();
        });
    });
});
