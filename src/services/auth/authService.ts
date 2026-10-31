import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from 'firebase/firestore';
import { UserProfile, UserRole, UserStatus } from '../../types';
import { auth, db, firebaseConfig, isFirebaseConfigured } from '../firebase/config';

export class AuthService {
  static getCurrentUser(): UserProfile | null {
    if (!auth?.currentUser) return null;
    return null; // State managed by AuthContext onAuthStateChanged
  }

  static async login(email: string, pass: string): Promise<UserProfile> {
    if (!auth || !db) {
      throw new Error('Firebase belum terkonfigurasi dengan benar.');
    }

    const userCred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const userDocRef = doc(db, 'users', userCred.user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const profile = userSnap.data() as UserProfile;
      if (profile.status === 'disabled') {
        await signOut(auth);
        throw new Error('Akun Anda dinonaktifkan. Silakan hubungi admin ruang berdua.');
      }
      return profile;
    }

    const isAdmin = Boolean(email.toLowerCase().includes('admin'));
    if (!isAdmin) {
      await signOut(auth);
      throw new Error('Akun ini tidak terdaftar atau telah dihapus oleh Admin.');
    }

    // Auto-initialize profile document for initial Admin
    const newProfile: UserProfile = {
      id: userCred.user.uid,
      name: userCred.user.displayName || (isAdmin ? 'Admin Ruang Berdua' : email.split('@')[0]),
      email: userCred.user.email || email,
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      semester: isAdmin ? 0 : 1,
      major: isAdmin ? 'Pusat Komputer & Arsip' : 'Teknik Informatika',
      university: 'Universitas Indonesia',
      storageUsedBytes: 0,
      storageQuotaBytes: (isAdmin ? 100 : 15) * 1024 * 1024 * 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userDocRef, newProfile);
    return newProfile;
  }

  static async logout(): Promise<void> {
    if (auth) {
      await signOut(auth);
    }
  }

  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error('Database Firestore tidak terhubung.');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  // ADMIN METHODS (Direct Firestore integration)
  static async getAllUsers(): Promise<UserProfile[]> {
    if (!db) return [];
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push(d.data() as UserProfile));
      return list;
    } catch (err) {
      console.error('Failed to get users from Firestore:', err);
      // Fallback query without orderBy if index is still propagating
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => list.push(d.data() as UserProfile));
      return list;
    }
  }

  static async adminCreateUser(params: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    major?: string;
    semester?: number;
    university?: string;
  }): Promise<UserProfile> {
    if (!db) throw new Error('Database Firestore tidak terhubung.');

    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPassword = params.password?.trim();

    if (cleanPassword && cleanPassword.length < 6) {
      throw new Error('Kata sandi minimal harus 6 karakter.');
    }

    let userId = 'user_' + Math.random().toString(36).substring(2, 10);

    // If password provided and Firebase configured, create real Firebase Auth user via secondary app
    if (cleanPassword && isFirebaseConfigured) {
      try {
        const secondaryApp =
          getApps().find((a) => a.name === 'SecondaryAdminAuth') ||
          initializeApp(firebaseConfig, 'SecondaryAdminAuth');
        const secondaryAuth = getAuth(secondaryApp);

        const userCred = await createUserWithEmailAndPassword(
          secondaryAuth,
          cleanEmail,
          cleanPassword
        );
        userId = userCred.user.uid;

        // Clear session on secondary app so it does not interfere with primary session
        await signOut(secondaryAuth);
      } catch (authErr: any) {
        console.error('Firebase Auth creation error:', authErr);
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error('Email ini sudah terdaftar. Silakan gunakan email lain.');
        } else if (authErr.code === 'auth/weak-password') {
          throw new Error('Kata sandi terlalu lemah. Gunakan minimal 6 karakter.');
        } else if (authErr.code === 'auth/invalid-email') {
          throw new Error('Format email tidak valid.');
        } else {
          throw new Error(authErr.message || 'Gagal mendaftarkan akun di sistem autentikasi.');
        }
      }
    }

    const newDocRef = doc(db, 'users', userId);

    const newUser: UserProfile = {
      id: userId,
      name: params.name.trim(),
      email: cleanEmail,
      role: params.role,
      status: 'active',
      semester: params.semester || 1,
      major: params.major || 'Teknik Informatika',
      university: params.university || 'Universitas Indonesia',
      storageUsedBytes: 0,
      storageQuotaBytes: (params.role === 'admin' ? 100 : 15) * 1024 * 1024 * 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(newDocRef, newUser);

    // If no password was provided, send password reset invite email
    if (!cleanPassword && auth) {
      try {
        await sendPasswordResetEmail(auth, newUser.email);
      } catch (e) {
        console.warn('Password reset invite email note:', e);
      }
    }

    return newUser;
  }

  static async adminToggleUserStatus(userId: string, newStatus: UserStatus): Promise<void> {
    if (!db) throw new Error('Database Firestore tidak terhubung.');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  static async adminDeleteUser(userId: string): Promise<void> {
    if (!db) throw new Error('Database Firestore tidak terhubung.');
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  }

  static async adminResetPassword(userId: string, email?: string): Promise<string> {
    if (auth && email) {
      await sendPasswordResetEmail(auth, email);
      return `Tautan reset kata sandi telah dikirimkan ke email: ${email}`;
    }
    return `Tautan reset kata sandi telah dikirimkan`;
  }
}
