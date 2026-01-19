import {
  convertCurrency,
  getCurrencySymbol,
  getCurrencyName,
  formatCurrency,
  convertMultipleCurrencies,
  getSupportedCurrencies,
  calculateExchangeRate,
  formatExchangeRate,
} from '../currencyHelper';
import { DEFAULT_EXCHANGE_RATES } from '../../constants/AppConfig';

describe('currencyHelper', () => {
  describe('getCurrencySymbol', () => {
    it('returns correct symbol for known currencies', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('TWD')).toBe('NT$');
      expect(getCurrencySymbol('JPY')).toBe('¥');
      expect(getCurrencySymbol('EUR')).toBe('€');
    });

    it('returns code if symbol unknown', () => {
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN');
    });
  });

  describe('getCurrencyName', () => {
    it('returns localized name or fallback', () => {
      // i18n mock returns key as-is, so we check it calls with correct key
      const result = getCurrencyName('USD');
      expect(typeof result).toBe('string');
    });
  });

  describe('formatCurrency', () => {
    it('formats with symbol by default', () => {
      const result = formatCurrency(1000, 'TWD');
      expect(result).toContain('NT$');
      expect(result).toContain('1,000');
    });

    it('formats without symbol when specified', () => {
      const result = formatCurrency(1000, 'USD', { showSymbol: false });
      expect(result).not.toContain('$');
    });

    it('respects decimal places option', () => {
      const result = formatCurrency(99.99, 'USD', { decimals: 2 });
      expect(result).toContain('99.99');
    });
  });

  describe('convertCurrency', () => {
    it('returns amount if currencies are same', () => {
      expect(convertCurrency(100, 'TWD', 'TWD')).toBe(100);
    });

    it('converts using exchange rates', () => {
      const result = convertCurrency(100, 'TWD', 'USD', { TWD: 1, USD: 0.03 });
      expect(result).toBeCloseTo(3);
    });

    it('returns original amount if rate not found', () => {
      expect(convertCurrency(100, 'TWD', 'XXX', { TWD: 1 })).toBe(100);
    });
  });

  describe('convertMultipleCurrencies', () => {
    it('sums converted amounts', () => {
      const amounts = [
        { amount: 100, currency: 'TWD' },
        { amount: 3, currency: 'USD' },
      ];
      const rates = { TWD: 1, USD: 0.03 };
      const result = convertMultipleCurrencies(amounts, 'TWD', rates);
      expect(result).toBeGreaterThan(100);
    });
  });

  describe('getSupportedCurrencies', () => {
    it('returns array of currency objects', () => {
      const currencies = getSupportedCurrencies();
      expect(Array.isArray(currencies)).toBe(true);
      expect(currencies.length).toBeGreaterThan(0);
      expect(currencies[0]).toHaveProperty('code');
      expect(currencies[0]).toHaveProperty('name');
      expect(currencies[0]).toHaveProperty('symbol');
    });
  });

  describe('calculateExchangeRate', () => {
    it('returns 1 for same currency', () => {
      expect(calculateExchangeRate('USD', 'USD')).toBe(1);
    });

    it('calculates rate between currencies', () => {
      const rates = { TWD: 1, USD: 0.03 };
      const result = calculateExchangeRate('TWD', 'USD', rates);
      expect(result).toBe(0.03);
    });

    it('returns 1 if rate not found', () => {
      expect(calculateExchangeRate('XXX', 'YYY', {})).toBe(1);
    });
  });

  describe('formatExchangeRate', () => {
    it('formats rate as string', () => {
      const rates = { TWD: 1, USD: 0.03 };
      const result = formatExchangeRate('TWD', 'USD', rates);
      expect(result).toContain('TWD');
      expect(result).toContain('USD');
      expect(result).toContain('=');
    });
  });
});
