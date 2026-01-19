import React from 'react';
import { render } from '@testing-library/react-native';
import WorkspaceSwitcher from '../WorkspaceSwitcher';
import { ThemeProvider } from '../../context/ThemeContext';

jest.mock('../../services/database', () => ({
  getWorkspaces: jest.fn().mockResolvedValue([]),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('WorkspaceSwitcher', () => {
  it('renders current workspace name', () => {
    const { getByTestId } = renderWithProviders(<WorkspaceSwitcher />);
    // Needs proper setup of props or context depending on implementation
  });
});
