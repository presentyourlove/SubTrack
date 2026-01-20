import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { pickImportFile, parseImportFile, parseCSV, parseExcel } from '../importService';

// Mock dependencies
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation(() => ({
    text: jest.fn().mockResolvedValue('name,price,category\nNetflix,15.99,entertainment'),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
  })),
}));

// Mock papaparse
jest.mock('papaparse', () => ({
  parse: jest.fn().mockReturnValue({
    data: [{ name: 'Netflix', price: '15.99', category: 'entertainment' }],
    errors: [],
  }),
}));

// Mock xlsx
jest.mock('xlsx', () => ({
  read: jest.fn().mockReturnValue({
    SheetNames: ['Sheet1'],
    Sheets: { Sheet1: {} },
  }),
  utils: {
    sheet_to_json: jest
      .fn()
      .mockReturnValue([{ name: 'Netflix', price: '15.99', category: 'entertainment' }]),
  },
}));

// Mock workerService
jest.mock('../workerService', () => ({
  processInChunks: jest.fn().mockImplementation(async (data, task) => {
    return data.map((item: any) => task(item));
  }),
}));

describe('importService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('pickImportFile', () => {
    it('returns uri when file is picked', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///test.csv' }],
      });

      const result = await pickImportFile();
      expect(result).toBe('file:///test.csv');
    });

    it('returns null when canceled', async () => {
      (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      });

      const result = await pickImportFile();
      expect(result).toBeNull();
    });
  });

  describe('parseCSV', () => {
    it('parses CSV content correctly', async () => {
      const result = await parseCSV('file:///test.csv');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Netflix');
      expect(result.data[0].price).toBe(15.99);
    });

    it('handles CSV with BOM', async () => {
      const mockFile = File as unknown as jest.Mock;
      mockFile.mockImplementationOnce(() => ({
        text: jest.fn().mockResolvedValue('\uFEFFname,price\nNetflix,15.99'),
      }));

      const result = await parseCSV('file:///test.csv');
      expect(result.success).toBe(true);
    });
  });

  describe('parseExcel', () => {
    it('parses Excel content correctly', async () => {
      const result = await parseExcel('file:///test.xlsx');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Netflix');
    });
  });

  describe('parseImportFile', () => {
    it('routes to parseCSV for .csv files', async () => {
      const result = await parseImportFile('file:///test.csv');
      expect(result.success).toBe(true);
    });

    it('routes to parseExcel for .xlsx files', async () => {
      const result = await parseImportFile('file:///test.xlsx');
      expect(result.success).toBe(true);
    });

    it('routes to parseExcel for .xls files', async () => {
      const result = await parseImportFile('file:///test.xls');
      expect(result.success).toBe(true);
    });

    it('returns error for unsupported formats', async () => {
      const result = await parseImportFile('file:///test.txt');
      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('不支援');
    });
  });

  describe('Row Mapping Logic', () => {
    // We test the internal mapRowToSubscription via parseCSV since it's not exported
    it('maps various field names correctly', async () => {
      const { parse } = require('papaparse');
      parse.mockReturnValueOnce({
        data: [
          {
            名稱: 'Game Pass',
            金額: '320',
            週期: '每月',
            開始日期: '2026-01-01',
          },
        ],
      });

      const result = await parseCSV('file:///test.csv');
      expect(result.data[0].name).toBe('Game Pass');
      expect(result.data[0].price).toBe(320);
      expect(result.data[0].billingCycle).toBe('monthly');
      expect(result.data[0].startDate).toBe('2026-01-01');
    });

    it('handles invalid price', async () => {
      const { parse } = require('papaparse');
      parse.mockReturnValueOnce({
        data: [{ name: 'Test', price: 'invalid' }],
      });

      const result = await parseCSV('file:///test.csv');
      expect(result.errors[0]).toContain('金額格式錯誤');
    });

    it('handles invalid date and attempts fallback', async () => {
      const { parse } = require('papaparse');
      parse.mockReturnValueOnce({
        data: [{ name: 'Test', startDate: '2026-01-01T12:00:00Z' }],
      });

      const result = await parseCSV('file:///test.csv');
      expect(result.data[0].startDate).toBe('2026-01-01');
    });

    it('returns error for missing name', async () => {
      const { parse } = require('papaparse');
      parse.mockReturnValueOnce({
        data: [{ price: '100' }],
      });

      const result = await parseCSV('file:///test.csv');
      expect(result.errors[0]).toContain('缺少名稱欄位');
    });
  });
});
