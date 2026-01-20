import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategorySelector from '../CategorySelector';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock ThemeContext
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000',
      card: '#fff',
      borderColor: '#eee',
      primary: 'blue',
      background: '#fff',
    },
  }),
}));

describe('CategorySelector', () => {
  const mockOnChange = jest.fn();

  it('renders all categories', () => {
    const { getByText } = render(
      <CategorySelector category="entertainment" setCategory={mockOnChange} />,
    );
    // Assuming 'categories.entertainment' translates or key is used
    expect(getByText('categories.entertainment')).toBeTruthy();
  });

  it('calls onChange when category selected', () => {
    const { getByText } = render(
      <CategorySelector category="entertainment" setCategory={mockOnChange} />,
    );

    // Select another category like 'productivity'
    fireEvent.press(getByText('categories.productivity'));
    expect(mockOnChange).toHaveBeenCalledWith('productivity');
  });
});
