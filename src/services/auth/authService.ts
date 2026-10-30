import { UserProfile, UserRole, UserStatus } from '../../types';
import { isFirebaseConfigured, auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { INITIAL_USERS } from '../mockData';

const USERS_STORAGE_KEY = 'arsipinaja_users';
const CURRENT_USER_KEY = 'arsipinaja_active_user_id';

function loadUsers(): UserProfile[] {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_USERS;
  }
}

function saveUsers(users: UserProfile[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export class AuthService {
  static getCurrentUser(): UserProfile | null {
    const users = loadUsers();
    const activeId = localStorage.getItem(CURRENT_USER_KEY) || 'user_mhs_1'; // Default to Budi Santoso
    return users.find((u) => u.id === activeId) || users[0] || null;
  }

  static setCurrentUser(user: UserProfile) {
    localStorage.setItem(CURRENT_USER_KEY, user.id);
  }

  static async login(email: string, pass: string): Promise<UserProfile> {
    if (isFirebaseConfigured && auth && db) {
      try {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        const userDocRef = doc(db, 'users', userCred.user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const profile = userSnap.data() as UserProfile;
          if (profile.status === 'disabled') {
            await signOut(auth);
            throw new Error('Akun Anda dinonaktifkan oleh administrator. Silakan hubungi admin.');
          }
          this.setCurrentUser(profile);
          return profile;
        }
      } catch (err: any) {
        if (err.message && err.message.includes('dinonaktifkan')) {
          throw err;
        }
        console.warn('Firebase login failed or fallback requested:', err);
      }
    }

    // Local / Demo Mode Login
    const users = loadUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!found) {
      throw new Error('Email atau password salah. Silakan periksa kembali akun Anda.');
    }

    if (found.status === 'disabled') {
      throw new Error('Akun Anda sedang dinonaktifkan oleh Administrator.');
    }

    this.setCurrentUser(found);
    return found;
  }

  static async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signout error:', err);
      }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('Pengguna tidak ditemukan.');

    const updated = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    users[index] = updated;
    saveUsers(users);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firebase updateDoc error:', err);
      }
    }

    return updated;
  }

  // ADMIN METHODS
  static getAllUsers(): UserProfile[] {
    return loadUsers();
  }

  static async adminCreateUser(params: {
    name: string;
    email: string;
    role: UserRole;
    major?: string;
    semester?: number;
    university?: string;
  }): Promise<UserProfile> {
    const users = loadUsers();
    if (users.some((u) => u.email.toLowerCase() === params.email.trim().toLowerCase())) {
      throw new Error('Email sudah terdaftar dalam sistem.');
    }

    const newUser: UserProfile = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      role: params.role,
      status: 'active',
      semester: params.semester || 1,
      major: params.major || 'Teknik Informatika',
      university: params.university || 'Universitas Indonesia',
      storageUsedBytes: 0,
      storageQuotaBytes: 15 * 1024 * 1024 * 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
  }

  static async adminToggleUserStatus(userId: string, newStatus: UserStatus): Promise<UserProfile> {
    const users = loadUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    if (user.role === 'admin') throw new Error('Status akun Administrator tidak dapat dinonaktifkan.');

    user.status = newStatus;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);
    return user;
  }

  static async adminResetPassword(userId: string): Promise<string> {
    const users = loadUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    // In production, triggers Firebase sendPasswordResetEmail. In demo, returns temporary code.
    return `Pass-${Math.floor(100000 + Math.random() * 900000)}`;
  }
}
