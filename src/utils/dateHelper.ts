/**
 * 日期計算與格式化工具
 */

// 格式化日期為 YYYY-MM-DD
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期為本地化字串 (例: 2025年12月7日)
export function formatDateLocale(date: Date | string, locale: string = 'zh-TW'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

// 計算兩個日期之間的天數差
export function getDaysBetween(date1: Date | string, date2: Date | string): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// 計算距離今天還有幾天
export function getDaysUntil(date: Date | string | undefined | null): number {
    if (!date) return 0;

    try {
        const targetDate = typeof date === 'string' ? new Date(date) : date;
        // Check for invalid date
        if (isNaN(targetDate.getTime())) return 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
        console.warn('Error calculating days until:', e);
        return 0;
    }
}

// 判斷日期是否在指定天數內
export function isWithinDays(date: Date | string, days: number): boolean {
    const daysUntil = getDaysUntil(date);
    return daysUntil >= 0 && daysUntil <= days;
}

// 取得下一個扣款日期 (根據週期)
export function getNextBillingDate(
    currentDate: Date | string,
    cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
): string {
    const date = typeof currentDate === 'string' ? new Date(currentDate) : new Date(currentDate);

    if (cycle === 'weekly') {
        date.setDate(date.getDate() + 7);
    } else if (cycle === 'monthly') {
        date.setMonth(date.getMonth() + 1);
    } else if (cycle === 'quarterly') {
        date.setMonth(date.getMonth() + 3);
    } else {
        date.setFullYear(date.getFullYear() + 1);
    }

    return date.toISOString();
}

// 計算下一次有效的扣款日期 (相對於今天)
export function calculateNextBillingDate(
    startDate: Date | string,
    cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
): string {
    let date: Date;

    if (typeof startDate === 'string') {
        // Parse "YYYY-MM-DD" as local time [YYYY, MM-1, DD]
        const [year, month, day] = startDate.split('-').map(Number);
        date = new Date(year, month - 1, day);
    } else {
        date = new Date(startDate);
        date.setHours(0, 0, 0, 0);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 如果開始日期是未來 (> Today)，則直接返回開始日期
    if (date.getTime() > today.getTime()) {
        return formatDate(date); // Return YYYY-MM-DD string
    }

    // 否則，持續增加週期直到日期在今天之後
    // Loop while date <= today
    while (date.getTime() <= today.getTime()) {
        if (cycle === 'weekly') {
            date.setDate(date.getDate() + 7);
        } else if (cycle === 'monthly') {
            date.setMonth(date.getMonth() + 1);
        } else if (cycle === 'quarterly') {
            date.setMonth(date.getMonth() + 3);
        } else {
            date.setFullYear(date.getFullYear() + 1);
        }
    }

    // Normalized return
    return formatDate(date);
}

// 取得本週的開始和結束日期
export function getWeekRange(): { start: Date; end: Date } {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
}

// 取得本月的開始和結束日期
export function getMonthRange(): { start: Date; end: Date } {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    return { start, end };
}

// 取得本年的開始和結束日期
export function getYearRange(): { start: Date; end: Date } {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

    return { start, end };
}

// 根據時間範圍類型取得日期範圍
export function getDateRange(type: 'week' | 'month' | 'year'): { start: Date; end: Date } {
    switch (type) {
        case 'week':
            return getWeekRange();
        case 'month':
            return getMonthRange();
        case 'year':
            return getYearRange();
    }
}

// 格式化相對時間 (例: "3天後", "已過期")
export function formatRelativeTime(date: Date | string): string {
    const days = getDaysUntil(date);

    if (days < 0) {
        return '已過期';
    } else if (days === 0) {
        return '今天';
    } else if (days === 1) {
        return '明天';
    } else if (days <= 7) {
        return `${days}天後`;
    } else if (days <= 30) {
        const weeks = Math.floor(days / 7);
        return `${weeks}週後`;
    } else {
        const months = Math.floor(days / 30);
        return `${months}個月後`;
    }
}

// 取得到期緊急程度 (用於顏色標示)
export function getUrgencyLevel(date: Date | string): 'urgent' | 'warning' | 'safe' {
    const days = getDaysUntil(date);

    if (days <= 3) {
        return 'urgent';  // 紅色: 1-3天
    } else if (days <= 7) {
        return 'warning'; // 橘色: 4-7天
    } else {
        return 'safe';    // 綠色: 8+天
    }
}
