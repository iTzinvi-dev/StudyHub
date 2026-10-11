import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  signOutUser as fbSignOutUser,
  getOrCreateUserProfile,
  updateUserInFirestore,
  subscribeUserProfile
} from '../lib/firebase';
import { UserProfile } from '../types';

const getInitialGuestUser = (): UserProfile => {
  let guestId = '';
  try {
    guestId = localStorage.getItem('zenbonfire_guest_uid') || '';
    if (!guestId || guestId === 'usr_guest' || guestId === 'guest_me') {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('zenbonfire_guest_uid', guestId);
    }
  } catch {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
  }
  return {
    id: guestId,
    name: 'Focus Scholar',
    username: 'scholar_' + guestId.slice(-4),
    bio: 'Deliberate 4-hour cognitive craft in the sanctuary.',
    gender: 'non-binary',
    avatarId: 'boy1',
    status: 'Deep Focus',
    streak: 0,
    freezeTickets: 2,
    totalFocusHours: 0,
    dailyGoalHours: 4,
    todayMinutes: 0,
    createdAt: new Date().toISOString()
  };
};

export interface AuthContextType {
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  updateUser: (updated: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const defaultGuest = useMemo(() => getInitialGuestUser(), []);

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('zenbonfire_user');
      return saved ? JSON.parse(saved) : defaultGuest;
    } catch {
      return defaultGuest;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      setFirebaseUser(fbUser);

      if (fbUser) {
        try {
          const profile = await getOrCreateUserProfile(fbUser);
          setUser(profile);
          try {
            localStorage.setItem('zenbonfire_user', JSON.stringify(profile));
          } catch {
            // ignore
          }

          profileUnsub = subscribeUserProfile(fbUser.uid, (updated) => {
            setUser(updated);
            try {
              localStorage.setItem('zenbonfire_user', JSON.stringify(updated));
            } catch {
              // ignore
            }
          });
        } catch (err) {
          console.warn('[AuthContext] Profile sync error:', err);
        }
      } else {
        // Logged-out / Guest mode
        try {
          const saved = localStorage.getItem('zenbonfire_user');
          if (saved) {
            setUser(JSON.parse(saved));
          } else {
            setUser(defaultGuest);
          }
        } catch {
          setUser(defaultGuest);
        }
      }

      setLoading(false);
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, [defaultGuest]);

  const signInWithGoogle = useCallback(async () => {
    try {
      const profile = await fbSignInWithGoogle();
      if (profile) {
        setUser(profile);
        try {
          localStorage.setItem('zenbonfire_user', JSON.stringify(profile));
          localStorage.setItem('zenbonfire_onboarded', 'true');
        } catch {
          // ignore
        }
      }
      return profile;
    } catch (err) {
      console.error('[AuthContext] Google sign-in failed:', err);
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOutUser();
    setFirebaseUser(null);
    setUser(defaultGuest);
    try {
      localStorage.removeItem('zenbonfire_user');
    } catch {
      // ignore
    }
  }, [defaultGuest]);

  const updateUser = useCallback(async (updated: UserProfile) => {
    setUser(updated);
    try {
      localStorage.setItem('zenbonfire_user', JSON.stringify(updated));
    } catch {
      // ignore
    }
    if (auth.currentUser) {
      await updateUserInFirestore(auth.currentUser.uid, updated);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      firebaseUser,
      loading,
      isAuthenticated: !!firebaseUser,
      signInWithGoogle,
      signOut,
      updateUser
    }),
    [user, firebaseUser, loading, signInWithGoogle, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
