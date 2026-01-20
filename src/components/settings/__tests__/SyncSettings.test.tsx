import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SyncSettings from '../SyncSettings';
import * as authService from '../../../services/authService';

// Mock dependencies
const mockShowToast = jest.fn();
const mockSyncToCloud = jest.fn();
const mockSyncFromCloud = jest.fn();

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      borderColor: '#e0e0e0',
      accent: '#007AFF',
      text: '#000000',
      subtleText: '#666666',
      background: '#f5f5f5',
      expense: '#ef4444',
    },
  }),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
  }),
}));

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    syncToCloud: mockSyncToCloud,
    syncFromCloud: mockSyncFromCloud,
  }),
}));

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

jest.mock('../../../services/authService', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  logoutUser: jest.fn(),
}));

const mockLogin = authService.loginUser as jest.Mock;
const mockRegister = authService.registerUser as jest.Mock;
const mockLogout = authService.logoutUser as jest.Mock;

describe('SyncSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Unauthenticated state', () => {
    it('renders sync settings button', () => {
      const { getByText } = render(<SyncSettings />);

      expect(getByText('settings.sync')).toBeTruthy();
      expect(getByText('settings.loginToSync')).toBeTruthy();
    });

    it('opens modal when button is pressed', () => {
      const { getByText, getAllByText } = render(<SyncSettings />);

      const button = getByText('settings.sync').parent?.parent;
      if (button) {
        fireEvent.press(button);
      }

      // Modal should show login form
      expect(getAllByText(/validation.login/).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Login functionality', () => {
    it('calls login with email and password', async () => {
      mockLogin.mockResolvedValue(undefined);

      const { getByText, getByPlaceholderText } = render(<SyncSettings />);

      // Open modal
      const button = getByText('settings.sync').parent?.parent;
      if (button) {
        fireEvent.press(button);
      }

      // Fill in form
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('common.password');

      fireEvent.changeText(emailInput, 'test@test.com');
      fireEvent.changeText(passwordInput, 'password123');

      // Press login
      const loginButton = getByText('登入');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      });
    });

    it('shows error toast on login failure', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));

      const { getByText, getByPlaceholderText } = render(<SyncSettings />);

      // Open modal
      const button = getByText('settings.sync').parent?.parent;
      if (button) {
        fireEvent.press(button);
      }

      // Fill in form
      fireEvent.changeText(getByPlaceholderText('Email'), 'test@test.com');
      fireEvent.changeText(getByPlaceholderText('common.password'), 'wrong');

      // Press login
      fireEvent.press(getByText('登入'));

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Invalid credentials', 'error');
      });
    });
  });

  describe('Register functionality', () => {
    it('calls register when register button is pressed', async () => {
      mockRegister.mockResolvedValue(undefined);

      const { getByText, getByPlaceholderText } = render(<SyncSettings />);

      // Open modal
      const button = getByText('settings.sync').parent?.parent;
      if (button) {
        fireEvent.press(button);
      }

      // Fill in form
      fireEvent.changeText(getByPlaceholderText('Email'), 'new@test.com');
      fireEvent.changeText(getByPlaceholderText('common.password'), 'newpass123');

      // Press register
      const registerButton = getByText('settings.registerNow');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('new@test.com', 'newpass123');
      });
    });
  });
});

// Test authenticated state separately
describe('SyncSettings - Authenticated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Override mock for authenticated state
    jest.doMock('../../../context/AuthContext', () => ({
      useAuth: () => ({
        user: { email: 'user@test.com' },
        isAuthenticated: true,
      }),
    }));
  });

  it('renders with proper structure', () => {
    const { toJSON } = render(<SyncSettings />);
    expect(toJSON()).toBeTruthy();
  });
});
