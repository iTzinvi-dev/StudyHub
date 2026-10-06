import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  getDocFromServer,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { getDatabase, ref, onValue, set, onDisconnect } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, RoomMember, Room } from '../types';

// 1. Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Firestore explicitly with the configured firestoreDatabaseId
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// 3. Initialize Firebase Auth with Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 4. Initialize Realtime Database for Presence Engine
let rtdbInstance: ReturnType<typeof getDatabase> | null = null;
const candidateRtdbUrls = [
  (firebaseConfig as any).databaseURL,
  `https://${firebaseConfig.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`,
  `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`,
  `https://${firebaseConfig.projectId}.firebaseio.com`
].filter(Boolean);

for (const candidateUrl of candidateRtdbUrls) {
  try {
    const inst = getDatabase(app, candidateUrl);
    if (inst) {
      rtdbInstance = inst;
      break;
    }
  } catch {
    // try next candidate URL
  }
}
if (!rtdbInstance) {
  try {
    rtdbInstance = getDatabase(app);
  } catch {
    // optional RTDB fallback
  }
}
export const rtdb = rtdbInstance;

// 5. Error Handling adhering to Firebase Skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  shouldThrow = true
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  if (shouldThrow) {
    throw new Error(JSON.stringify(errInfo));
  }
}

// 6. Test Firestore Connection on Boot
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, check network connection.');
    }
  }
}

// 7. Google Sign-In & Profile Sync with Race-Condition Guard
const inFlightProfileCreations = new Map<string, Promise<UserProfile>>();

