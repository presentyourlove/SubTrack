import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Subscription, UserSettings } from '../types';

// 匯出資料為 JSON
export async function exportDataToJSON(
    subscriptions: Subscription[],
    settings: UserSettings
): Promise<void> {
    try {
        const data = {
            version: '1.0.0',
            exportDate: new Date().toISOString(),
            subscriptions,
            settings,
        };

        const jsonString = JSON.stringify(data, null, 2);
        const fileName = `SubTrack_Export_${new Date().toISOString().split('T')[0]}.json`;

        if (Platform.OS === 'web') {
            // Web 平台：下載檔案
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            // Native 平台：使用 FileSystem 和 Sharing
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, jsonString);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                throw new Error('分享功能不可用');
            }
        }
    } catch (error) {
        console.error('Export failed:', error);
        throw new Error('匯出資料失敗');
    }
}

// 匯入資料從 JSON
export async function importDataFromJSON(
    jsonString: string
): Promise<{
    subscriptions: Subscription[];
    settings: UserSettings;
}> {
    try {
        const data = JSON.parse(jsonString);

        if (!data.subscriptions || !data.settings) {
            throw new Error('資料格式不正確');
        }

        return {
            subscriptions: data.subscriptions,
            settings: data.settings,
        };
    } catch (error) {
        console.error('Import failed:', error);
        throw new Error('匯入資料失敗');
    }
}

// 匯出為 CSV
export async function exportDataToCSV(subscriptions: Subscription[]): Promise<void> {
    try {
        // CSV 標題
        const headers = ['名稱', '分類', '價格', '幣別', '週期', '下次扣款日期'];

        // CSV 內容
        const rows = subscriptions.map(sub => [
            sub.name,
            getCategoryName(sub.category),
            sub.price.toString(),
            sub.currency,
            sub.billingCycle === 'monthly' ? '每月' : '每年',
            sub.nextBillingDate,
        ]);

        // 組合 CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
        ].join('\n');

        const fileName = `SubTrack_Export_${new Date().toISOString().split('T')[0]}.csv`;

        if (Platform.OS === 'web') {
            // Web 平台
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            // Native 平台
            const fileUri = `${FileSystem.documentDirectory}${fileName}`;
            await FileSystem.writeAsStringAsync(fileUri, csvContent);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            }
        }
    } catch (error) {
        console.error('CSV export failed:', error);
        throw new Error('匯出 CSV 失敗');
    }
}

function getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
        entertainment: '娛樂',
        productivity: '生產力',
        lifestyle: '生活/其他',
    };
    return names[category] || category;
}
