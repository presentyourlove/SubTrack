import React from 'react';
import { render } from '@testing-library/react-native';
import AboutSection from '../AboutSection';

// Mock dependencies
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: { subtleText: '#666666' },
  }),
}));

describe('AboutSection', () => {
  it('renders version info', () => {
    const { getByText } = render(<AboutSection />);
    expect(getByText('SubTrack v1.0.0')).toBeTruthy();
  });
});
