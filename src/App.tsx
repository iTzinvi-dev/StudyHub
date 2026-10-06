import React, { useState, useEffect, useRef } from 'react';
import { TabType, UserProfile, Room, RoomMember, AudioVolumes, SoundscapeTrack, ThemeMode, BackgroundSceneId } from './types';
import { soundEngine } from './utils/audio';
import { getStoredThemeMode, applyThemeMode } from './utils/themes';
import { CURATED_SOUNDSCAPES, DEFAULT_SOUNDSCAPE } from './utils/soundscapes';
import { Sidebar } from './components/Sidebar';
import { OnboardingModal } from './components/OnboardingModal';
import { FocusPlanModal } from './components/FocusPlanModal';
import { SectionTip } from './components/SectionTip';
import { LegalModal, LegalType } from './components/LegalModals';
import { ShareProfileModal } from './components/ShareProfileModal';
import { YouTubeAmbientPlayer } from './components/YouTubeAmbientPlayer';
import { LoungeView } from './views/LoungeView';
import { ZenModeView } from './views/ZenModeView';
import { EnvironmentView } from './views/EnvironmentView';
import { MentorView } from './views/MentorView';
import { QuizzesView } from './views/QuizzesView';
import { LeaderboardView } from './views/LeaderboardView';
import { ProfileView } from './views/ProfileView';

import { useFirebase } from './hooks/useFirebase';
import { createSanctuaryRoom, findRoomByCode } from './lib/firebase';

