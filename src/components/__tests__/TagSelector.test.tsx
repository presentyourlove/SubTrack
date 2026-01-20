import React from 'react';
import { render } from '@testing-library/react-native';
import { TagSelector } from '../TagSelector';
import { ThemeProvider } from '../../context/ThemeContext';
import { Tag } from '../../types';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TagSelector', () => {
  const mockTags: Tag[] = [
    { id: 1, name: 'Work', color: '#FF6B6B', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
    { id: 2, name: 'Personal', color: '#4ECDC4', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  ];

  const mockOnSelectionChange = jest.fn();
  const mockOnCreateTag = jest.fn().mockResolvedValue(3);

  it('renders tags correctly', () => {
    const { getByText } = renderWithProviders(
      <TagSelector
        tags={mockTags}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    expect(getByText('Work')).toBeTruthy();
    expect(getByText('Personal')).toBeTruthy();
  });

  it('renders add tag button when tags exist', () => {
    const { getByText } = renderWithProviders(
      <TagSelector
        tags={mockTags}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    expect(getByText('tags.add')).toBeTruthy();
  });

  it('shows empty message when no tags', () => {
    const { getByText } = renderWithProviders(
      <TagSelector
        tags={[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    expect(getByText('tags.noTags')).toBeTruthy();
  });
});
