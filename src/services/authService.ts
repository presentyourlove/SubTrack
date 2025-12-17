import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import i18n from '../i18n';

// 註冊新使用者
export async function registerUser(
  email: string,
  password: string,
  displayName?: string,
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // 更新使用者名稱
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }

    return userCredential.user;
  } catch (error) {
    const errorCode = (error as { code: string }).code;
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

// 登入使用者
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    const errorCode = (error as { code: string }).code;
    if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
      throw new Error(i18n.t('error.invalidCredentials'));
    } else if (errorCode === 'auth/invalid-email') {
      throw new Error(i18n.t('validation.invalidEmail'));
    } else if (errorCode === 'auth/weak-password') {
      throw new Error(i18n.t('validation.passwordTooShort'));
    }
    throw new Error(i18n.t('error.loginFailed'));
  }
}

// 登出使用者
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error(i18n.t('error.logoutFailed'));
  }
}

// 監聽認證狀態變化
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// 取得當前使用者
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// 錯誤訊息轉換
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    'auth/email-already-in-use': '此電子郵件已被使用',
    'auth/invalid-email': '電子郵件格式不正確',
    'auth/operation-not-allowed': '此操作未被允許',
    'auth/weak-password': '密碼強度不足（至少6個字元）',
    'auth/user-disabled': '此帳號已被停用',
    'auth/user-not-found': '找不到此使用者',
    'auth/wrong-password': '密碼錯誤',
    'auth/invalid-credential': '登入憑證無效',
    'auth/too-many-requests': '嘗試次數過多，請稍後再試',
    'auth/network-request-failed': '網路連線失敗',
  };

  return errorMessages[errorCode] || '發生未知錯誤，請稍後再試';
}

// 驗證 Email 格式
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 驗證密碼強度
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 6) {
    return { isValid: false, message: '密碼至少需要6個字元' };
  }
  if (password.length > 128) {
    return { isValid: false, message: '密碼不能超過128個字元' };
  }
  return { isValid: true, message: '' };
}
