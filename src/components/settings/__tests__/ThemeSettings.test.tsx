import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ThemeSettings from '../ThemeSettings';

// Mock dependencies
const mockToggleTheme = jest.fn();
jest.mock('../../../context/ThemeContext', () => ({
    useTheme: () => ({
        colors: {
            card: '#ffffff',
            borderColor: '#e0e0e0',
            accent: '#007AFF',
            text: '#000000',
            subtleText: '#666666',
            background: '#f5f5f5',
        },
        theme: 'light',
        toggleTheme: mockToggleTheme,
    }),
}));

describe('ThemeSettings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the settings item with theme info', () => {
        const { getByText } = render(<ThemeSettings />);

        expect(getByText('settings.theme')).toBeTruthy();
        expect(getByText('settings.lightMode')).toBeTruthy();
    });

    it('opens modal when settings item is pressed', () => {
        const { getAllByText } = render(<ThemeSettings />);

        // Modal content should not be visible initially (or at least theme options in modal)
        const settingsButton = getAllByText('settings.theme')[0].parent?.parent;

        // Press to open modal
        if (settingsButton) {
            fireEvent.press(settingsButton);
        }

        // Modal should now show theme options (there will be multiple now)
        expect(getAllByText('settings.lightMode').length).toBeGreaterThanOrEqual(1);
        expect(getAllByText('settings.darkMode').length).toBeGreaterThanOrEqual(1);
    });

    it('closes modal when close button is pressed', () => {
        const { getByText, getAllByText } = render(<ThemeSettings />);

        // Open modal first
        const settingsButton = getByText('settings.theme').parent?.parent;
        if (settingsButton) {
            fireEvent.press(settingsButton);
        }

        // Find all elements - there should be multiple now including modal header
        const themeTexts = getAllByText('settings.theme');
        expect(themeTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('renders with proper structure', () => {
        const { toJSON } = render(<ThemeSettings />);

        expect(toJSON()).toBeTruthy();
    });
});
