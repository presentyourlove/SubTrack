/**
 * 日期計算與格式化工具
 * Date calculation and formatting utilities for consistent UI display.
 */

import i18n from '../i18n';
import { TIME_CONSTANTS, REMINDER_CONSTANTS, URGENCY_THRESHOLDS } from '../constants/AppConfig';

// 解構時間常數以便使用
const { ONE_DAY_MS, DAYS_PER_WEEK, DAYS_PER_MONTH } = TIME_CONSTANTS;
const { DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE } = REMINDER_CONSTANTS;
const { URGENT_DAYS, WARNING_DAYS } = URGENCY_THRESHOLDS;

// Format date to ISO string (YYYY-MM-DD) for database storage consistency
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for user-friendly display based on locale settings
// Falls back to system locale if not provided
export function formatDateLocale(date: Date | string, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale || i18n.locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Calculate absolute day difference for subscription duration analysis
export function getDaysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / ONE_DAY_MS);
}

// Calculate remaining days for bill reminders
// Returns 0 if date is invalid or past
export function getDaysUntil(date: Date | string | undefined | null): number {
  if (!date) return 0;

  try {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    // Validate date object
    if (isNaN(targetDate.getTime())) return 0;

    const today = new Date();
    // Reset hours to ensure full-day calculation difference
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / ONE_DAY_MS);
  } catch {
    // Fail silently for UI resilience
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
  cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly',
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
  cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly',
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
  end.setDate(start.getDate() + (DAYS_PER_WEEK - 1)); // 週日為最後一天
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
    return i18n.t('date.expired');
  } else if (days === 0) {
    return i18n.t('date.today');
  } else if (days === 1) {
    return i18n.t('date.tomorrow');
  } else if (days <= DAYS_PER_WEEK) {
    return i18n.t('date.daysLater', { days });
  } else if (days <= DAYS_PER_MONTH) {
    const weeks = Math.floor(days / DAYS_PER_WEEK);
    return i18n.t('date.weeksLater', { weeks });
  } else {
    const months = Math.floor(days / DAYS_PER_MONTH);
    return i18n.t('date.monthsLater', { months });
  }
}

// 取得到期緊急程度 (用於顏色標示)
export function getUrgencyLevel(date: Date | string): 'urgent' | 'warning' | 'safe' {
  const days = getDaysUntil(date);

  if (days <= URGENT_DAYS) {
    return 'urgent'; // 紅色: 1-3天（緊急）
  } else if (days <= WARNING_DAYS) {
    return 'warning'; // 橘色: 4-7天（警告）
  } else {
    return 'safe'; // 綠色: 8+天（安全）
  }
}

// 解析時間字串 "HH:mm" 為 Date 物件 (預設為當日)
export function parseTime(timeStr: string): Date {
  try {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10) || 0, parseInt(minutes, 10) || 0, 0, 0);
    return date;
  } catch (e) {
    console.warn('Error parsing time:', e);
    return getDefaultReminderTime();
  }
}

// 格式化 Date 為 "HH:mm"
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 取得預設提醒時間（早上 9:00）
export function getDefaultReminderTime(): Date {
  const date = new Date();
  date.setHours(DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE, 0, 0);
  return date;
}
