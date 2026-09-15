import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { UserProfile } from '../types';

/**
 * Designated Super Admin Accounts for COPAG MSU System
 * kanjanapat.m@msu.ac.th is strictly enforced as the primary Admin.
 */
export const ADMIN_EMAILS: string[] = [
  'kanjanapat.m@msu.ac.th',
];

/**
 * Known COPAG Departments for quick suggestion
 */
export const COPAG_DEPARTMENTS: string[] = [
  'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต',
  'งานการเงิน พัสดุและอาคารสถานที่',
  'งานบริหารทั่วไปและบุคคล',
  'งานนโยบายและแผน',
  'งานวิจัย บริการวิชาการและนวัตกรรม',
  'สาขาวิชารัฐศาสตร์',
  'สาขาวิชารัฐประศาสนศาสตร์',
  'สาขาวิชาความสัมพันธ์ระหว่างประเทศ',
  'สำนักงานเลขานุการวิทยาลัยการเมืองการปกครอง'
];

/**
 * Default Super Admin Profile
 */
export const SUPER_ADMIN_PROFILE: UserProfile = {
  email: 'kanjanapat.m@msu.ac.th',
  name: 'กาญจนภาษณ์ มาตบุรม',
  role: 'admin',
  department: 'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต',
  position: 'นักวิชาการศึกษา',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=kanjanapat'
};

/**
 * Default Demo Requisition User
 */
export const DEMO_USER_PROFILE: UserProfile = {
  email: 'somchai.p@msu.ac.th',
  name: 'ดร.สมชาย ปรีชาชาญ',
  role: 'user',
  department: 'สาขาวิชารัฐศาสตร์',
  position: 'อาจารย์ประจำสาขาวิชา',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=somchai'
};

/**
 * Checks if the given email is a valid Mahasarakham University email (@msu.ac.th)
 */
export function isMsuEmail(email: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@msu.ac.th');
}

/**
 * Checks if the given email has administrative privileges.
 * kanjanapat.m@msu.ac.th is guaranteed admin rights.
 */
export function checkIsAdmin(email: string): boolean {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => adminEmail.toLowerCase() === cleanEmail);
}

const RECENT_ACCOUNTS_KEY = 'copag_recent_msu_accounts';

/**
 * Retrieve recently logged-in MSU accounts from local storage
 */
export function getRecentMsuAccounts(): UserProfile[] {
  try {
    const data = localStorage.getItem(RECENT_ACCOUNTS_KEY);
    if (!data) {
      return [SUPER_ADMIN_PROFILE, DEMO_USER_PROFILE];
    }
    const accounts: UserProfile[] = JSON.parse(data);
    // Ensure Super Admin is always in the list with admin privileges
    if (!accounts.some(a => a.email.toLowerCase() === SUPER_ADMIN_PROFILE.email.toLowerCase())) {
      accounts.unshift(SUPER_ADMIN_PROFILE);
    } else {
      // Ensure role is admin
      const adminAcc = accounts.find(a => a.email.toLowerCase() === SUPER_ADMIN_PROFILE.email.toLowerCase());
      if (adminAcc) adminAcc.role = 'admin';
    }
    return accounts;
  } catch (err) {
    console.warn('Failed to parse recent accounts:', err);
    return [SUPER_ADMIN_PROFILE, DEMO_USER_PROFILE];
  }
}

/**
 * Save account into recent accounts list
 */
export function saveRecentMsuAccount(profile: UserProfile): void {
  try {
    const list = getRecentMsuAccounts().filter(
      a => a.email.toLowerCase() !== profile.email.toLowerCase()
    );
    // Enforce admin for kanjanapat
    if (checkIsAdmin(profile.email)) {
      profile.role = 'admin';
    }
    list.unshift(profile);
    // Keep top 5 accounts
    localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(list.slice(0, 5)));
  } catch (err) {
    console.warn('Failed to save recent account:', err);
  }
}

/**
 * Sign in using Google Workspace Single Sign-On (MSU Account)
 */
export async function signInWithGoogleMsu(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  // Restrict account chooser to @msu.ac.th domain
  provider.setCustomParameters({
    hd: 'msu.ac.th',
    prompt: 'select_account'
  });

  try {
    const credential = await signInWithPopup(auth, provider);
    const user = credential.user;

    if (!user.email || !isMsuEmail(user.email)) {
      await signOut(auth);
      throw new Error(
        'การเข้าสู่ระบบต้องใช้อีเมลสถาบัน @msu.ac.th ของมหาวิทยาลัยมหาสารคามเท่านั้น (ระบบไม่อนุญาตให้อีเมลภายนอกเข้าใช้งาน)'
      );
    }

    const email = user.email.toLowerCase();
    const isAdmin = checkIsAdmin(email);

    const profile: UserProfile = {
      email,
      name: user.displayName || email.split('@')[0],
      avatar:
        user.photoURL ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || email)}`,
      role: isAdmin ? 'admin' : 'user',
      department: isAdmin
        ? 'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต'
        : 'วิทยาลัยการเมืองการปกครอง',
      position: isAdmin ? 'นักวิชาการศึกษา' : 'อาจารย์/บุคลากร',
    };

    saveRecentMsuAccount(profile);
    return profile;
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj.code === 'auth/popup-blocked') {
      throw new Error(
        'เบราว์เซอร์บล็อกหน้าต่าง Pop-up กรุณาอนุญาต Pop-up สำหรับหน้านี้ หรือใช้แบบฟอร์มยืนยันบัญชี @msu.ac.th ด้านล่าง'
      );
    }
    if (errorObj.code === 'auth/popup-closed-by-user') {
      throw new Error('การเข้าสู่ระบบถูกยกเลิก');
    }
    throw err;
  }
}

/**
 * Direct MSU Account Verification & Login
 * Validates domain and sets appropriate role
 */
export function signInWithMsuAccount(data: {
  email: string;
  name: string;
  department?: string;
  position?: string;
  role?: 'admin' | 'user';
}): UserProfile {
  const email = data.email.trim().toLowerCase();

  if (!isMsuEmail(email)) {
    throw new Error('กรุณาใช้อีเมลสถาบันที่ลงท้ายด้วย @msu.ac.th เท่านั้น');
  }

  // Strictly enforce admin role for kanjanapat.m@msu.ac.th
  const isAdmin = checkIsAdmin(email);
  const effectiveRole: 'admin' | 'user' = isAdmin ? 'admin' : (data.role || 'user');

  const profile: UserProfile = {
    email,
    name: data.name.trim() || email.split('@')[0],
    role: effectiveRole,
    department: data.department?.trim() || (isAdmin ? 'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต' : 'วิทยาลัยการเมืองการปกครอง'),
    position: data.position?.trim() || (isAdmin ? 'นักวิชาการศึกษา' : 'อาจารย์/บุคลากร'),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || email)}`
  };

  saveRecentMsuAccount(profile);
  return profile;
}

/**
 * Perform logout and clean up state
 */
export async function logoutMsuAccount(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut warning:', err);
  }
  localStorage.removeItem('copag_user');
}
