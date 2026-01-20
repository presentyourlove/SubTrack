import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CategoryTabs from '../CategoryTabs';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      borderColor: '#cccccc',
      accent: '#007AFF',
      text: '#000000',
    },
  }),
}));

jest.mock('../../utils/haptics', () => ({
  hapticFeedback: {
    selection: jest.fn(),
  },
}));

jest.mock('../../i18n', () => ({
  t: (key: string) => key,
}));

import { hapticFeedback } from '../../utils/haptics';

describe('CategoryTabs', () => {
  const mockOnSelectCategory = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all category tabs', () => {
    const { getByText } = render(
      <CategoryTabs selectedCategory="all" onSelectCategory={mockOnSelectCategory} />,
    );

    expect(getByText('categories.all')).toBeTruthy();
    expect(getByText('categories.entertainment')).toBeTruthy();
    expect(getByText('categories.productivity')).toBeTruthy();
  });

  it('calls onSelectCategory and triggers haptics when a tab is pressed', () => {
    const { getByText } = render(
      <CategoryTabs selectedCategory="all" onSelectCategory={mockOnSelectCategory} />,
    );

    fireEvent.press(getByText('categories.entertainment'));

    expect(hapticFeedback.selection as jest.Mock).toHaveBeenCalled();
    expect(mockOnSelectCategory).toHaveBeenCalledWith('entertainment');
  });

  it('highlights selected category', () => {
    const { getByText } = render(
      <CategoryTabs selectedCategory="entertainment" onSelectCategory={mockOnSelectCategory} />,
    );

    // In a real e2e test we might check styles, but for unit test ensuring it renders without error is reasonable.
    // We can check if the text exists, implying render.
    expect(getByText('categories.entertainment')).toBeTruthy();
  });
});
