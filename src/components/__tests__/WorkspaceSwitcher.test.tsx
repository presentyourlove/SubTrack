import React from 'react';
import { render } from '@testing-library/react-native';
import WorkspaceSwitcher from '../WorkspaceSwitcher';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock DatabaseContext
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    workspaces: [{ id: 1, name: 'Personal', icon: '🏠' }],
    currentWorkspace: { id: 1, name: 'Personal', icon: '🏠' },
    switchWorkspace: jest.fn(),
    createWorkspace: jest.fn(),
  }),
}));

// Mock imageService
jest.mock('../../services/imageService', () => ({
  compressAndConvertImage: jest.fn(),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('WorkspaceSwitcher', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<WorkspaceSwitcher />);
    expect(getByText('Personal')).toBeTruthy();
  });
});
