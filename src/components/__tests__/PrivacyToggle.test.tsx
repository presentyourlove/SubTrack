import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrivacyToggle from '../PrivacyToggle';

// Mock dependencies
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: jest.fn(() => ({
    settings: { privacyMode: false },
    updateSettings: jest.fn(),
  })),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
    },
  }),
}));

jest.mock('../../utils/haptics', () => ({
  hapticFeedback: {
    selection: jest.fn(),
  },
}));

// Import for changing mock implementation and assertions
// Import for changing mock implementation and assertions
import { useDatabase } from '../../context/DatabaseContext';
import { hapticFeedback } from '../../utils/haptics';

describe('PrivacyToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    // Default privacyMode: false
    const { getByRole } = render(<PrivacyToggle />);
    const button = getByRole('button');
    // Expect accessibility label for "Hide amounts"
    expect(button.props.accessibilityLabel).toBe('Hide amounts');
  });

  it('toggles privacy mode on press', async () => {
    const mockUpdateSettings = jest.fn();
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { privacyMode: false },
      updateSettings: mockUpdateSettings,
    });

    const { getByRole } = render(<PrivacyToggle />);
    const button = getByRole('button');

    await fireEvent.press(button);

    expect(hapticFeedback.selection as jest.Mock).toHaveBeenCalled();
    expect(mockUpdateSettings).toHaveBeenCalledWith({ privacyMode: true });
  });

  it('renders eye-off icon when privacy mode is enabled', () => {
    const mockUpdateSettings = jest.fn();
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { privacyMode: true },
      updateSettings: mockUpdateSettings,
    });

    const { getByRole } = render(<PrivacyToggle />);
    const button = getByRole('button');
    expect(button.props.accessibilityLabel).toBe('Show amounts');
  });
});