export async function signInWithGoogle(): Promise<UserProfile | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    return await getOrCreateUserProfile(fbUser);
  } catch (error) {
    console.error('Google Sign-in failed:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  try {
    if (auth.currentUser) {
      await updatePresence(auth.currentUser.uid, '[AFK / Away]', true, 'public_lounge');
    }
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

/**
 * Reliably checks if a user document exists in Cloud Firestore (users collection)
 * upon login and creates it with default fields (uid, name, defaultAvatar, bio, currentStatus, totalHours, currentStreak)
 * if it does not.
 * Protected with in-flight mutex to prevent race conditions during asynchronous profile creation.
 */
export async function getOrCreateUserProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const existingPromise = inFlightProfileCreations.get(fbUser.uid);
  if (existingPromise) {
    return await existingPromise;
  }

  const creationPromise = (async () => {
    const userRef = doc(db, 'users', fbUser.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: fbUser.uid,
          name: data.name || fbUser.displayName || 'Focus Scholar',
          username: data.username || (fbUser.displayName ? fbUser.displayName.toLowerCase().replace(/\s+/g, '_') : 'scholar_' + fbUser.uid.slice(0, 5)),
          bio: data.bio || 'Deliberate 4-hour cognitive craft in the sanctuary.',
          gender: data.gender || 'non-binary',
          avatarId: data.defaultAvatar || data.avatarId || 'boy1',
          status: data.currentStatus || '[Studying]',
          streak: data.currentStreak ?? 0,
          freezeTickets: data.freezeTickets ?? 2,
          totalFocusHours: data.totalHours ?? 0,
          dailyGoalHours: data.dailyGoalHours ?? 4,
          todayMinutes: data.todayMinutes ?? 0,
          createdAt: data.createdAt || new Date().toISOString()
        };
      } else {
        // First login: create document with the required default fields
        const newProfileDoc = {
          uid: fbUser.uid,
          name: fbUser.displayName || 'Focus Scholar',
          username: fbUser.displayName ? fbUser.displayName.toLowerCase().replace(/\s+/g, '_') : 'scholar_' + fbUser.uid.slice(0, 5),
          email: fbUser.email || '',
          defaultAvatar: 'boy1',
          bio: 'Deliberate 4-hour cognitive craft in the sanctuary.',
          currentStatus: '[Studying]',
          totalHours: 0,
          currentStreak: 0,
          gender: 'non-binary',
          freezeTickets: 2,
          todayMinutes: 0,
          dailyGoalHours: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfileDoc);
        return {
          id: fbUser.uid,
          name: newProfileDoc.name,
          username: newProfileDoc.username,
          bio: newProfileDoc.bio,
          gender: 'non-binary',
          avatarId: 'boy1',
          status: newProfileDoc.currentStatus,
          streak: 0,
          freezeTickets: 2,
          totalFocusHours: 0,
          dailyGoalHours: 4,
          todayMinutes: 0,
          createdAt: newProfileDoc.createdAt
        };
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${fbUser.uid}`, false);
      throw error;
    }
  })();

  inFlightProfileCreations.set(fbUser.uid, creationPromise);
  try {
    return await creationPromise;
  } finally {
    inFlightProfileCreations.delete(fbUser.uid);
  }
}

export async function updateUserInFirestore(uid: string, updates: Partial<UserProfile>): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.username ? { username: updates.username } : {}),
      ...(updates.bio ? { bio: updates.bio } : {}),
      ...(updates.gender ? { gender: updates.gender } : {}),
      ...(updates.status ? { currentStatus: updates.status } : {}),
      ...(updates.avatarId ? { defaultAvatar: updates.avatarId } : {}),
      ...(updates.totalFocusHours !== undefined ? { totalHours: updates.totalFocusHours } : {}),
      ...(updates.streak !== undefined ? { currentStreak: updates.streak } : {}),
      ...(updates.todayMinutes !== undefined ? { todayMinutes: updates.todayMinutes } : {}),
      ...(updates.freezeTickets !== undefined ? { freezeTickets: updates.freezeTickets } : {}),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`, false);
  }
}

// Subscribe to current user profile in real-time
export function subscribeUserProfile(uid: string, onUpdate: (user: UserProfile) => void): () => void {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onUpdate({
        id: uid,
        name: data.name || 'Focus Scholar',
        username: data.username || 'focus_soul',
        bio: data.bio || '',
        gender: data.gender || 'non-binary',
        avatarId: data.defaultAvatar || 'boy1',
        status: data.currentStatus || '[Studying]',
        streak: data.currentStreak || 0,
        freezeTickets: data.freezeTickets || 2,
        totalFocusHours: data.totalHours || 0,
        dailyGoalHours: data.dailyGoalHours || 4,
        todayMinutes: data.todayMinutes || 0,
        createdAt: data.createdAt || new Date().toISOString()
      });
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`, false);
  });
}

// 8. Focus Session Logging & Consistency Heatmap
export async function logFocusSession(
  userId: string,
  sessionMinutes: number,
  phase: string = 'DEEP WORK PHASE'
): Promise<{ newTotalHours: number; newStreak: number; targetMet: boolean }> {
  const userRef = doc(db, 'users', userId);
  const sessionCol = collection(db, 'users', userId, 'sessions');

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const hoursAdded = Math.round((sessionMinutes / 60) * 100) / 100;

    // 1. Add session record
    await addDoc(sessionCol, {
      userId,
      minutes: sessionMinutes,
      hours: hoursAdded,
      date: todayStr,
      phase,
      createdAt: new Date().toISOString()
    });

    // 2. Calculate streak & target
    const snap = await getDoc(userRef);
    let currentTotalHours = 0;
    let currentStreak = 0;
    let currentTodayMinutes = 0;

    if (snap.exists()) {
      const data = snap.data();
      currentTotalHours = data.totalHours || 0;
      currentStreak = data.currentStreak || 0;
      currentTodayMinutes = data.todayMinutes || 0;
    }

    const newTotalHours = Math.round((currentTotalHours + hoursAdded) * 10) / 10;
    const newTodayMinutes = currentTodayMinutes + sessionMinutes;

    // Increment currentStreak if 4-hour daily target (240 minutes) is met
    let newStreak = currentStreak;
    let targetMet = false;
    if (newTodayMinutes >= 240 && currentTodayMinutes < 240) {
      newStreak = currentStreak + 1;
      targetMet = true;
    }

    await updateDoc(userRef, {
      totalHours: newTotalHours,
      todayMinutes: newTodayMinutes,
      currentStreak: newStreak,
      updatedAt: new Date().toISOString()
    });

    return { newTotalHours, newStreak, targetMet };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/sessions`, false);
    throw error;
  }
}

export interface FocusSessionRecord {
  id: string;
  minutes: number;
  hours: number;
  date: string;
  phase: string;
  createdAt: string;
}

