import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LockScreen } from '../LockScreen';

// Mock dependencies
const mockUnlock = jest.fn();
jest.mock('../../context/SecurityContext', () => ({
  useSecurity: () => ({
    isLocked: true,
    unlock: mockUnlock,
  }),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      primary: '#007AFF',
      text: '#000000',
      textSecondary: '#666666',
    },
  }),
}));

describe('LockScreen', () => {
  it('renders correctly when locked', () => {
    const { getByText } = render(<LockScreen />);
    expect(getByText('SubTrack 已鎖定')).toBeTruthy();
  });

  it('calls unlock when button is pressed', () => {
    const { getByText } = render(<LockScreen />);
    fireEvent.press(getByText('立即解鎖'));
    expect(mockUnlock).toHaveBeenCalled();
  });
});
