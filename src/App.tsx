import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TabType, UserProfile, Room, RoomMember, AudioVolumes, SoundscapeTrack, ThemeMode, BackgroundSceneId } from './types';
import { soundEngine } from './utils/audio';
import { getStoredThemeMode, applyThemeMode } from './utils/themes';
import { CURATED_SOUNDSCAPES, DEFAULT_SOUNDSCAPE } from './utils/soundscapes';
import { Sidebar } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { FocusPlanModal } from './components/FocusPlanModal';
import { SectionTip } from './components/SectionTip';
import { MobileDesktopNoticePopup } from './components/MobileDesktopNoticePopup';
import { LegalModal, LegalType } from './components/LegalModals';
import { ShareProfileModal } from './components/ShareProfileModal';
import { YouTubeAmbientPlayer } from './components/YouTubeAmbientPlayer';
import { StudyTableBackground } from './components/StudyTableBackground';
import { BonfireBackground } from './components/BonfireBackground';
import { LoungeView } from './views/LoungeView';
import { ZenModeView } from './views/ZenModeView';
import { TrackerView } from './views/TrackerView';
import { EnvironmentView } from './views/EnvironmentView';
import { MentorView } from './views/MentorView';
import { QuizzesView } from './views/QuizzesView';
import { LeaderboardView } from './views/LeaderboardView';
import { ProfileView } from './views/ProfileView';

import { useFirebase } from './hooks/useFirebase';
import { createSanctuaryRoom, findRoomByCode, auth, subscribeZenModePresence, setZenModePresence } from './lib/firebase';

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

const GUEST_USER: UserProfile = getInitialGuestUser();

