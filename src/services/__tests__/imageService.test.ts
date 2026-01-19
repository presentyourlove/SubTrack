import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { compressAndConvertImage, deleteCustomIcon } from '../imageService';

jest.mock('expo-file-system');
jest.mock('expo-image-manipulator');

describe('imageService', () => {
  const mockUri = 'file://test.jpg';
  const mockDestPath = 'file://document/custom_icon_123.webp';

  beforeEach(() => {
    jest.clearAllMocks();
    (FileSystem.documentDirectory as any) = 'file://document/';
  });

  describe('compressAndConvertImage', () => {
    it('should compress and copy image successfully', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file://manipulated.webp',
        width: 100,
        height: 100,
      });
      (FileSystem.copyAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true, size: 5000 });

      const result = await compressAndConvertImage(mockUri);

      expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockUri,
        [{ resize: { width: 512 } }],
        expect.objectContaining({ format: ImageManipulator.SaveFormat.WEBP }),
      );
      expect(FileSystem.copyAsync).toHaveBeenCalled();
      expect(result).toEqual({
        uri: expect.stringContaining('custom_icon'),
        width: 100,
        height: 100,
        fileSize: 5000,
      });
    });

    it('should throw error if manipulation fails', async () => {
      (ImageManipulator.manipulateAsync as jest.Mock).mockRejectedValue(new Error('Resize failed'));
      await expect(compressAndConvertImage(mockUri)).rejects.toThrow('Resize failed');
    });
  });

  describe('deleteCustomIcon', () => {
    it('should delete file if exists in document directory', async () => {
      const validUri = 'file://document/icon.webp';
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });

      await deleteCustomIcon(validUri);

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(validUri);
    });

    it('should not delete if file does not exist', async () => {
      const validUri = 'file://document/icon.webp';
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });

      await deleteCustomIcon(validUri);

      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('should not delete if file is outside document directory', async () => {
      const invalidUri = 'file://other/icon.webp';

      await deleteCustomIcon(invalidUri);

      expect(FileSystem.getInfoAsync).not.toHaveBeenCalled();
      expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    });
  });
});
