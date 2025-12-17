import { formatDate, formatDateLocale, getDaysBetween, getDaysUntil } from '../dateHelper';

describe('dateHelper', () => {
  describe('formatDate', () => {
    it('formats date object to YYYY-MM-DD', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('2023-12-25');
    });

    it('formats date string to YYYY-MM-DD', () => {
      expect(formatDate('2024-01-01')).toBe('2024-01-01');
    });
  });

  describe('getDaysBetween', () => {
    it('calculates difference correctly', () => {
      const d1 = '2023-01-01';
      const d2 = '2023-01-05';
      expect(getDaysBetween(d1, d2)).toBe(4);
    });

    it('returns positive number regardless of order', () => {
      expect(getDaysBetween('2023-01-05', '2023-01-01')).toBe(4);
    });
  });

  describe('getDaysUntil', () => {
    it('returns 0 for invalid date', () => {
      expect(getDaysUntil(null)).toBe(0);
      expect(getDaysUntil(undefined)).toBe(0);
    });

    // Note: Complex date math involving "today" is mocked or assumed relative for logic tests
    // Real "days until" depends on current time, we'd typically mock Date or just check it returns a number
    it('returns a number', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(typeof getDaysUntil(future)).toBe('number');
    });
  });
});
