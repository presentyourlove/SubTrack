import { renderHook } from '@testing-library/react-native';
import { useTypedTranslation } from '../useTypedTranslation';

// Mock i18n
jest.mock('../../i18n', () => ({
  t: jest.fn((key) => `translated_${key}`),
  locale: 'en',
}));

describe('useTypedTranslation', () => {
  it('returns translation function', () => {
    const { result } = renderHook(() => useTypedTranslation());
    expect(result.current.t).toBeDefined();
    expect(result.current.i18n).toBeDefined();
  });

  it('translates keys correctly', () => {
    const { result } = renderHook(() => useTypedTranslation());
    const translation = result.current.t('common.cancel');
    expect(translation).toBe('translated_common.cancel');
  });
});
