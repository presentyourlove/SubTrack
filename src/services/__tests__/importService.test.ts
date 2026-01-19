import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { importData } from '../importService';
import { addSubscription } from '../database';

jest.mock('expo-document-picker');
jest.mock('expo-file-system');
jest.mock('../database');

describe('importService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importData', () => {
    it('should pick file and import data', async () => {
      const mockJson = JSON.stringify({
        subscriptions: [{ name: 'Netflix', price: 100 }],
      });

      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file://backup.json' }],
      });
      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(mockJson);

      await importData({} as any);

      expect(DocumentPicker.getDocumentAsync).toHaveBeenCalled();
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith('file://backup.json');
      expect(addSubscription).toHaveBeenCalled();
    });

    it('should return if picker canceled', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: null,
      });

      await importData({} as any);

      expect(FileSystem.readAsStringAsync).not.toHaveBeenCalled();
    });
  });
});