// Real-time subscription to a user's verified sessions for the Consistency Heatmap directly from Firestore
export function subscribeUserSessions(
  userId: string,
  onUpdate: (sessionsByDate: Record<string, number>, allSessions: FocusSessionRecord[]) => void
): () => void {
  const sessionCol = collection(db, 'users', userId, 'sessions');

  return onSnapshot(sessionCol, (snapshot) => {
    const sessionsByDate: Record<string, number> = {};
    const allSessions: FocusSessionRecord[] = [];

    snapshot.forEach((d) => {
      const data = d.data();
      const date = data.date;
      const hrs = typeof data.hours === 'number'
        ? data.hours
        : (typeof data.minutes === 'number' ? data.minutes / 60 : 0);

      allSessions.push({
        id: d.id,
        minutes: data.minutes || Math.round(hrs * 60),
        hours: Math.round(hrs * 10) / 10,
        date: date || '',
        phase: data.phase || 'DEEP WORK PHASE',
        createdAt: data.createdAt || ''
      });

      if (date) {
        sessionsByDate[date] = Math.round(((sessionsByDate[date] || 0) + hrs) * 10) / 10;
      }
    });

    onUpdate(sessionsByDate, allSessions);
  }, (err) => {
    console.warn('Sessions listener notice:', err.message);
  });
}

// In-memory cache for user stats to power avatar hover-cards with zero lag
const userStatsCache = new Map<string, { streak: number; totalHours: number; todayMinutes: number }>();

export async function fetchUserStats(userId: string): Promise<{ streak: number; totalHours: number; todayMinutes: number }> {
  if (userStatsCache.has(userId)) {
    return userStatsCache.get(userId)!;
  }
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      const data = snap.data();
      const stats = {
        streak: data.currentStreak || 0,
        totalHours: Math.round((data.totalHours || 0) * 10) / 10,
        todayMinutes: data.todayMinutes || 0
      };
      userStatsCache.set(userId, stats);
      return stats;
    }
  } catch (err) {
    console.warn('Error fetching stats for user:', userId, err);
  }
  return { streak: 0, totalHours: 0, todayMinutes: 0 };
}

