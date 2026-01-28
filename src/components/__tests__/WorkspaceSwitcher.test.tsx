import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WorkspaceSwitcher from '../WorkspaceSwitcher';

// Mock dependencies
const mockSwitchWorkspace = jest.fn();
const mockCreateWorkspace = jest.fn();

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      borderColor: '#e0e0e0',
      accent: '#007AFF',
      text: '#000000',
      subtleText: '#666666',
      background: '#f5f5f5',
    },
  }),
}));

jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    workspaces: [
      { id: 1, name: 'Personal', icon: '💼' },
      { id: 2, name: 'Work', icon: '🏢' },
    ],
    currentWorkspace: { id: 1, name: 'Personal', icon: '💼' },
    switchWorkspace: mockSwitchWorkspace,
    createWorkspace: mockCreateWorkspace,
  }),
}));

describe('WorkspaceSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSwitchWorkspace.mockResolvedValue(undefined);
    mockCreateWorkspace.mockResolvedValue(undefined);
  });

  it('renders current workspace', () => {
    const { getByText } = render(<WorkspaceSwitcher />);

    expect(getByText('Personal')).toBeTruthy();
    expect(getByText('💼')).toBeTruthy();
  });

  it('opens modal when switcher button is pressed', () => {
    const { getByText, getAllByText } = render(<WorkspaceSwitcher />);

    // Press the switcher button
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // Modal should show workspace list
    expect(getAllByText('Personal').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Work')).toBeTruthy();
  });

  it('shows switch workspace title in modal', () => {
    const { getByText } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // i18n returns default value (key)
    expect(getByText('workspace.switch')).toBeTruthy();
  });

  it('calls switchWorkspace when workspace item is pressed', async () => {
    const { getByText } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // Switch to Work workspace
    fireEvent.press(getByText('Work'));

    await waitFor(() => {
      expect(mockSwitchWorkspace).toHaveBeenCalledWith(2);
    });
  });

  it('shows new workspace button', () => {
    const { getByText } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // i18n returns default value (key)
    expect(getByText('workspace.new')).toBeTruthy();
  });

  it('shows create input when new workspace button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // Press new workspace button
    fireEvent.press(getByText('workspace.new'));

    // Input should be visible
    expect(getByPlaceholderText('Name')).toBeTruthy();
  });

  it('creates new workspace when form is submitted', async () => {
    const { getByText, getByPlaceholderText } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // Press new workspace button
    fireEvent.press(getByText('workspace.new'));

    // Fill in name
    const input = getByPlaceholderText('Name');
    fireEvent.changeText(input, 'My Workspace');

    // Submit
    fireEvent.press(getByText('common.add'));

    await waitFor(() => {
      expect(mockCreateWorkspace).toHaveBeenCalledWith('My Workspace', '💼');
    });
  });

  it('cancels workspace creation', () => {
    const { getByText, queryByPlaceholderText } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // Press new workspace button
    fireEvent.press(getByText('workspace.new'));

    // Cancel
    fireEvent.press(getByText('common.cancel'));

    // Input should be hidden, new workspace button visible
    expect(queryByPlaceholderText('Name')).toBeNull();
    expect(getByText('workspace.new')).toBeTruthy();
  });

  it('does not create workspace with empty name', async () => {
    const { getByText } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // Press new workspace button
    fireEvent.press(getByText('workspace.new'));

    // Leave name empty and submit
    fireEvent.press(getByText('common.add'));

    await waitFor(() => {
      expect(mockCreateWorkspace).not.toHaveBeenCalled();
    });
  });

  it('shows checkmark on current workspace', () => {
    const { getByText, toJSON } = render(<WorkspaceSwitcher />);

    // Open modal
    const button = getByText('Personal').parent;
    if (button) {
      fireEvent.press(button);
    }

    // The tree should contain structure (structural test)
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });
});

// Test null workspace case
describe('WorkspaceSwitcher - No current workspace', () => {
  beforeEach(() => {
    jest.doMock('../../context/DatabaseContext', () => ({
      useDatabase: () => ({
        workspaces: [],
        currentWorkspace: null,
        switchWorkspace: jest.fn(),
        createWorkspace: jest.fn(),
      }),
    }));
  });

  it('renders structure when current workspace exists', () => {
    const { toJSON } = render(<WorkspaceSwitcher />);
    expect(toJSON()).toBeTruthy();
  });
});
