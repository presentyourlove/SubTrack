/**
 * Export Service
 * 提供訂閱資料的 CSV 與 PDF 匯出功能
 */

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import Papa from 'papaparse';
import { Subscription } from '../types';
import i18n from '../i18n';

// CSV 欄位標題 (繁體中文)
const CSV_HEADERS = ['名稱', '分類', '金額', '幣種', '週期', '開始日期', '下次扣款日', '圖示'];

// 週期對應翻譯
const CYCLE_LABELS: Record<string, string> = {
  weekly: '每週',
  monthly: '每月',
  quarterly: '每季',
  yearly: '每年',
};

// 分類對應翻譯
const CATEGORY_LABELS: Record<string, string> = {
  entertainment: '影音娛樂',
  productivity: '生產力工具',
  lifestyle: '生活服務',
  other: '其他',
};

/**
 * 將訂閱資料轉換為 CSV 格式的二維陣列
 */
function subscriptionsToCSVData(subscriptions: Subscription[]): string[][] {
  const data: string[][] = [CSV_HEADERS];

  subscriptions.forEach((sub) => {
    data.push([
      sub.name,
      CATEGORY_LABELS[sub.category] || sub.category,
      String(sub.price),
      sub.currency,
      CYCLE_LABELS[sub.billingCycle] || sub.billingCycle,
      sub.startDate,
      sub.nextBillingDate,
      sub.icon,
    ]);
  });

  return data;
}

/**
 * 匯出訂閱資料為 CSV 檔案並開啟分享面板
 */
export async function exportSubscriptionsToCSV(subscriptions: Subscription[]): Promise<void> {
  const csvData = subscriptionsToCSVData(subscriptions);
  const csvString = Papa.unparse(csvData);

  const fileName = `SubTrack_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  const file = new File(Paths.cache, fileName);

  // 寫入檔案 (UTF-8 with BOM for Excel compatibility)
  const BOM = '\uFEFF';
  await file.write(BOM + csvString);

  // 檢查分享功能是否可用
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: i18n.t('export.shareTitle'),
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

/**
 * 產生 PDF 報表的 HTML 內容
 */
function generatePDFHtml(
  subscriptions: Subscription[],
  totalAmount: number,
  currency: string,
): string {
  const rows = subscriptions
    .map(
      (sub) => `
    <tr>
      <td>${sub.icon} ${sub.name}</td>
      <td>${CATEGORY_LABELS[sub.category] || sub.category}</td>
      <td>${sub.currency} ${sub.price}</td>
      <td>${CYCLE_LABELS[sub.billingCycle] || sub.billingCycle}</td>
      <td>${sub.nextBillingDate}</td>
    </tr>
  `,
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
        h1 { color: #333; border-bottom: 2px solid #007AFF; padding-bottom: 10px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
        .summary h2 { margin: 0; color: #007AFF; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #007AFF; color: white; }
        tr:nth-child(even) { background: #f9f9f9; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>📊 SubTrack 訂閱報表</h1>
      <div class="summary">
        <h2>月度總支出：${currency} ${totalAmount.toFixed(2)}</h2>
        <p>報表產生日期：${new Date().toLocaleDateString('zh-TW')}</p>
        <p>訂閱數量：${subscriptions.length} 項</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>訂閱名稱</th>
            <th>分類</th>
            <th>金額</th>
            <th>週期</th>
            <th>下次扣款日</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="footer">
        <p>由 SubTrack 自動產生 | © ${new Date().getFullYear()}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * 匯出訂閱報表為 PDF 並開啟分享面板
 */
export async function exportSubscriptionsToPDF(
  subscriptions: Subscription[],
  totalAmount: number,
  currency: string,
): Promise<void> {
  const html = generatePDFHtml(subscriptions, totalAmount, currency);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  // 重新命名檔案
  const fileName = `SubTrack_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  const sourceFile = new File(uri);
  const destFile = new File(Paths.cache, fileName);

  await sourceFile.move(destFile);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(destFile.uri, {
      mimeType: 'application/pdf',
      dialogTitle: i18n.t('export.shareTitle'),
      UTI: 'com.adobe.pdf',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}
