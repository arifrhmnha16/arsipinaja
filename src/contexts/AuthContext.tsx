import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { auth, db } from '../services/firebase/config';
import { AuthService } from '../services/auth/authService';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile> => {
    if (!db) {
      const fallbackProfile: UserProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
        email: fbUser.email || '',
        role: fbUser.email?.toLowerCase().includes('admin') ? 'admin' : 'user',
        status: 'active',
        storageUsedBytes: 0,
        storageQuotaBytes: 15 * 1024 * 1024 * 1024,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return fallbackProfile;
    }

    const userRef = doc(db, 'users', fbUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }

    const isAdmin = Boolean(fbUser.email?.toLowerCase().includes('admin'));
    if (!isAdmin) {
      throw new Error('Akun telah dihapus oleh Admin.');
    }

    // Auto-create initial profile document in Firestore for Admin
    const newProfile: UserProfile = {
      id: fbUser.uid,
      name: fbUser.displayName || (isAdmin ? 'Admin Ruang Berdua' : fbUser.email?.split('@')[0] || 'Partner'),
      email: fbUser.email || '',
      role: isAdmin ? 'admin' : 'user',
      status: 'active',
      semester: 1,
      major: 'Arsip Kuliah & Tugas',
      university: 'Ruang Berdua',
      storageUsedBytes: 0,
      storageQuotaBytes: (isAdmin ? 100 : 15) * 1024 * 1024 * 1024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  };

  const refreshUser = async () => {
    if (auth?.currentUser) {
      const profile = await fetchUserProfile(auth.currentUser);
      setUser(profile);
    }
  };

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const profile = await fetchUserProfile(fbUser);
          setUser(profile);
        } catch (err) {
          console.error('Error fetching Firestore user profile:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const loggedIn = await AuthService.login(email, pass);
      setUser(loggedIn);
      return loggedIn;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    await AuthService.logout();
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role: user?.role || 'user',
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
