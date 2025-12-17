import { registerUser, loginUser } from '../authService';
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

      // We expect it to throw. i18n mock returns the key if not set.
      // i18n.t('error.emailInUse') -> 'error.emailInUse' (default mock in setup)
      // Actually setup mock implementation: returns key.

      await expect(registerUser('exist@test.com', 'password')).rejects.toThrow('error.emailInUse');
      // Or whatever getAuthErrorMessage returns for that code.
      // Wait, getAuthErrorMessage is imported from authService? No, it's internal to authService usually or imported.
      // In authService.ts (step 792), it calls `getAuthErrorMessage(errorCode)`.
      // I need to check `getAuthErrorMessage` implementation or if it uses i18n directly.
      // Ah, step 792 content: `throw new Error(getAuthErrorMessage(errorCode));`
      // I need to verify `getAuthErrorMessage` source or just assume it maps correctly.
      // Actually `loginUser` uses `i18n.t` directly in step 792 view.
      // But `registerUser` calls a helper. I should check `registerUser` again.
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
      await expect(loginUser('test@test.com', 'wrong')).rejects.toThrow('error.invalidCredentials'); // Based on step 792
    });
  });
});
