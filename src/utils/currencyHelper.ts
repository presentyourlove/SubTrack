/**
 * 幣別轉換工具
 */

import { DEFAULT_EXCHANGE_RATES } from '../types';

// 幣別符號對應
export const CURRENCY_SYMBOLS: { [key: string]: string } = {
    TWD: 'NT$',
    USD: '$',
    JPY: '¥',
    CNY: '¥',
    HKD: 'HK$',
    MOP: 'MOP$',
    GBP: '£',
    KRW: '₩',
    EUR: '€',
};

// 幣別名稱對應
export const CURRENCY_NAMES: { [key: string]: string } = {
    TWD: '新台幣',
    USD: '美金',
    JPY: '日圓',
    CNY: '人民幣',
    HKD: '港幣',
    MOP: '澳門幣',
    GBP: '英鎊',
    KRW: '韓元',
    EUR: '歐元',
};

// 取得幣別符號
export function getCurrencySymbol(currency: string): string {
    return CURRENCY_SYMBOLS[currency] || currency;
}

// 取得幣別名稱
export function getCurrencyName(currency: string): string {
    return CURRENCY_NAMES[currency] || currency;
}

// 格式化金額 (加上幣別符號和千分位)
export function formatCurrency(
    amount: number,
    currency: string,
    options: {
        showSymbol?: boolean;
        decimals?: number;
        locale?: string;
    } = {}
): string {
    const {
        showSymbol = true,
        decimals = 0,
        locale = 'zh-TW',
    } = options;

    const formatted = amount.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });

    if (showSymbol) {
        const symbol = getCurrencySymbol(currency);
        return `${symbol}${formatted}`;
    }

    return formatted;
}

// 幣別轉換
export function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRates: { [key: string]: number } = DEFAULT_EXCHANGE_RATES
): number {
    if (fromCurrency === toCurrency) {
        return amount;
    }

    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    if (!fromRate || !toRate) {
        console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
        return amount;
    }

    // 先轉換為基準幣別 (TWD)，再轉換為目標幣別
    const inBaseCurrency = amount / fromRate;
    return inBaseCurrency * toRate;
}

// 批次轉換金額 (用於統計)
export function convertMultipleCurrencies(
    amounts: Array<{ amount: number; currency: string }>,
    targetCurrency: string,
    exchangeRates: { [key: string]: number } = DEFAULT_EXCHANGE_RATES
): number {
    return amounts.reduce((total, item) => {
        const converted = convertCurrency(
            item.amount,
            item.currency,
            targetCurrency,
            exchangeRates
        );
        return total + converted;
    }, 0);
}

// 取得所有支援的幣別列表
export function getSupportedCurrencies(): Array<{
    code: string;
    name: string;
    symbol: string;
}> {
    return Object.keys(DEFAULT_EXCHANGE_RATES).map(code => ({
        code,
        name: getCurrencyName(code),
        symbol: getCurrencySymbol(code),
    }));
}

// 計算匯率 (從基準幣別)
export function calculateExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    exchangeRates: { [key: string]: number } = DEFAULT_EXCHANGE_RATES
): number {
    if (fromCurrency === toCurrency) {
        return 1;
    }

    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];

    if (!fromRate || !toRate) {
        return 1;
    }

    return toRate / fromRate;
}

// 格式化匯率顯示
export function formatExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    exchangeRates: { [key: string]: number } = DEFAULT_EXCHANGE_RATES
): string {
    const rate = calculateExchangeRate(fromCurrency, toCurrency, exchangeRates);
    return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
}
