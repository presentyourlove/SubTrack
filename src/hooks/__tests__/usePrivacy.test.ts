import { renderHook } from '@testing-library/react-native';
import { usePrivacy } from '../usePrivacy';
import * as DatabaseContext from '../../context/DatabaseContext';

// Mock useDatabase
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: jest.fn(),
}));

describe('usePrivacy', () => {
  it('should mask value when privacy mode is on', () => {
    (DatabaseContext.useDatabase as jest.Mock).mockReturnValue({
      settings: { privacyMode: true },
    });

    const { result } = renderHook(() => usePrivacy());

    expect(result.current.isPrivacyMode).toBe(true);
    expect(result.current.maskValue('100')).toBe('****');
  });

  it('should show value when privacy mode is off', () => {
    (DatabaseContext.useDatabase as jest.Mock).mockReturnValue({
      settings: { privacyMode: false },
    });

    const { result } = renderHook(() => usePrivacy());

    expect(result.current.isPrivacyMode).toBe(false);
    expect(result.current.maskValue('100')).toBe('100');
  });
});
