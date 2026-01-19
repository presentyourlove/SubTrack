import React from 'react';
import { render } from '@testing-library/react-native';
import { SkiaPieChart } from '../SkiaPieChart';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock Skia Canvas since it relies on native code or specific setup not fully present in minimal partial mocks
// But we want to test that REANIMATED loads fine.
// Reanimated is used in SkiaPieChart for logic (useSharedValue, etc).

// Wrap component with required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('SkiaPieChart Smoke Test', () => {
  it('renders without crashing', () => {
    const data = [{ label: 'A', value: 10, color: 'red' }];
    renderWithProviders(<SkiaPieChart data={data} />);
  });
});
