import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TagSelector from '../TagSelector';
import { ThemeProvider } from '../../context/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('TagSelector', () => {
  it('renders add tag button', () => {
    const { getByText } = renderWithProviders(
      <TagSelector selectedTags={[]} onTagsChange={jest.fn()} />,
    );
    expect(getByText('Add Tag')).toBeTruthy(); // Or i18n key 'tags.add'
  });
});
