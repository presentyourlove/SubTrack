/**
 * Import Service
 * 提供 CSV 與 Excel 匯入訂閱資料功能
 */

import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { Subscription, SubscriptionCategory, BillingCycle } from '../types';
import { processInChunks } from './workerService';

// 欄位名稱對應 (支援多種命名)
const FIELD_MAPPINGS: Record<string, keyof Subscription> = {
  // 名稱
  名稱: 'name',
  name: 'name',
  訂閱名稱: 'name',

  // 分類
  分類: 'category',
  category: 'category',
  類別: 'category',

  // 金額
  金額: 'price',
  price: 'price',
  價格: 'price',

  // 幣種
  幣種: 'currency',
  currency: 'currency',
  貨幣: 'currency',

  // 週期
  週期: 'billingCycle',
  billingCycle: 'billingCycle',
  計費週期: 'billingCycle',
  cycle: 'billingCycle',

  // 開始日期
  開始日期: 'startDate',
  startDate: 'startDate',
  start_date: 'startDate',

  // 下次扣款日
  下次扣款日: 'nextBillingDate',
  nextBillingDate: 'nextBillingDate',
  next_billing_date: 'nextBillingDate',

  // 圖示
  圖示: 'icon',
  icon: 'icon',
  emoji: 'icon',
};

// 分類值對應
const CATEGORY_MAPPINGS: Record<string, SubscriptionCategory> = {
  影音娛樂: 'entertainment',
  entertainment: 'entertainment',
  娛樂: 'entertainment',

  生產力工具: 'productivity',
  productivity: 'productivity',
  工具: 'productivity',

  生活服務: 'lifestyle',
  lifestyle: 'lifestyle',
  生活: 'lifestyle',

  其他: 'other',
  other: 'other',
};

// 週期值對應
const CYCLE_MAPPINGS: Record<string, BillingCycle> = {
  每週: 'weekly',
  weekly: 'weekly',
  週: 'weekly',

  每月: 'monthly',
  monthly: 'monthly',
  月: 'monthly',

  每季: 'quarterly',
  quarterly: 'quarterly',
  季: 'quarterly',

  每年: 'yearly',
  yearly: 'yearly',
  年: 'yearly',
};

export interface ImportResult {
  success: boolean;
  data: Partial<Subscription>[];
  errors: string[];
}

/**
 * 開啟檔案選擇器讓使用者選擇 CSV 或 Excel 檔案
 */
export async function pickImportFile(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'text/csv',
      'text/comma-separated-values',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

/**
 * 將原始資料行轉換為 Subscription 物件
 */
function mapRowToSubscription(
  row: Record<string, string>,
  rowIndex: number,
): { subscription: Partial<Subscription> | null; error: string | null } {
  const subscription: Partial<Subscription> = {};
  const errors: string[] = [];

  // 嘗試對應每個欄位
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.trim().toLowerCase();
    const mappedField = Object.entries(FIELD_MAPPINGS).find(
      ([k]) => k.toLowerCase() === normalizedKey,
    )?.[1];

    if (mappedField && value) {
      const trimmedValue = String(value).trim();

      switch (mappedField) {
        case 'name':
          subscription.name = trimmedValue;
          break;
        case 'category':
          subscription.category =
            CATEGORY_MAPPINGS[trimmedValue] ||
            CATEGORY_MAPPINGS[trimmedValue.toLowerCase()] ||
            'other';
          break;
        case 'price': {
          const price = parseFloat(trimmedValue);
          if (isNaN(price)) {
            errors.push(`第 ${rowIndex + 1} 行：金額格式錯誤 "${trimmedValue}"`);
          } else {
            subscription.price = price;
          }
          break;
        }
        case 'currency':
          subscription.currency = trimmedValue.toUpperCase();
          break;
        case 'billingCycle':
          subscription.billingCycle =
            CYCLE_MAPPINGS[trimmedValue] || CYCLE_MAPPINGS[trimmedValue.toLowerCase()] || 'monthly';
          break;
        case 'startDate':
        case 'nextBillingDate':
          // 簡單驗證日期格式
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
            subscription[mappedField] = trimmedValue;
          } else {
            // 嘗試解析其他格式
            const date = new Date(trimmedValue);
            if (!isNaN(date.getTime())) {
              subscription[mappedField] = date.toISOString().slice(0, 10);
            } else {
              errors.push(`第 ${rowIndex + 1} 行：日期格式錯誤 "${trimmedValue}"`);
            }
          }
          break;
        case 'icon':
          subscription.icon = trimmedValue;
          break;
      }
    }
  }

  // 驗證必要欄位
  if (!subscription.name) {
    errors.push(`第 ${rowIndex + 1} 行：缺少名稱欄位`);
    return { subscription: null, error: errors.join(', ') };
  }

  // 設定預設值
  if (!subscription.icon) subscription.icon = '📦';
  if (!subscription.category) subscription.category = 'other';
  if (!subscription.currency) subscription.currency = 'TWD';
  if (!subscription.billingCycle) subscription.billingCycle = 'monthly';
  if (!subscription.price) subscription.price = 0;
  if (!subscription.startDate) {
    subscription.startDate = new Date().toISOString().slice(0, 10);
  }
  if (!subscription.nextBillingDate) {
    subscription.nextBillingDate = subscription.startDate;
  }

  // 設定通知預設值
  subscription.reminderEnabled = false;

  return {
    subscription,
    error: errors.length > 0 ? errors.join(', ') : null,
  };
}

