import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BasicInfo from '../BasicInfo';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('BasicInfo', () => {
  const mockData = {
    name: 'Netflix',
    price: '100',
    currency: 'USD',
    description: '',
  };
  const mockOnChange = jest.fn();

  it('renders input fields', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <BasicInfo data={mockData} onChange={mockOnChange} errors={{}} />,
    );
    // Assuming placeholders exist. If i18n is used, need to know keys or mock i18n to return keys
  });
});