export const App: React.FC = () => {
  // Room Ecosystem
  const [activeRoom, setActiveRoom] = useState<Room>({
    id: 'public_lounge',
    name: 'Global Lounge',
    code: 'GLOBAL',
    isPrivate: false,
    memberCount: 1,
    description: 'The open sanctuary where global souls concentrate in silent camaraderie.'
  });

  // Firebase Auth, Presence & Firestore Hook (scoped to activeRoom)
  const {
    user,
    isAfk,
    liveMembers,
    signInWithGoogle,
    updateUser,
    logFocusSession,
    sessionRecords,
    sessionsByDate,
    loadingSessions
  } = useFirebase(GUEST_USER, activeRoom.id);

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem('zenbonfire_onboarded');
    } catch {
      return false;
    }
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Navigation tab with localStorage persistence
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    try {
      const saved = localStorage.getItem('zenbonfire_current_tab') as TabType;
      const validTabs: TabType[] = ['lounge', 'tracker', 'environment', 'mentor', 'quizzes', 'leaderboard', 'profile'];
      if (saved && validTabs.includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'lounge';
  });
  const [isZenModeActive, setIsZenModeActive] = useState(false);
  // Real authenticated users present in Zen Mode from Firestore
  const [zenMembers, setZenMembers] = useState<RoomMember[]>([]);
  // Raw Video mode (unblurred, crisp natural video for best eye performance)
  const [isRawVideo, setIsRawVideo] = useState(true);

  // Subscribe to real-time authenticated users in Zen Sanctuary from Firestore
  useEffect(() => {
    const unsub = subscribeZenModePresence((members) => {
      setZenMembers(members);
    });
    return () => unsub();
  }, []);

  // Synchronize authenticated user presence when in Zen Sanctuary
  useEffect(() => {
    if (isZenModeActive && auth.currentUser) {
      setZenModePresence(auth.currentUser.uid, true, activeRoom.id, user.name, user.avatarId);
      return () => {
        if (auth.currentUser) {
          setZenModePresence(auth.currentUser.uid, false, activeRoom.id, user.name, user.avatarId);
        }
      };
    }
  }, [isZenModeActive, activeRoom.id, user.name, user.avatarId]);

  // Pure real-time members from presence engine merged with current user
  const effectiveMembers = useMemo(() => {
    const currentUid = auth.currentUser?.uid || user.id;
    const memberMap = new Map<string, RoomMember>();

    // 1. Always include self first with up-to-date state
    memberMap.set(currentUid, {
      id: currentUid,
      name: user.name || 'You',
      avatarId: user.avatarId || 'boy1',
      status: isAfk ? '[AFK / Away]' : (user.status || 'Deep Focus'),
      isAfk,
      focusMinutesToday: user.todayMinutes || 0,
      isSelf: true,
      streak: user.streak,
      totalHours: user.totalFocusHours,
      currentTask: isAfk ? '[AFK / Away]' : (user.status || 'Deep Focus'),
      lastSeen: new Date().toISOString()
    });

    // 2. Add real-time peers from Firestore presence without duplicating self
    const now = Date.now();
    liveMembers.forEach((m) => {
      if (m.id === currentUid || m.isSelf) {
        // Self is already accurately represented
      } else {
        const lastSeenMs = m.lastSeen ? new Date(m.lastSeen).getTime() : 0;
        const isAwayLongTime = m.isAfk
          ? (!lastSeenMs || (now - lastSeenMs) > 2 * 60 * 1000)
          : (lastSeenMs > 0 && (now - lastSeenMs) > 3 * 60 * 1000);

        if (!isAwayLongTime) {
          memberMap.set(m.id, {
            ...m,
            isSelf: false
          });
        }
      }
    });

    return Array.from(memberMap.values());
  }, [liveMembers, user, isAfk]);

  // Audio Mixer State with localStorage persistence
  const [audioVolumes, setAudioVolumes] = useState<AudioVolumes>(() => {
    try {
      const saved = localStorage.getItem('zenbonfire_audio_volumes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          typeof parsed.rain === 'number' &&
          typeof parsed.fire === 'number' &&
          typeof parsed.music === 'number' &&
          typeof parsed.master === 'number'
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      rain: 0.65,
      fire: 0.45,
      music: 0.3,
      master: 0.8
    };
  });

  // Timer State
  const [initialMinutes, setInitialMinutes] = useState(50);
  const [timerMinutes, setTimerMinutes] = useState(50);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseLabel, setPhaseLabel] = useState('DEEP WORK PHASE');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Modals & Tips
  const [legalModalType, setLegalModalType] = useState<LegalType>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Section tips seen tracking
  const [seenTabs, setSeenTabs] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('zenbonfire_seen_tips');
    return saved ? JSON.parse(saved) : {};
  });

  // YouTube Ambient Audio Engine State
  const [activeSoundscape, setActiveSoundscape] = useState<SoundscapeTrack>(() => {
    const savedId = localStorage.getItem('zenbonfire_soundscape_id');
    const found = CURATED_SOUNDSCAPES.find((s) => s.id === savedId);
    return found || DEFAULT_SOUNDSCAPE;
  });
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);
  const [youTubeVolume, setYouTubeVolume] = useState(() => {
    const saved = localStorage.getItem('zenbonfire_yt_volume');
    return saved ? parseFloat(saved) : 0.65;
  });
  const [isYouTubeMuted, setIsYouTubeMuted] = useState(false);

  // Theme Mode (Light / Dark / System Default)
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);

  // Sanctuary Background Scene (Study Desk vs Bonfire Hearth)
  const [backgroundScene, setBackgroundScene] = useState<BackgroundSceneId>(() => {
    const saved = localStorage.getItem('zenbonfire_background_scene');
    return saved === 'bonfire-hearth' ? 'bonfire-hearth' : 'study-desk';
  });

  const handleBackgroundSceneChange = (scene: BackgroundSceneId) => {
    setBackgroundScene(scene);
    localStorage.setItem('zenbonfire_background_scene', scene);
    triggerToast(
      `Background: ${scene === 'study-desk' ? 'Rainy Study Desk Sanctuary' : 'Crackling Bonfire Sanctuary'}`
    );
  };

  // Zen Mode Video Ref for reliable autoplay
  const zenVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isZenModeActive && zenVideoRef.current) {
      zenVideoRef.current.play().catch(() => {});
    }
  }, [isZenModeActive]);

  useEffect(() => {
    applyThemeMode(themeMode);
  }, [themeMode]);

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    applyThemeMode(mode);
    triggerToast(`Theme set to ${mode === 'system' ? 'System Default' : mode.toUpperCase()}`);
  };

  // Update audio engine on volume changes and persist
  useEffect(() => {
    soundEngine.setVolumes(audioVolumes);
    try {
      localStorage.setItem('zenbonfire_audio_volumes', JSON.stringify(audioVolumes));
    } catch {
      // ignore
    }
  }, [audioVolumes]);

  // Tab visibility and exit lifecycle: Turn audio off on switch/close/exit, turn on only when visiting
  const [isAppActive, setIsAppActive] = useState(() =>
    typeof document !== 'undefined' ? !document.hidden : true
  );

  useEffect(() => {
    const handleVisibility = () => {
      const active = typeof document !== 'undefined' ? !document.hidden : true;
      setIsAppActive(active);
      soundEngine.setVisibility(active);
    };

    const handleExit = () => {
      setIsAppActive(false);
      soundEngine.setVisibility(false);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleExit);
    window.addEventListener('beforeunload', handleExit);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleExit);
      window.removeEventListener('beforeunload', handleExit);
    };
  }, []);

  // Master Timer countdown loop
  const timerRef = useRef<number | null>(null);
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds((prevSec) => {
          if (prevSec > 0) {
            return prevSec - 1;
          } else {
            setTimerMinutes((prevMin) => {
              if (prevMin > 0) {
                return prevMin - 1;
              } else {
                // Timer completed
                setIsRunning(false);
                setIsZenModeActive(false);
                logFocusSession(initialMinutes, phaseLabel).then((res) => {
                  if (res?.targetMet) {
                    triggerToast(`4-Hour Daily Goal Met! Streak incremented to ${res.newStreak} Days! 🔥`);
                  } else {
                    triggerToast('Session Accomplished. Focus logged in your Heatmap.');
                  }
                });
                return 0;
              }
            });
            return 59;
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Save user profile to Firebase & localStorage and complete onboarding
  const handleSaveUser = (updated: UserProfile) => {
    updateUser(updated);
    localStorage.setItem('zenbonfire_onboarded', 'true');
    setIsOnboarded(true);
    setIsOnboardingOpen(false);
    triggerToast(`Welcome to the Sanctuary, ${updated.name}.`);
  };

  const handleGoogleSignInFromAuth = async () => {
    const profile = await signInWithGoogle();
    if (profile) {
      localStorage.setItem('zenbonfire_onboarded', 'true');
      setIsOnboarded(true);
      setIsOnboardingOpen(false);
      triggerToast(`Welcome back, ${profile.name}.`);
    }
    return profile;
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Robust currentTab state handler ensuring seamless view switching
  const handleSelectTab = useCallback((tab: TabType) => {
    if (isZenModeActive) {
      setIsZenModeActive(false);
    }
    setIsPlanModalOpen(false);
    setIsShareModalOpen(false);
    setCurrentTab(tab);
    try {
      localStorage.setItem('zenbonfire_current_tab', tab);
    } catch {
      // ignore
    }
  }, [isZenModeActive]);

  const handleDismissTip = (tab: TabType) => {
    const updated = { ...seenTabs, [tab]: true };
    setSeenTabs(updated);
    localStorage.setItem('zenbonfire_seen_tips', JSON.stringify(updated));
  };

  const handleResetCurrentTip = () => {
    const updated = { ...seenTabs, [currentTab]: false };
    setSeenTabs(updated);
  };

  // Plan Approval Flow - sets timer and starts directly into Zen Sanctuary
  const handleApprovePlan = (minutes: number, phase: string) => {
    setInitialMinutes(minutes);
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setPhaseLabel(phase);
    setIsRunning(true);
    setIsPlanModalOpen(false);
    setIsZenModeActive(true);
    triggerToast('Plan Approved. Sanctuary Ready.');
  };

  // Enter Zen Sanctuary Flow (Mandatory to initiate or resume the timer)
  const handleEnterZenMode = () => {
    const currentTotal = timerMinutes * 60 + timerSeconds;
    const initialTotal = initialMinutes * 60;
    const isResuming = currentTotal < initialTotal;

    setIsRunning(true);
    setIsZenModeActive(true);
    if (auth.currentUser) {
      setZenModePresence(auth.currentUser.uid, true, activeRoom.id, user.name, user.avatarId);
    }
    triggerToast(
      isResuming
        ? `Resuming session at ${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}...`
        : 'Sanctuary Ready. Session initiated.'
    );
  };

  // Exit Zen Sanctuary Flow - Sync & pause timer perfectly so user can change music or check lounge
  const handleExitZen = () => {
    setIsRunning(false); // PAUSE TIMER - Timer only runs while in Zen Mode!
    setIsZenModeActive(false);
    if (auth.currentUser) {
      setZenModePresence(auth.currentUser.uid, false, activeRoom.id, user.name, user.avatarId);
    }
    const formatted = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;
    triggerToast(`Focus session paused at ${formatted}. Re-enter Zen Sanctuary to resume.`);
  };

  // Reset timer back to beginning of active plan
  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerMinutes(initialMinutes);
    setTimerSeconds(0);
    triggerToast(`Timer reset to ${initialMinutes}:00.`);
  };

  // Finish / Complete active session
  const handleFinishSession = async () => {
    setIsRunning(false);
    setIsZenModeActive(false);
    if (auth.currentUser) {
      setZenModePresence(auth.currentUser.uid, false, activeRoom.id, user.name, user.avatarId);
    }
    const elapsedMinutes = Math.max(1, initialMinutes - timerMinutes);
    const res = await logFocusSession(elapsedMinutes, phaseLabel);
    setTimerMinutes(initialMinutes);
    setTimerSeconds(0);
    if (res.targetMet) {
      triggerToast(`4-Hour Daily Goal Met! Streak incremented to ${res.newStreak} Days! 🔥`);
    } else {
      triggerToast('Session Accomplished. Focus logged in your Heatmap.');
    }
  };

  // Create Private Room Flow (Firestore Real-time)
  const handleCreateRoom = async () => {
    const newRoom = await createSanctuaryRoom('Private Sanctuary', true);
    setActiveRoom(newRoom);
    triggerToast(`Room Created: ${newRoom.code}. Share code to study together.`);
  };

  // Join Room Flow (Firestore Real-time)
  const handleJoinRoom = async (code: string) => {
    const room = await findRoomByCode(code);
    if (room) {
      setActiveRoom(room);
      triggerToast(`Entered Room: ${room.code}. Real-time presence linked.`);
    }
  };

  // Daily 4-Hour Goal calculation
  const fourHourGoalMinutes = user.dailyGoalHours * 60; // 240m
  const fourHourProgressPercent = Math.min(
    100,
    Math.round((user.todayMinutes / fourHourGoalMinutes) * 100)
  );

  // First screen for new / unauthenticated users: Auth Page
  if (!isOnboarded && !auth.currentUser) {
    return (
      <div className="min-h-screen w-screen bg-[#090D16] text-[#F8FAFC]">
        <OnboardingModal
          isOpen={true}
          isFirstScreen={true}
          currentUser={user}
          onSave={handleSaveUser}
          onGoogleSignIn={handleGoogleSignInFromAuth}
        />
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#162032] to-[#0F172A] border border-white/20 text-[#F8FAFC] text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 fade-in flex items-center gap-2 font-qurova">
            <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen w-screen text-[var(--zen-cream)] font-sans antialiased overflow-hidden relative isolate ${
        isZenModeActive ? 'bg-transparent' : 'bg-[var(--zen-bg)]'
      }`}
    >
      {/* Invisible 10-Hour YouTube Ambient Audio Engine */}
      <YouTubeAmbientPlayer
        activeTrack={activeSoundscape}
        isPlaying={isYouTubePlaying && isAppActive}
        volume={youTubeVolume}
        isMuted={isYouTubeMuted || !isAppActive}
        onError={(err) => console.log('YouTube stream event:', err)}
      />
      {/* Strictly for Zen Mode Only: Fullscreen Bonfire Video Background (Raw crystal-clear video for best eye performance) */}
      {isZenModeActive && (
        <div
          className="fixed inset-0 pointer-events-none select-none overflow-hidden"
          style={{ zIndex: -1 }}
          aria-hidden="true"
        >
          {/* 1. Fixed Fullscreen Bonfire Video played crisp and unblurred */}
          <video
            ref={zenVideoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/zen-bonfire-poster.jpg"
            className="w-full h-full object-cover object-bottom"
          >
            <source src="/videos/zen-bonfire.mp4" type="video/mp4" />
            <source src="/videos/zen-bonfire.webm" type="video/webm" />
            <img
              src="/videos/zen-bonfire-poster.jpg"
              alt="Zen bonfire atmosphere"
              className="w-full h-full object-cover object-bottom"
            />
          </video>

          {/* 2. If Raw Video is OFF, subtle neutral contrast vignette only (no blur, no blue tint) */}
          {!isRawVideo && (
            <div className="absolute inset-0 bg-radial from-transparent via-black/25 to-black/65 transition-opacity duration-500 pointer-events-none" />
          )}
        </div>
      )}

      {/* Zen Mode View (Fullscreen, hiding all bars) */}
      {isZenModeActive ? (
        <ZenModeView
          initialMinutes={initialMinutes}
          timerMinutes={timerMinutes}
          timerSeconds={timerSeconds}
          isRunning={isRunning}
          phaseLabel={phaseLabel}
          fourHourProgressPercent={fourHourProgressPercent}
          members={effectiveMembers}
          zenMembers={zenMembers}
          currentUser={user}
          audioVolumes={audioVolumes}
          activeSoundscape={activeSoundscape}
          onSelectSoundscape={(track) => {
            setActiveSoundscape(track);
            localStorage.setItem('zenbonfire_soundscape_id', track.id);
            triggerToast(`Selected: ${track.title}`);
          }}
          isRawVideo={isRawVideo}
          onToggleRawVideo={() => {
            setIsRawVideo((prev) => !prev);
            triggerToast(isRawVideo ? 'Raw: OFF' : 'Raw: ON');
          }}
          onAudioChange={setAudioVolumes}
          onToggleTimer={() => setIsRunning(!isRunning)}
          onSkipTimer={() => {
            setTimerMinutes(5);
            setTimerSeconds(0);
            setPhaseLabel('REST PHASE');
            triggerToast('Rest Phase Initiated. Recharge your intellect.');
          }}
          onFinishSession={handleFinishSession}
          onExitZen={handleExitZen}
        />
      ) : (
        /* Regular 6-Tab View */
        <div className="flex w-full h-full relative overflow-hidden">
          {/* Main living atmospheric background rendered globally behind ALL pages */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {backgroundScene === 'bonfire-hearth' ? (
              <div className="absolute inset-0 opacity-85 transition-opacity duration-700">
                <BonfireBackground />
              </div>
            ) : (
              <StudyTableBackground darkness="normal" />
            )}
            {/* Liquid glass vignette and ambient depth gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090D16]/90 via-transparent to-[#090D16]/50 pointer-events-none" />
          </div>

          {/* Main Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            user={user}
            isAfk={isAfk}
            onOpenLegal={(type) => setLegalModalType(type)}
            onOpenTip={handleResetCurrentTip}
          />

          {/* Current Tab Screen View with Liquid Glass */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
            <div
              key={currentTab}
              className="w-full h-full flex flex-col overflow-hidden"
            >
                {currentTab === 'lounge' && (
                  <LoungeView
                    user={user}
                    isAfk={isAfk}
                    backgroundScene={backgroundScene}
                    activeRoom={activeRoom}
                    members={effectiveMembers}
                    currentTab={currentTab}
                    onSelectTab={handleSelectTab}
                    initialMinutes={initialMinutes}
                    timerMinutes={timerMinutes}
                    timerSeconds={timerSeconds}
                    isRunning={isRunning}
                    phaseLabel={phaseLabel}
                    fourHourProgressPercent={fourHourProgressPercent}
                    audioVolumes={audioVolumes}
                    onAudioChange={setAudioVolumes}
                    onOpenPlanModal={() => setIsPlanModalOpen(true)}
                    onEnterZenMode={handleEnterZenMode}
                    onResetTimer={handleResetTimer}
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    onUpdateStatus={(newStatus) => {
                      updateUser({ ...user, status: newStatus });
                      triggerToast(`Status updated to: [${newStatus}]`);
                    }}
                  />
                )}

                {currentTab === 'tracker' && (
                  <TrackerView user={user} />
                )}

                {currentTab === 'environment' && (
                  <EnvironmentView
                    volumes={audioVolumes}
                    onChange={setAudioVolumes}
                    activeSoundscape={activeSoundscape}
                    isYouTubePlaying={isYouTubePlaying}
                    youTubeVolume={youTubeVolume}
                    isYouTubeMuted={isYouTubeMuted}
                    onToggleYouTubePlay={() => setIsYouTubePlaying((prev) => !prev)}
                    onSetYouTubeVolume={(vol) => {
                      setYouTubeVolume(vol);
                      localStorage.setItem('zenbonfire_yt_volume', vol.toString());
                    }}
                    onToggleYouTubeMute={() => setIsYouTubeMuted((prev) => !prev)}
                    onSelectSoundscape={(track) => {
                      setActiveSoundscape(track);
                      localStorage.setItem('zenbonfire_soundscape_id', track.id);
                      triggerToast(`Selected: ${track.title}`);
                    }}
                    onSetCustomYouTubeUrl={(url) => {
                      const customTrack: SoundscapeTrack = {
                        id: 'custom-' + Date.now(),
                        title: 'Custom Ambient Stream',
                        category: 'Rain & Storm',
                        youtubeUrl: url,
                        description: 'Custom YouTube ambient audio stream playing in background.',
                        badge: 'Custom URL',
                        durationLabel: 'Custom'
                      };
                      setActiveSoundscape(customTrack);
                      triggerToast('Custom YouTube stream active');
                    }}
                  />
                )}

                {currentTab === 'mentor' && <MentorView />}

                {currentTab === 'quizzes' && <QuizzesView />}

                {currentTab === 'leaderboard' && (
                  <LeaderboardView currentUser={user} />
                )}

                {currentTab === 'profile' && (
                  <ProfileView
                    user={user}
                    themeMode={themeMode}
                    backgroundScene={backgroundScene}
                    sessionsByDate={sessionsByDate}
                    sessionRecords={sessionRecords}
                    loadingSessions={loadingSessions}
                    onUpdateUser={updateUser}
                    onOpenShareModal={() => setIsShareModalOpen(true)}
                    onOpenLogin={() => setIsOnboardingOpen(true)}
                    onThemeModeChange={handleThemeModeChange}
                    onBackgroundSceneChange={handleBackgroundSceneChange}
                  />
                )}
            </div>

            {/* Small pop up tips for each section on first click */}
            <SectionTip
              currentTab={currentTab}
              seenTabs={seenTabs}
              onDismiss={handleDismissTip}
            />
          </div>
        </div>
      )}

      {/* Focus Plan Selection Modal */}
      <FocusPlanModal
        isOpen={isPlanModalOpen}
        currentMinutes={timerMinutes}
        currentPhase={phaseLabel}
        onClose={() => setIsPlanModalOpen(false)}
        onApprove={handleApprovePlan}
      />

      {/* Aesthetic Onboarding / Login Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentUser={user}
        onSave={handleSaveUser}
        onGoogleSignIn={handleGoogleSignInFromAuth}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Legal & Governance Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Shareable Profile Modal */}
      <ShareProfileModal
        user={user}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* First-time visitor mobile desktop mode advice popup */}
      <MobileDesktopNoticePopup />

      {/* High-fidelity Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#162032] to-[#0F172A] border border-white/20 text-[#F8FAFC] text-xs font-semibold shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 fade-in flex items-center gap-2 font-qurova">
          <span className="w-2 h-2 rounded-full bg-[#0EA5E9] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default App;