// 9. Realtime Database Presence Engine using onDisconnect() & VisibilityState
export async function setupRealtimePresence(
  uid: string,
  name: string,
  avatarId: string,
  roomId: string = 'public_lounge'
) {
  // A. Realtime Database onDisconnect() Hook
  if (rtdb) {
    try {
      const connectedRef = ref(rtdb, '.info/connected');
      const userStatusRef = ref(rtdb, `/presence/${uid}`);

      onValue(connectedRef, (snapshot) => {
        if (snapshot.val() === true) {
          // When client disconnects (tab closed, window closed, connection lost):
          onDisconnect(userStatusRef).set({
            uid,
            name,
            state: 'offline',
            status: '[AFK / Away]',
            isAfk: true,
            roomId,
            lastChanged: Date.now()
          });

          // Set online state when connected
          set(userStatusRef, {
            uid,
            name,
            state: 'online',
            status: '[Studying]',
            isAfk: false,
            roomId,
            lastChanged: Date.now()
          });
        }
      });
    } catch (err) {
      console.warn('RTDB presence hook notice:', err);
    }
  }

  // B. Synchronize to Firestore Presence collection for real-time room queries
  try {
    const presenceRef = doc(db, 'presence', uid);
    await setDoc(presenceRef, {
      uid,
      name,
      avatarId,
      status: '[Studying]',
      isAfk: false,
      roomId,
      lastSeen: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore initial presence set notice:', err);
  }
}

// Update presence dynamically when visibility changes (active -> [Studying], hidden/blurred -> [AFK / Away])
export async function updatePresence(
  uid: string,
  status: string,
  isAfk: boolean,
  roomId: string = 'public_lounge',
  name?: string,
  avatarId?: string
) {
  // 1. Update Firestore Realtime Presence
  try {
    const presenceRef = doc(db, 'presence', uid);
    await setDoc(presenceRef, {
      uid,
      name: name || auth.currentUser?.displayName || 'Focus Scholar',
      avatarId: avatarId || 'boy1',
      status: isAfk ? '[AFK / Away]' : status,
      isAfk,
      roomId,
      lastSeen: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore presence update notice:', err);
  }

  // 2. Update Realtime Database presence node
  if (rtdb) {
    try {
      const userStatusRef = ref(rtdb, `/presence/${uid}`);
      set(userStatusRef, {
        uid,
        name: name || auth.currentUser?.displayName || 'Focus Scholar',
        state: isAfk ? 'away' : 'online',
        status: isAfk ? '[AFK / Away]' : status,
        isAfk,
        roomId,
        lastChanged: Date.now()
      });
    } catch {
      // Optional RTDB
    }
  }
}

// Subscribe to real-time presence filtered by room
export function subscribeRoomPresence(
  roomId: string,
  onMembersUpdate: (members: RoomMember[]) => void
): () => void {
  const presenceCol = collection(db, 'presence');
  const q = query(presenceCol, limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: RoomMember[] = [];
    const currentUid = auth.currentUser?.uid;

    snapshot.forEach((d) => {
      const data = d.data();
      const memberRoom = data.roomId || 'public_lounge';
      if (roomId === 'public_lounge' || memberRoom === roomId) {
        list.push({
          id: data.uid,
          name: data.name || 'Focus Scholar',
          avatarId: (data.avatarId || 'boy1') as any,
          status: data.isAfk ? '[AFK / Away]' : (data.status || '[Studying]'),
          isAfk: !!data.isAfk,
          focusMinutesToday: 180,
          isSelf: data.uid === currentUid
        });
      }
    });

    onMembersUpdate(list);
  }, (err) => {
    console.warn('Room presence listener notice:', err.message);
  });
}

// 10. Real-time Leaderboard Data (Real users from Firestore)
export function subscribeLeaderboard(
  onUpdate: (users: Array<{
    rank: number;
    name: string;
    username: string;
    avatarId: any;
    totalHours: number;
    streakDays: number;
    currentStatus: string;
    isCurrentUser: boolean;
  }>) => void
): () => void {
  const usersCol = collection(db, 'users');
  const q = query(usersCol, orderBy('totalHours', 'desc'), limit(30));

  return onSnapshot(q, (snapshot) => {
    const list: any[] = [];
    const currentUid = auth.currentUser?.uid;
    let rank = 1;

    snapshot.forEach((doc) => {
      const d = doc.data();
      list.push({
        rank: rank++,
        name: d.name || 'Sanctuary Scholar',
        username: d.username || (d.name ? d.name.toLowerCase().replace(/\s+/g, '_') : 'scholar_' + doc.id.slice(0, 4)),
        avatarId: d.defaultAvatar || 'boy1',
        totalHours: Math.round((d.totalHours || 0) * 10) / 10,
        streakDays: d.currentStreak || 0,
        currentStatus: d.currentStatus || '[Studying]',
        isCurrentUser: doc.id === currentUid
      });
    });

    onUpdate(list);
  }, (err) => {
    console.warn('Leaderboard listener notice:', err.message);
  });
}

// 11. Real-time Rooms Management
export async function createSanctuaryRoom(
  name: string,
  isPrivate: boolean
): Promise<Room> {
  const code = 'ZEN-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const newRoom: Room = {
    id: `room_${code}`,
    name,
    code,
    isPrivate,
    memberCount: 1,
    description: `Private sanctuary room created by ${auth.currentUser?.displayName || 'Scholar'}.`
  };

  try {
    await setDoc(doc(db, 'rooms', newRoom.id), {
      ...newRoom,
      createdBy: auth.currentUser?.uid || 'guest',
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `rooms/${newRoom.id}`, false);
  }

  return newRoom;
}

export async function findRoomByCode(code: string): Promise<Room | null> {
  try {
    const snap = await getDocFromServer(doc(db, 'rooms', `room_${code.trim().toUpperCase()}`));
    if (snap.exists()) {
      return snap.data() as Room;
    }
  } catch {
    // Check fallback
  }

  return {
    id: `room_${code.toUpperCase()}`,
    name: `Sanctuary [${code.toUpperCase()}]`,
    code: code.toUpperCase(),
    isPrivate: true,
    memberCount: 1,
    description: 'Private focus enclave.'
  };
}
