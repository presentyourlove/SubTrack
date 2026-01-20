import { registerUser, loginUser, validateEmail, validatePassword } from '../authService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
// import i18n from '../../i18n';

// Mocks are handled in jest.setup.js mostly, but we might need specific return values here.
// Re-mocking to control results
const mockAuth = {};
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockUser = { uid: '123', email: 'test@test.com' };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

      const result = await registerUser('test@test.com', 'password');
      expect(result).toEqual(mockUser);
      expect(createUserWithEmailAndPassword).toHaveBeenCalled();
    });

    it('should throw localized error on existing email', async () => {
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/email-already-in-use',
      });

      // getAuthErrorMessage calls i18n.t('error.auth/email-already-in-use'),
      // which the mock returns as-is. Since it includes 'error.auth',
      // getAuthErrorMessage returns i18n.t('error.unknown') -> 'error.unknown'
      await expect(registerUser('exist@test.com', 'password')).rejects.toThrow('error.unknown');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const mockUser = { uid: '123' };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

      const result = await loginUser('test@test.com', 'password');
      expect(result).toEqual(mockUser);
    });

    it('should throw localized error on wrong password', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/wrong-password' });
      await expect(loginUser('test@test.com', 'wrong')).rejects.toThrow('error.invalidCredentials');
    });

    it('should throw error on user not found', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/user-not-found' });
      await expect(loginUser('notexist@test.com', 'password')).rejects.toThrow(
        'error.invalidCredentials',
      );
    });

    it('should throw error on invalid email', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/invalid-email' });
      await expect(loginUser('invalid', 'password')).rejects.toThrow('validation.invalidEmail');
    });

    it('should throw error on weak password', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/weak-password' });
      await expect(loginUser('test@test.com', '123')).rejects.toThrow('validation.passwordTooShort');
    });

    it('should throw generic error on unknown error', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({ code: 'auth/unknown-error' });
      await expect(loginUser('test@test.com', 'password')).rejects.toThrow('error.loginFailed');
    });
  });

  describe('validateEmail', () => {
    it('returns true for valid email', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('returns true for email with subdomain', () => {
      expect(validateEmail('user@mail.example.com')).toBe(true);
    });

    it('returns false for email without @', () => {
      expect(validateEmail('testexample.com')).toBe(false);
    });

    it('returns false for email without domain', () => {
      expect(validateEmail('test@')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('returns false for email with spaces', () => {
      expect(validateEmail('test @example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('returns valid for password with 6+ characters', () => {
      const result = validatePassword('password123');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('returns invalid for password too short', () => {
      const result = validatePassword('abc');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('validation.passwordTooShort');
    });

    it('returns invalid for empty password', () => {
      const result = validatePassword('');
      expect(result.isValid).toBe(false);
    });

    it('returns valid for exactly 6 characters', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(true);
    });

    it('returns invalid for password too long (>128)', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('validation.passwordTooLong');
    });

    it('returns valid for exactly 128 characters', () => {
      const longPassword = 'a'.repeat(128);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(true);
    });
  });
});

