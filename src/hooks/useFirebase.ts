import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle as fbSignInWithGoogle,
  signOutUser as fbSignOutUser,
  getOrCreateUserProfile,
  updateUserInFirestore,
  subscribeUserProfile,
  logFocusSession as fbLogFocusSession,
  setupRealtimePresence,
  updatePresence,
  subscribeRoomPresence,
  testFirebaseConnection
} from '../lib/firebase';
import { UserProfile, RoomMember } from '../types';

export function useFirebase(defaultUser: UserProfile, activeRoomId: string = 'public_lounge') {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zenbonfire_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });
  const [loading, setLoading] = useState(true);
  const [isAfk, setIsAfk] = useState(false);
  const [liveMembers, setLiveMembers] = useState<RoomMember[]>([]);

  const activeRoomIdRef = useRef(activeRoomId);
  activeRoomIdRef.current = activeRoomId;

  // 1. Validate connection on boot
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  // 2. Auth State Listener & Real-time Profile Sync
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const authUnsub = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        try {
          const profile = await getOrCreateUserProfile(fbUser);
          setUser(profile);
          localStorage.setItem('zenbonfire_user', JSON.stringify(profile));

          // Set up Realtime Database onDisconnect() and initial [Studying] presence
          await setupRealtimePresence(
            fbUser.uid,
            profile.name,
            profile.avatarId,
            activeRoomIdRef.current
          );

          // Real-time synchronization of user document
          profileUnsub = subscribeUserProfile(fbUser.uid, (updatedProfile) => {
            setUser(updatedProfile);
            localStorage.setItem('zenbonfire_user', JSON.stringify(updatedProfile));
          });
        } catch (err) {
          console.error('Failed to sync authenticated user profile:', err);
        }
      }
      setLoading(false);
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // 3. Realtime Database Presence Engine (AFK Radar)
  // onDisconnect() hook + browser visibilityState listener
  // When active: set status to [Studying]. When switching tabs / closing window: set status to [AFK / Away]
  useEffect(() => {
    const currentUid = auth.currentUser?.uid || user.id;

    const handleVisibilityState = () => {
      const hidden = document.visibilityState === 'hidden' || document.hidden;
      setIsAfk(hidden);
      const statusText = hidden ? '[AFK / Away]' : '[Studying]';

      updatePresence(
        currentUid,
        statusText,
        hidden,
        activeRoomIdRef.current,
        user.name,
        user.avatarId
      );
    };

    const handleWindowBlur = () => {
      setIsAfk(true);
      updatePresence(
        currentUid,
        '[AFK / Away]',
        true,
        activeRoomIdRef.current,
        user.name,
        user.avatarId
      );
    };

    const handleWindowFocus = () => {
      setIsAfk(false);
      updatePresence(
        currentUid,
        '[Studying]',
        false,
        activeRoomIdRef.current,
        user.name,
        user.avatarId
      );
    };

    const handleBeforeUnload = () => {
      updatePresence(
        currentUid,
        '[AFK / Away]',
        true,
        activeRoomIdRef.current,
        user.name,
        user.avatarId
      );
    };

    document.addEventListener('visibilitychange', handleVisibilityState);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityState);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user.id, user.name, user.avatarId]);

  // 4. Update presence when room changes
  useEffect(() => {
    const currentUid = auth.currentUser?.uid || user.id;
    updatePresence(
      currentUid,
      isAfk ? '[AFK / Away]' : '[Studying]',
      isAfk,
      activeRoomId,
      user.name,
      user.avatarId
    );
  }, [activeRoomId, isAfk, user.id, user.name, user.avatarId]);

  // 5. Subscribe to Real-time Members Presence in the current Room
  useEffect(() => {
    const unsubscribe = subscribeRoomPresence(activeRoomId, (members) => {
      setLiveMembers(members);
    });
    return () => unsubscribe();
  }, [activeRoomId]);

  // 6. Sign In with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      const profile = await fbSignInWithGoogle();
      if (profile) {
        setUser(profile);
        localStorage.setItem('zenbonfire_user', JSON.stringify(profile));
        localStorage.setItem('zenbonfire_onboarded', 'true');
        await setupRealtimePresence(profile.id, profile.name, profile.avatarId, activeRoomIdRef.current);
      }
      return profile;
    } catch (err) {
      console.error('Google sign-in error:', err);
      throw err;
    }
  }, []);

  // 7. Sign Out
  const signOut = useCallback(async () => {
    await fbSignOutUser();
    setUser(defaultUser);
    localStorage.removeItem('zenbonfire_user');
  }, [defaultUser]);

  // 8. Update User Profile in Real-time
  const updateUser = useCallback(async (updated: UserProfile) => {
    setUser(updated);
    localStorage.setItem('zenbonfire_user', JSON.stringify(updated));
    if (auth.currentUser) {
      await updateUserInFirestore(auth.currentUser.uid, updated);
      await updatePresence(
        auth.currentUser.uid,
        updated.status || '[Studying]',
        isAfk,
        activeRoomIdRef.current,
        updated.name,
        updated.avatarId
      );
    }
  }, [isAfk]);

  // 9. Log Focus Session & Increment Streak on 4-hour Daily Target
  const logFocusSession = useCallback(async (minutes: number, phase: string = 'DEEP WORK PHASE') => {
    const currentUid = auth.currentUser?.uid || user.id;
    let result = {
      newTotalHours: user.totalFocusHours + Math.round((minutes / 60) * 10) / 10,
      newStreak: user.streak,
      targetMet: false
    };

    if (auth.currentUser) {
      try {
        result = await fbLogFocusSession(currentUid, minutes, phase);
      } catch (err) {
        console.warn('Logging session to Firebase error:', err);
      }
    }

    const updatedUser: UserProfile = {
      ...user,
      totalFocusHours: result.newTotalHours,
      streak: result.newStreak,
      todayMinutes: (user.todayMinutes || 0) + minutes
    };
    setUser(updatedUser);
    localStorage.setItem('zenbonfire_user', JSON.stringify(updatedUser));

    return result;
  }, [user]);

  return {
    user,
    loading,
    isAfk,
    liveMembers,
    signInWithGoogle,
    signOut,
    updateUser,
    logFocusSession
  };
}
