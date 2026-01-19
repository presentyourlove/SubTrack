import { calculateHourlyRate, convertToWorkHours } from '../valueConverter';
import { UserSettings } from '../../types';

describe('valueConverter', () => {
  describe('calculateHourlyRate', () => {
    it('returns 0 if settings is null', () => {
      expect(calculateHourlyRate(null as unknown as UserSettings)).toBe(0);
    });

    it('returns 0 if conversion not enabled', () => {
      const settings = { conversionEnabled: false } as UserSettings;
      expect(calculateHourlyRate(settings)).toBe(0);
    });

    it('returns hourly rate for hourly salary type', () => {
      const settings = {
        conversionEnabled: true,
        salaryType: 'hourly',
        salaryAmount: 500,
      } as UserSettings;
      expect(calculateHourlyRate(settings)).toBe(500);
    });

    it('calculates hourly rate from monthly salary', () => {
      const settings = {
        conversionEnabled: true,
        salaryType: 'monthly',
        salaryAmount: 35200, // 35200 / (22 * 8) = 200
        workDaysPerMonth: 22,
        workHoursPerDay: 8,
      } as UserSettings;
      expect(calculateHourlyRate(settings)).toBe(200);
    });

    it('returns 0 if salary amount is 0', () => {
      const settings = {
        conversionEnabled: true,
        salaryType: 'monthly',
        salaryAmount: 0,
      } as UserSettings;
      expect(calculateHourlyRate(settings)).toBe(0);
    });

    it('returns 0 if total hours is 0', () => {
      const settings = {
        conversionEnabled: true,
        salaryType: 'monthly',
        salaryAmount: 50000,
        workDaysPerMonth: 0,
        workHoursPerDay: 8,
      } as UserSettings;
      expect(calculateHourlyRate(settings)).toBe(0);
    });
  });

  describe('convertToWorkHours', () => {
    it('returns null if hourly rate is 0', () => {
      expect(convertToWorkHours(100, 0)).toBeNull();
    });

    it('returns null if hourly rate is negative', () => {
      expect(convertToWorkHours(100, -10)).toBeNull();
    });

    it('calculates work hours correctly', () => {
      const result = convertToWorkHours(300, 200);
      expect(result).toContain('1.5');
      expect(result).toContain('≈');
    });

    it('formats to one decimal place', () => {
      const result = convertToWorkHours(333, 200);
      expect(result).toMatch(/\d+\.\d/);
    });
  });
});
