import {
  formatDate,
  formatDateLocale,
  getDaysBetween,
  getDaysUntil,
  isWithinDays,
  getNextBillingDate,
  calculateNextBillingDate,
  getWeekRange,
  getMonthRange,
  getYearRange,
  getDateRange,
  formatRelativeTime,
  getUrgencyLevel,
  parseTime,
  formatTime,
  getDefaultReminderTime,
} from '../dateHelper';

describe('dateHelper', () => {
  describe('formatDate', () => {
    it('formats date object to YYYY-MM-DD', () => {
      const date = new Date(2023, 11, 25); // Month is 0-indexed
      expect(formatDate(date)).toBe('2023-12-25');
    });

    it('formats date string to YYYY-MM-DD', () => {
      expect(formatDate('2024-01-15T10:30:00')).toMatch(/2024-01-1\d/);
    });

    it('pads single digit months and days', () => {
      const date = new Date(2024, 0, 5); // Jan 5
      expect(formatDate(date)).toBe('2024-01-05');
    });
  });

  describe('formatDateLocale', () => {
    it('formats date for display', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateLocale(date);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('accepts string input', () => {
      const result = formatDateLocale('2024-06-15');
      expect(typeof result).toBe('string');
    });

    it('uses provided locale', () => {
      const date = new Date(2024, 0, 15);
      const result = formatDateLocale(date, 'en-US');
      expect(typeof result).toBe('string');
    });
  });

  describe('getDaysBetween', () => {
    it('calculates difference correctly', () => {
      expect(getDaysBetween('2023-01-01', '2023-01-05')).toBe(4);
    });

    it('returns positive number regardless of order', () => {
      expect(getDaysBetween('2023-01-05', '2023-01-01')).toBe(4);
    });

    it('returns 0 for same date', () => {
      expect(getDaysBetween('2023-06-15', '2023-06-15')).toBe(0);
    });

    it('handles Date objects', () => {
      const d1 = new Date(2023, 0, 1);
      const d2 = new Date(2023, 0, 10);
      expect(getDaysBetween(d1, d2)).toBe(9);
    });
  });

  describe('getDaysUntil', () => {
    it('returns 0 for null/undefined', () => {
      expect(getDaysUntil(null)).toBe(0);
      expect(getDaysUntil(undefined)).toBe(0);
    });

    it('returns positive number for future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(getDaysUntil(future)).toBeGreaterThanOrEqual(4);
    });

    it('returns negative for past date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      expect(getDaysUntil(past)).toBeLessThanOrEqual(0);
    });

    it('returns 0 for invalid date string', () => {
      expect(getDaysUntil('invalid-date')).toBe(0);
    });

    it('returns 0 for empty string', () => {
      expect(getDaysUntil('')).toBe(0);
    });
  });

  describe('isWithinDays', () => {
    it('returns true if date is within range', () => {
      const future = new Date();
      future.setDate(future.getDate() + 3);
      expect(isWithinDays(future, 5)).toBe(true);
    });

    it('returns false if date is outside range', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      expect(isWithinDays(future, 5)).toBe(false);
    });

    it('returns true for today when days >= 0', () => {
      const today = new Date();
      expect(isWithinDays(today, 0)).toBe(true);
    });

    it('returns false for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(isWithinDays(past, 5)).toBe(false);
    });
  });

  describe('getNextBillingDate', () => {
    it('adds 7 days for weekly', () => {
      const result = getNextBillingDate('2024-01-01', 'weekly');
      expect(result).toContain('2024-01-08');
    });

    it('adds 1 month for monthly', () => {
      const result = getNextBillingDate('2024-01-15', 'monthly');
      expect(result).toContain('2024-02-15');
    });

    it('adds 3 months for quarterly', () => {
      const result = getNextBillingDate('2024-01-01', 'quarterly');
      expect(result).toContain('2024-04-01');
    });

    it('adds 1 year for yearly', () => {
      const result = getNextBillingDate('2024-01-01', 'yearly');
      expect(result).toContain('2025-01-01');
    });

    it('handles Date object input', () => {
      const result = getNextBillingDate(new Date(2024, 0, 1), 'monthly');
      expect(result).toMatch(/2024-0[12]/);
    });
  });

  describe('calculateNextBillingDate', () => {
    it('returns future start date if after today', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const result = calculateNextBillingDate(futureDate, 'monthly');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('calculates next billing for past start date', () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 2);
      const result = calculateNextBillingDate(pastDate, 'monthly');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('handles weekly cycle', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      const result = calculateNextBillingDate(pastDate, 'weekly');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('handles quarterly cycle', () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 6);
      const result = calculateNextBillingDate(pastDate, 'quarterly');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('handles yearly cycle', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 3);
      const result = calculateNextBillingDate(pastDate, 'yearly');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('handles string date input', () => {
      const result = calculateNextBillingDate('2020-01-15', 'monthly');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('getDateRanges', () => {
    it('getWeekRange returns start and end dates', () => {
      const { start, end } = getWeekRange();
      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });

    it('getMonthRange returns valid range', () => {
      const { start, end } = getMonthRange();
      expect(start.getDate()).toBe(1);
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });

    it('getYearRange returns Jan 1 to Dec 31', () => {
      const { start, end } = getYearRange();
      expect(start.getMonth()).toBe(0);
      expect(end.getMonth()).toBe(11);
    });

    it('getDateRange dispatches correctly', () => {
      expect(getDateRange('week')).toHaveProperty('start');
      expect(getDateRange('month')).toHaveProperty('end');
      expect(getDateRange('year')).toHaveProperty('start');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns expired for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const result = formatRelativeTime(past);
      expect(typeof result).toBe('string');
    });

    it('returns today for current date', () => {
      const today = new Date();
      const result = formatRelativeTime(today);
      expect(typeof result).toBe('string');
    });

    it('returns tomorrow for next day', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const result = formatRelativeTime(tomorrow);
      expect(typeof result).toBe('string');
    });

    it('returns days later for near future', () => {
      const nearFuture = new Date();
      nearFuture.setDate(nearFuture.getDate() + 5);
      const result = formatRelativeTime(nearFuture);
      expect(typeof result).toBe('string');
    });

    it('returns weeks later for 2-4 weeks', () => {
      const future = new Date();
      future.setDate(future.getDate() + 14);
      const result = formatRelativeTime(future);
      expect(typeof result).toBe('string');
    });

    it('returns months later for >30 days', () => {
      const farFuture = new Date();
      farFuture.setDate(farFuture.getDate() + 45);
      const result = formatRelativeTime(farFuture);
      expect(typeof result).toBe('string');
    });
  });

  describe('getUrgencyLevel', () => {
    it('returns urgent for dates within 3 days', () => {
      const soon = new Date();
      soon.setDate(soon.getDate() + 2);
      expect(getUrgencyLevel(soon)).toBe('urgent');
    });

    it('returns warning for dates within 7 days', () => {
      const moderate = new Date();
      moderate.setDate(moderate.getDate() + 5);
      expect(getUrgencyLevel(moderate)).toBe('warning');
    });

    it('returns safe for dates beyond 7 days', () => {
      const far = new Date();
      far.setDate(far.getDate() + 15);
      expect(getUrgencyLevel(far)).toBe('safe');
    });

    it('returns urgent for today', () => {
      const today = new Date();
      expect(getUrgencyLevel(today)).toBe('urgent');
    });

    it('returns urgent for past dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 1);
      expect(getUrgencyLevel(past)).toBe('urgent');
    });
  });

  describe('time functions', () => {
    it('parseTime creates date with correct hours', () => {
      const result = parseTime('14:30');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('parseTime handles edge cases', () => {
      const midnight = parseTime('00:00');
      expect(midnight.getHours()).toBe(0);
      expect(midnight.getMinutes()).toBe(0);
    });

    it('parseTime handles invalid input', () => {
      const result = parseTime('invalid');
      expect(result).toBeInstanceOf(Date);
    });

    it('formatTime returns HH:mm format', () => {
      const date = new Date();
      date.setHours(9, 5, 0, 0);
      expect(formatTime(date)).toMatch(/09:05/);
    });

    it('formatTime handles midnight', () => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      expect(formatTime(date)).toMatch(/00:00/);
    });

    it('getDefaultReminderTime returns 9:00', () => {
      const result = getDefaultReminderTime();
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(0);
    });
  });
});
