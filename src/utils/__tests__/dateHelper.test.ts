import {
  formatDate,
  getDaysBetween,
  getDaysUntil,
  isWithinDays,
  getNextBillingDate,
  calculateNextBillingDate,
  getWeekRange,
  getMonthRange,
  getYearRange,
  getDateRange,
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
  });

  describe('time functions', () => {
    it('parseTime creates date with correct hours', () => {
      const result = parseTime('14:30');
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    it('formatTime returns HH:mm format', () => {
      const date = new Date();
      date.setHours(9, 5, 0, 0);
      expect(formatTime(date)).toMatch(/09:05/);
    });

    it('getDefaultReminderTime returns 9:00', () => {
      const result = getDefaultReminderTime();
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(0);
    });
  });
});
