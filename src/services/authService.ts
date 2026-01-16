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

/**
 * 註冊新使用者
 *
 * 使用 Email 和密碼建立新的使用者帳號，並設定顯示名稱
 *
 * @param {string} email - 使用者 Email
 * @param {string} password - 密碼（至少 6 個字元）
 * @param {string} [displayName] - 顯示名稱（選填）
 * @returns {Promise<User>} 已註冊的使用者物件
 * @throws {Error} 註冊失敗時（例如：Email 已存在、密碼太弱等）
 *
 * @example
 * try {
 *   const user = await registerUser('[email protected]', 'password123', 'John Doe');
 *   console.log(`歡迎, ${user.displayName}!`);
 * } catch (error) {
 *   console.error('註冊失敗:', error.message);
 * }
 */
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

/**
 * 使用者登入
 *
 * 使用 Email 和密碼進行身份驗證
 *
 * @param {string} email - 使用者 Email
 * @param {string} password - 密碼
 * @returns {Promise<User>} 已登入的使用者物件
 * @throws {Error} 登入失敗時（例如：帳號或密碼錯誤、帳號被停用等）
 *
 * @example
 * try {
 *   const user = await loginUser('[email protected]', 'password123');
 *   console.log(`歡迎回來, ${user.email}!`);
 * } catch (error) {
 *   console.error('登入失敗:', error.message);
 * }
 */
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

/**
 * 使用者登出
 *
 * 登出當前使用者並清除驗證狀態
 *
 * @returns {Promise<void>}
 * @throws {Error} 登出失敗時
 *
 * @example
 * await logoutUser();
 * console.log('已成功登出');
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error(i18n.t('error.logoutFailed'));
  }
}

/**
 * 監聽認證狀態變化
 *
 * 註冊一個回調函式，當使用者登入或登出時會被呼叫
 *
 * @param {(user: User | null) => void} callback - 狀態變化時的回調函式
 * @returns {() => void} 取消監聽的函式
 *
 * @example
 * const unsubscribe = onAuthStateChange((user) => {
 *   if (user) {
 *     console.log(`使用者已登入: ${user.email}`);
 *   } else {
 *     console.log('使用者已登出');
 *   }
 * });
 *
 * // 不需要時取消監聽
 * unsubscribe();
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * 取得當前使用者
 *
 * 從 Firebase Auth 取得當前已驗證的使用者
 *
 * @returns {User | null} 當前使用者物件，若未登入則回傳 null
 *
 * @example
 * const currentUser = getCurrentUser();
 * if (currentUser) {
 *   console.log(`目前登入: ${currentUser.email}`);
 * } else {
 *   console.log('未登入');
 * }
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

// 錯誤訊息轉換
function getAuthErrorMessage(errorCode: string): string {
  // 嘗試直接使用 i18n 翻譯錯誤代碼
  const i18nKey = `error.${errorCode}`;
  const translated = i18n.t(i18nKey);

  // 如果翻譯結果跟 key 一樣(或包含 error. 前綴代表沒翻譯到)，代表找不到翻譯，使用未知錯誤
  // i18n-js 的行為是找不到 key 會回傳 key 本身
  if (translated.includes('error.auth')) {
    return i18n.t('error.unknown');
  }

  return translated;
}

/**
 * 驗證 Email 格式
 *
 * 使用正則表達式檢查 Email 格式是否正確
 *
 * @param {string} email - 要驗證的 Email
 * @returns {boolean} 格式正確回傳 true，否則回傳 false
 *
 * @example
 * if (validateEmail('[email protected]')) {
 *   console.log('Email 格式正確');
 * }
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 驗證密碼強度
 *
 * 檢查密碼是否符合最低要求（6-128 個字元）
 *
 * @param {string} password - 要驗證的密碼
 * @returns {{ isValid: boolean; message: string }} 驗證結果物件
 *
 * @example
 * const result = validatePassword('abc');
 * if (!result.isValid) {
 *   console.error(result.message);
 * }
 */
export function validatePassword(password: string): {
  isValid: boolean;
  message: string;
} {
  if (password.length < 6) {
    return { isValid: false, message: i18n.t('validation.passwordTooShort') };
  }
  if (password.length > 128) {
    return { isValid: false, message: i18n.t('validation.passwordTooLong') };
  }
  return { isValid: true, message: '' };
}
