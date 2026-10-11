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
  subscribeUserSessions,
  FocusSessionRecord,
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
  const [sessionRecords, setSessionRecords] = useState<FocusSessionRecord[]>([]);
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, number>>({});
  const [loadingSessions, setLoadingSessions] = useState(false);

  const activeRoomIdRef = useRef(activeRoomId);
  activeRoomIdRef.current = activeRoomId;

  const userRef = useRef(user);
  userRef.current = user;

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

          // Real-time subscription to focus sessions
          setLoadingSessions(true);
          const sessionsUnsub = subscribeUserSessions(fbUser.uid, (byDate, records) => {
            setSessionsByDate(byDate);
            setSessionRecords(records);
            setLoadingSessions(false);
          });

          const origProfileUnsub = profileUnsub;
          profileUnsub = () => {
            if (origProfileUnsub) origProfileUnsub();
            sessionsUnsub();
          };
        } catch (err) {
          console.error('Failed to sync authenticated user profile:', err);
        }
      } else {
        // Guest mode: use local profile and offline-first storage
        const saved = localStorage.getItem('zenbonfire_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(defaultUser);
          }
        } else {
          setUser(defaultUser);
        }
      }
      setLoading(false);
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // 3. Real-time Presence Engine (AFK Radar & Heartbeat)
  useEffect(() => {
    const currentUid = auth.currentUser?.uid || user.id;

    const syncPresence = (hiddenState: boolean) => {
      const u = userRef.current;
      const statusText = hiddenState ? '[AFK / Away]' : (u.status || '[Studying]');
      updatePresence(
        currentUid,
        statusText,
        hiddenState,
        activeRoomIdRef.current,
        u.name,
        u.avatarId,
        {
          todayMinutes: u.todayMinutes,
          streak: u.streak,
          totalFocusHours: u.totalFocusHours,
          currentTask: u.status
        }
      );
    };

    const handleVisibilityState = () => {
      const hidden = document.visibilityState === 'hidden';
      setIsAfk(hidden);
      syncPresence(hidden);
    };

    const handleBeforeUnload = () => {
      syncPresence(true);
    };

    // Immediate presence update
    syncPresence(isAfk);

    // Heartbeat every 40s to keep lastSeen active in room
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        syncPresence(false);
      }
    }, 40000);

    document.addEventListener('visibilitychange', handleVisibilityState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      document.removeEventListener('visibilitychange', handleVisibilityState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user.id, isAfk, activeRoomId]);

  // 4. Update presence on room change
  useEffect(() => {
    const currentUid = auth.currentUser?.uid || user.id;
    updatePresence(
      currentUid,
      isAfk ? '[AFK / Away]' : (user.status || '[Studying]'),
      isAfk,
      activeRoomId,
      user.name,
      user.avatarId,
      {
        todayMinutes: user.todayMinutes,
        streak: user.streak,
        totalFocusHours: user.totalFocusHours,
        currentTask: user.status
      }
    );
  }, [activeRoomId]);

  // 5. Subscribe to Real-time Members Presence in the current Room
  useEffect(() => {
    const myUid = auth.currentUser?.uid || user.id;
    const unsubscribe = subscribeRoomPresence(activeRoomId, (members) => {
      setLiveMembers(members);
    }, myUid);
    return () => unsubscribe();
  }, [activeRoomId, user.id]);

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
    const currentUid = auth.currentUser?.uid || updated.id;
    if (auth.currentUser) {
      await updateUserInFirestore(auth.currentUser.uid, updated);
    }
    await updatePresence(
      currentUid,
      updated.status || '[Studying]',
      isAfk,
      activeRoomIdRef.current,
      updated.name,
      updated.avatarId,
      {
        todayMinutes: updated.todayMinutes,
        streak: updated.streak,
        totalFocusHours: updated.totalFocusHours,
        currentTask: updated.status
      }
    );
  }, [isAfk]);

  // 9. Log Focus Session & Increment Streak on 4-hour Daily Target
  const logFocusSession = useCallback(async (minutes: number, phase: string = 'DEEP WORK PHASE') => {
    const currentUid = auth.currentUser?.uid || user.id;
    const hoursAdded = Math.round((minutes / 60) * 10) / 10;
    const todayStr = new Date().toISOString().split('T')[0];

    let result = {
      newTotalHours: Math.round(((user.totalFocusHours || 0) + hoursAdded) * 10) / 10,
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

    // Optimistically update sessions for instant heatmap responsiveness
    const newRecord: FocusSessionRecord = {
      id: 'sess_' + Date.now(),
      minutes,
      hours: hoursAdded,
      date: todayStr,
      phase,
      createdAt: new Date().toISOString()
    };
    setSessionRecords((prev) => [newRecord, ...prev]);
    setSessionsByDate((prev) => ({
      ...prev,
      [todayStr]: Math.round(((prev[todayStr] || 0) + hoursAdded) * 10) / 10
    }));

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
    logFocusSession,
    sessionRecords,
    sessionsByDate,
    loadingSessions
  };
}