/**
 * 解析 CSV 檔案
 */
export async function parseCSV(fileUri: string): Promise<ImportResult> {
  const file = new File(fileUri);
  const content = await file.text();

  // 移除 BOM
  const cleanContent = content.replace(/^\uFEFF/, '');

  const parseResult = Papa.parse<Record<string, string>>(cleanContent, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];

  // 使用多執行緒背景分批處理資料
  const processedData = await processInChunks(
    parseResult.data,
    (row) => {
      // 注意：這裡在背景執行緒執行，不能直接捕捉非 Worklet 的變數
      // 但 mapRowToSubscription 目前是純函式，且依賴的 Mapping 常数已在檔案頂部定義
      // 在生產環境中，可能需要將 Mapping 傳入或確保它們被轉為 Worklet 友善形式
      return mapRowToSubscription(row, 0); // index 會在 processInChunks 內部維護，這裡暫傳 0
    },
    (progress) => {
      console.log(`Import progress: ${progress.toFixed(2)}%`);
    },
  );

  const data: Partial<Subscription>[] = [];
  processedData.forEach((result, index) => {
    if (result.subscription) {
      data.push(result.subscription);
    }
    if (result.error) {
      // 修正 Index 顯示
      errors.push(`第 ${index + 1} 行：${result.error}`);
    }
  });

  return {
    success: data.length > 0,
    data,
    errors,
  };
}

/**
 * 解析 Excel 檔案
 */
export async function parseExcel(fileUri: string): Promise<ImportResult> {
  const file = new File(fileUri);
  const arrayBuffer = await file.arrayBuffer();
  const content = Buffer.from(arrayBuffer).toString('base64');

  const XLSX = await import('xlsx');
  const workbook = XLSX.read(content, { type: 'base64' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // 轉換為 JSON
  const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);

  const errors: string[] = [];

  // 使用多執行緒背景分批處理資料
  const processedData = await processInChunks(
    jsonData,
    (row) => mapRowToSubscription(row, 0),
    (progress) => {
      console.log(`Excel Import progress: ${progress.toFixed(2)}%`);
    },
  );

  const data: Partial<Subscription>[] = [];
  processedData.forEach((result, index) => {
    if (result.subscription) {
      data.push(result.subscription);
    }
    if (result.error) {
      errors.push(`第 ${index + 1} 行：${result.error}`);
    }
  });

  return {
    success: data.length > 0,
    data,
    errors,
  };
}

/**
 * 根據檔案副檔名自動選擇解析方式
 */
export async function parseImportFile(fileUri: string): Promise<ImportResult> {
  const extension = fileUri.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(fileUri);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(fileUri);
  } else {
    return {
      success: false,
      data: [],
      errors: ['不支援的檔案格式，請使用 CSV 或 Excel 檔案'],
    };
  }
}