const GUEST_USER: UserProfile = {
  id: 'usr_guest',
  name: 'Focus Scholar',
  username: 'scholar',
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
    logFocusSession
  } = useFirebase(GUEST_USER, activeRoom.id);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !localStorage.getItem('zenbonfire_onboarded');
  });

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<TabType>('lounge');
  const [isZenModeActive, setIsZenModeActive] = useState(false);

  // Pure real-time members from presence engine (no fake data)
  const effectiveMembers = liveMembers;

  // Audio Mixer State
  const [audioVolumes, setAudioVolumes] = useState<AudioVolumes>({
    rain: 0.65,
    fire: 0.45,
    music: 0.3,
    master: 0.8
  });

  // Timer State
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

  // Update audio engine on volume changes
  useEffect(() => {
    soundEngine.setVolumes(audioVolumes);
  }, [audioVolumes]);

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
                triggerToast('Session Complete. Honor your focus.');
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

  // Save user profile to Firebase & localStorage
  const handleSaveUser = (updated: UserProfile) => {
    updateUser(updated);
    localStorage.setItem('zenbonfire_onboarded', 'true');
    setIsOnboardingOpen(false);
    triggerToast(`Welcome to the Sanctuary, ${updated.name}.`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDismissTip = (tab: TabType) => {
    const updated = { ...seenTabs, [tab]: true };
    setSeenTabs(updated);
    localStorage.setItem('zenbonfire_seen_tips', JSON.stringify(updated));
  };

  const handleResetCurrentTip = () => {
    const updated = { ...seenTabs, [currentTab]: false };
    setSeenTabs(updated);
  };

  // Plan Approval Flow
  const handleApprovePlan = (minutes: number, phase: string) => {
    setTimerMinutes(minutes);
    setTimerSeconds(0);
    setPhaseLabel(phase);
    setIsRunning(true);
    setIsPlanModalOpen(false);

    triggerToast('Plan Approved. Sanctuary Ready.');
    setTimeout(() => {
      setIsZenModeActive(true);
    }, 600);
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

  return (
    <div
      className={`flex h-screen w-screen text-[var(--zen-cream)] font-sans antialiased overflow-hidden relative isolate ${
        isZenModeActive ? 'bg-transparent' : 'bg-[var(--zen-bg)]'
      }`}
    >
      {/* Invisible 10-Hour YouTube Ambient Audio Engine */}
      <YouTubeAmbientPlayer
        activeTrack={activeSoundscape}
        isPlaying={isYouTubePlaying}
        volume={youTubeVolume}
        isMuted={isYouTubeMuted}
        onError={(err) => console.log('YouTube stream event:', err)}
      />
      {/* Strictly for Zen Mode Only: Fixed Fullscreen Bonfire Video Background with z-index: -1 */}
      {isZenModeActive && (
        <div
          className="fixed inset-0 pointer-events-none select-none overflow-hidden"
          style={{ zIndex: -1 }}
          aria-hidden="true"
        >
          {/* 1. Fixed Fullscreen Bonfire Video positioned so the bonfire is seen fully / partially */}
          <video
            ref={zenVideoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/videos/zen-bonfire-poster.jpg"
            className="w-full h-full object-cover object-bottom brightness-[0.82] contrast-[1.08]"
          >
            <source src="/videos/zen-bonfire.mp4" type="video/mp4" />
            <source src="/videos/zen-bonfire.webm" type="video/webm" />
            <img
              src="/videos/zen-bonfire-poster.jpg"
              alt="Zen bonfire atmosphere"
              className="w-full h-full object-cover object-bottom"
            />
          </video>

          {/* 2. Background Blur Layer to eliminate harsh flickering and prevent eye irritation */}
          <div className="absolute inset-0 backdrop-blur-[4px] bg-black/35" />

          {/* 3. Golden Zenith Darkening Vignette Overlays for deep cognitive focus & timer contrast */}
          <div className="absolute inset-0 bg-radial from-transparent via-[#060402]/45 to-[#060402]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060402] via-transparent to-[#060402]/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060402]/50 via-transparent to-[#060402]/50" />

          {/* 4. Soft gentle warm ambient hearth glow behind the center timer */}
          <div className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full bg-[radial-gradient(circle,rgba(255,140,20,0.20)_0%,rgba(255,90,10,0.06)_45%,transparent_75%)] blur-3xl pointer-events-none animate-pulse" />
        </div>
      )}

      {/* Zen Mode View (Fullscreen, hiding all bars) */}
      {isZenModeActive ? (
        <ZenModeView
          timerMinutes={timerMinutes}
          timerSeconds={timerSeconds}
          isRunning={isRunning}
          phaseLabel={phaseLabel}
          fourHourProgressPercent={fourHourProgressPercent}
          members={effectiveMembers}
          audioVolumes={audioVolumes}
          onAudioChange={setAudioVolumes}
          onToggleTimer={() => setIsRunning(!isRunning)}
          onSkipTimer={() => {
            setTimerMinutes(5);
            setTimerSeconds(0);
            setPhaseLabel('REST PHASE');
            triggerToast('Rest Phase Initiated. Recharge your intellect.');
          }}
          onFinishSession={async () => {
            setIsRunning(false);
            const res = await logFocusSession(timerMinutes, phaseLabel);
            if (res.targetMet) {
              triggerToast(`4-Hour Daily Goal Met! Streak incremented to ${res.newStreak} Days! 🔥`);
            } else {
              triggerToast('Session Accomplished. Focus logged in your Heatmap.');
            }
            setIsZenModeActive(false);
          }}
          onExitZen={() => setIsZenModeActive(false)}
        />
      ) : (
        /* Regular 6-Tab View */
        <div className="flex w-full h-full">
          {/* Main Sidebar */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            user={user}
            isAfk={isAfk}
            onOpenLegal={(type) => setLegalModalType(type)}
            onOpenTip={handleResetCurrentTip}
          />

          {/* Current Tab Screen View */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative">
            {currentTab === 'lounge' && (
              <LoungeView
                user={user}
                isAfk={isAfk}
                backgroundScene={backgroundScene}
                activeRoom={activeRoom}
                members={effectiveMembers}
                timerMinutes={timerMinutes}
                timerSeconds={timerSeconds}
                isRunning={isRunning}
                phaseLabel={phaseLabel}
                fourHourProgressPercent={fourHourProgressPercent}
                audioVolumes={audioVolumes}
                onAudioChange={setAudioVolumes}
                onOpenPlanModal={() => setIsPlanModalOpen(true)}
                onEnterZenMode={() => {
                  triggerToast('Plan Approved. Sanctuary Ready.');
                  setIsZenModeActive(true);
                  setIsRunning(true);
                }}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
                onUpdateStatus={(newStatus) => {
                  updateUser({ ...user, status: newStatus });
                  triggerToast(`Status updated to: [${newStatus}]`);
                }}
              />
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
                onUpdateUser={updateUser}
                onOpenShareModal={() => setIsShareModalOpen(true)}
                onThemeModeChange={handleThemeModeChange}
                onBackgroundSceneChange={handleBackgroundSceneChange}
              />
            )}

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
        onGoogleSignIn={signInWithGoogle}
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

      {/* High-fidelity Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-[#1A1A00]/95 border border-[#FFD700] text-[#FFFFCC] text-xs font-semibold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
export default App;
