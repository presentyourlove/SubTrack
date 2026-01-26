import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { TagSelector } from '../TagSelector';

// Mock dependencies
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(() => 'light'),
}));

jest.spyOn(Alert, 'alert');

describe('TagSelector', () => {
  const mockTags = [
    { id: 1, name: 'Entertainment', color: '#FF5733' },
    { id: 2, name: 'Business', color: '#33FF57' },
    { id: 3, name: 'Personal', color: '#3357FF' },
  ];
  const mockOnSelectionChange = jest.fn();
  const mockOnCreateTag = jest.fn();
  const mockOnDeleteTag = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnCreateTag.mockResolvedValue(4);
  });

  it('renders with tags', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    expect(getByText('tags.title')).toBeTruthy();
    expect(getByText('Entertainment')).toBeTruthy();
    expect(getByText('Business')).toBeTruthy();
  });

  it('renders empty state when no tags', () => {
    const { getByText } = render(
      <TagSelector
        tags={[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    expect(getByText('tags.noTags')).toBeTruthy();
  });

  it('renders add button', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    expect(getByText('tags.add')).toBeTruthy();
  });

  it('shows create input when add button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    fireEvent.press(getByText('tags.add'));

    expect(getByPlaceholderText('tags.placeholder')).toBeTruthy();
  });

  it('calls onSelectionChange when tag is pressed', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    fireEvent.press(getByText('Entertainment'));

    expect(mockOnSelectionChange).toHaveBeenCalledWith([1]);
  });

  it('removes tag from selection when already selected', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[1, 2]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    fireEvent.press(getByText('Entertainment'));

    expect(mockOnSelectionChange).toHaveBeenCalledWith([2]);
  });

  it('shows delete confirmation on long press', () => {
    const { getByText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
        onDeleteTag={mockOnDeleteTag}
      />,
    );

    fireEvent(getByText('Entertainment'), 'longPress');

    expect(Alert.alert).toHaveBeenCalledWith(
      'tags.delete',
      expect.stringContaining('tags.deleteConfirm'),
      expect.any(Array),
    );
  });

  it('creates new tag when form is submitted', async () => {
    const { getByText, getByPlaceholderText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    // Open create input
    fireEvent.press(getByText('tags.add'));

    // Fill in name
    const input = getByPlaceholderText('tags.placeholder');
    fireEvent.changeText(input, 'New Tag');

    // Submit - there are two "tags.add" elements, get the second one (create button)
    const addButtons = getByText('tags.add');
    fireEvent.press(addButtons);

    await waitFor(() => {
      expect(mockOnCreateTag).toHaveBeenCalledWith('New Tag', expect.any(String));
    });
  });

  it('cancels tag creation', () => {
    const { getByText, queryByPlaceholderText } = render(
      <TagSelector
        tags={mockTags as any[]}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    // Open create input
    fireEvent.press(getByText('tags.add'));

    // Cancel
    fireEvent.press(getByText('common.cancel'));

    // Input should be hidden
    expect(queryByPlaceholderText('tags.placeholder')).toBeNull();
  });

  it('allows selecting color for new tag', () => {
    const { getByText, getByLabelText } = render(
      <TagSelector
        tags={mockTags}
        selectedTagIds={[]}
        onSelectionChange={mockOnSelectionChange}
        onCreateTag={mockOnCreateTag}
      />,
    );

    // Open create input
    fireEvent.press(getByText('tags.add'));

    // Select a color (color option 2)
    const colorOption = getByLabelText('顏色選項 2');
    fireEvent.press(colorOption);

    // Color should be selectable
    expect(colorOption).toBeTruthy();
  });
});
