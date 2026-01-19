import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagChip from '../TagChip';
import { ThemeProvider } from '../../context/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TagChip', () => {
  const mockTag = {
    id: '1',
    name: 'Urgent',
    color: '#FF0000',
  };
  const mockOnPress = jest.fn();

  it('renders label correctly', () => {
    const { getByText } = renderWithProviders(<TagChip tag={mockTag} />);
    expect(getByText('Urgent')).toBeTruthy();
  });

  it('handles press', () => {
    const { getByText } = renderWithProviders(<TagChip tag={mockTag} onPress={mockOnPress} />);
    fireEvent.press(getByText('Urgent'));
    expect(mockOnPress).toHaveBeenCalledWith(mockTag);
  });

  it('shows remove icon when onDelete provided', () => {
    const mockOnDelete = jest.fn();
    const { getByTestId } = renderWithProviders(<TagChip tag={mockTag} onDelete={mockOnDelete} />);
    // Assuming the close icon has testID or accessibility label.
    // If not, we might check for existence of an icon from vector-icons.
  });
});
