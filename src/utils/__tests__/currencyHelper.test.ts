import { convertCurrency, getCurrencySymbol } from '../currencyHelper';
import { DEFAULT_EXCHANGE_RATES } from '../../constants/AppConfig';

describe('currencyHelper', () => {
  describe('convertCurrency', () => {
    it('returns amount if currencies are same', () => {
      expect(convertCurrency(100, 'TWD', 'TWD')).toBe(100);
    });

    it('converts TWD to USD correctly', () => {
      const rate = DEFAULT_EXCHANGE_RATES['USD'];
      const amount = 1000;
      // 1000 TWD * rate
      expect(convertCurrency(amount, 'TWD', 'USD')).toBeCloseTo(amount * rate);
    });
  });

  describe('getCurrencySymbol', () => {
    it('returns correct symbol for known currency', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('TWD')).toBe('NT$');
    });

    it('returns code if symbol unknown', () => {
      expect(getCurrencySymbol('UNKNOWN')).toBe('UNKNOWN');
    });
  });
});
