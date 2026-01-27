import { UserSettings } from '../types';
import { t } from '../i18n/utils';

/**
 * 計算基準時薪
 */
export function calculateHourlyRate(settings: UserSettings): number {
  if (!settings || !settings.conversionEnabled) return 0;

  const { salaryType, salaryAmount, workDaysPerMonth = 22, workHoursPerDay = 8 } = settings;

  if (!salaryAmount || salaryAmount <= 0) return 0;

  if (salaryType === 'hourly') {
    return salaryAmount;
  }

  // 月薪模式：月薪 / (天數 * 時數)
  const totalHours = workDaysPerMonth * workHoursPerDay;
  if (totalHours <= 0) return 0;

  return salaryAmount / totalHours;
}

/**
 * 轉換價格為工時
 * @param price 訂閱價格
 * @param hourlyRate 基準時薪
 * @returns 格式化後的字串 (e.g. "≈ 1.5 hr")
 */
export function convertToWorkHours(price: number, hourlyRate: number): string | null {
  if (hourlyRate <= 0) return null;

  const hours = price / hourlyRate;

  // 顯示小數點後一位
  const formattedHours = hours.toFixed(1);

  return `≈ ${formattedHours} ${t('settings.valueConverter.hoursUnit')}`;
}
